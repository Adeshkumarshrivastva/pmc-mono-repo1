// One-off migration: copies every real document out of the standalone
// academy-demo's own MongoDB ("pmc-academy") into pmc-mono-repo's own
// database (apps/server's DATABASE_URL), in the shape apps/server's Prisma
// schema expects (see apps/server/prisma/schema.prisma — AcademyCourse,
// Enrollment, CourseMaterial, Purchase, QuizAttempt, CourseCertificate).
//
// Run once with: node scripts/migrate-to-main-db.js
// Safe to re-run: every insert is upserted by a deterministic key, so a
// second run updates in place instead of duplicating.
//
// What this does NOT migrate, on purpose:
// - Otp — one-time codes, meaningless once expired.
// - User/password — the main app's login is better-auth (phone OTP, see
//   apps/server/src/lib/auth.ts), a different scheme entirely. Each legacy
//   academy user is instead kept as `legacy:<their old _id>`, the same
//   `identity` shape Purchase/QuizAttempt already use for guests — so their
//   purchases/attempts/enrollments survive the move without inventing a
//   merged account on their behalf. Enrollment.userId gets the same
//   treatment.

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { MongoClient, ObjectId } = require('mongodb')
const { Client: MinioClient } = require('minio')

const SOURCE_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pmc-academy'
// apps/server's own .env — read directly so this script doesn't need its
// own copy of the connection string.
const SERVER_ENV_PATH = path.join(__dirname, '..', '..', '..', 'server', '.env')
const SERVER_ENV = fs.readFileSync(SERVER_ENV_PATH, 'utf8')
const TARGET_URI = SERVER_ENV.match(/^DATABASE_URL=(.*)$/m)[1].trim()
const S3_BUCKET = SERVER_ENV.match(/^S3_BUCKET=(.*)$/m)[1].trim()
const S3_REGION = SERVER_ENV.match(/^S3_REGION=(.*)$/m)[1].trim()
const S3_ACCESS_KEY = SERVER_ENV.match(/^S3_ACCESS_KEY=(.*)$/m)[1].trim()
const S3_SECRET_KEY = SERVER_ENV.match(/^S3_SECRET_KEY=(.*)$/m)[1].trim()

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

const COURSE_TYPE_BY_COLLECTION = {
  webinars: 'WEBINAR',
  onlinecourses: 'ONLINE_COURSE',
  hybridcourses: 'HYBRID_COURSE',
  onlineclasses: 'ONLINE_CLASS',
  offlinecourses: 'OFFLINE_COURSE',
}

const LEVEL_MAP = {
  Beginner: 'BEGINNER',
  Intermediate: 'INTERMEDIATE',
  Advanced: 'ADVANCED',
  'All Levels': 'ALL_LEVELS',
}

// Enrollment.courseType is stored as the URL slug the academy-demo frontend
// used ("hybrid-course"), not a collection name — same slugs as
// apps/server's COURSE_TYPE_BY_SLUG (academy.input.ts).
const COURSE_TYPE_BY_SLUG = {
  'webinar': 'WEBINAR',
  'online-course': 'ONLINE_COURSE',
  'hybrid-course': 'HYBRID_COURSE',
  'online-class': 'ONLINE_CLASS',
  'offline-course': 'OFFLINE_COURSE',
}

function legacyIdentity(mongoId) {
  return `legacy:${mongoId.toString()}`
}

async function main() {
  const source = await MongoClient.connect(SOURCE_URI, { serverSelectionTimeoutMS: 5000 })
  const target = await MongoClient.connect(TARGET_URI, { serverSelectionTimeoutMS: 5000 })
  const sdb = source.db()
  const tdb = target.db()

  const minio = new MinioClient({
    endPoint: `s3.${S3_REGION}.amazonaws.com`,
    region: S3_REGION,
    useSSL: true,
    accessKey: S3_ACCESS_KEY,
    secretKey: S3_SECRET_KEY,
  })

  const report = {}

  // --- 1. Courses: 5 collections -> one AcademyCourse collection ----------
  let courseCount = 0
  // Legacy _id -> new AcademyCourse _id, needed to re-point Enrollment.courseId.
  const courseIdMap = new Map()

  for (const [collection, type] of Object.entries(COURSE_TYPE_BY_COLLECTION)) {
    const docs = await sdb.collection(collection).find().toArray()
    for (const doc of docs) {
      // Matched by (type, title) rather than a freshly generated id, so a
      // second run updates the same row instead of inserting a duplicate —
      // the two source+target databases have unrelated ObjectId spaces, and
      // title is unique within one course type in this dataset.
      const existing = await tdb.collection('AcademyCourse').findOne({ type, title: doc.title }, { projection: { _id: 1 } })
      const newId = existing ? existing._id : new ObjectId()
      courseIdMap.set(doc._id.toString(), newId)

      await tdb.collection('AcademyCourse').updateOne(
        { _id: newId },
        {
          $set: {
            type,
            emoji: doc.emoji || '',
            title: doc.title,
            desc: doc.desc,
            duration: doc.duration,
            students: doc.students || '0 enrolled',
            rating: doc.rating || '0★',
            price: doc.price,
            oldPrice: doc.oldPrice || '',
            level: LEVEL_MAP[doc.level] || 'ALL_LEVELS',
            isActive: doc.isActive !== false,
            createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true },
      )
      courseCount += 1
    }
  }
  report.courses = courseCount

  // --- 2. CourseMaterial -> File (S3) + CourseMaterial ---------------------
  const materials = await sdb.collection('coursematerials').find().toArray()
  // Legacy _id -> new CourseMaterial _id, needed by Purchase/QuizAttempt below.
  const materialIdMap = new Map()
  let materialsMigrated = 0
  let materialsSkipped = 0

  for (const doc of materials) {
    const localPath = path.join(UPLOAD_DIR, doc.storedFileName)
    if (!fs.existsSync(localPath)) {
      console.warn(`Skipping material "${doc.title}" (${doc._id}): file missing on disk (${doc.storedFileName})`)
      materialsSkipped += 1
      continue
    }

    // Matched by title, same reasoning as courses above — titles are unique
    // across these 6 real materials. Reusing an already-migrated material
    // also skips re-uploading its file to S3 on a second run.
    const existingMaterial = await tdb.collection('CourseMaterial').findOne({ title: doc.title })

    let fileId
    if (existingMaterial) {
      fileId = existingMaterial.fileId
    } else {
      const buffer = fs.readFileSync(localPath)
      const today = new Date().toISOString().slice(0, 10)
      const randomId = crypto.randomBytes(8).toString('hex')
      const storagePath = `academy/${today}/${doc.fileName}_${randomId}`

      await minio.putObject(S3_BUCKET, storagePath, buffer, buffer.length, { 'Content-Type': doc.mimeType })

      fileId = new ObjectId()
      await tdb.collection('File').insertOne({
        _id: fileId,
        createdAt: new Date(),
        updatedAt: new Date(),
        bucket: S3_BUCKET,
        fileName: storagePath,
        mimeType: doc.mimeType,
        size: doc.size || buffer.length,
      })
    }

    const newMaterialId = existingMaterial ? existingMaterial._id : new ObjectId()
    materialIdMap.set(doc._id.toString(), newMaterialId)

    await tdb.collection('CourseMaterial').updateOne(
      { _id: newMaterialId },
      {
        $set: {
          createdAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
          title: doc.title,
          fileName: doc.fileName,
          fileId,
          price: doc.price ?? 99,
          uploadedBy: doc.uploadedBy ? legacyIdentity(doc.uploadedBy) : null,
          courseGroup: doc.courseGroup || null,
          order: doc.order ?? null,
        },
      },
      { upsert: true },
    )
    materialsMigrated += 1
  }
  report.materials = { migrated: materialsMigrated, skippedMissingFile: materialsSkipped }

  // --- 3. Purchases ---------------------------------------------------------
  const purchases = await sdb.collection('purchases').find().toArray()
  let purchasesMigrated = 0
  for (const doc of purchases) {
    const materialId = materialIdMap.get(doc.materialId.toString())
    if (!materialId) continue // material was skipped above (file missing)

    const identity = doc.identity.startsWith('user:')
      ? legacyIdentity(doc.identity.slice('user:'.length))
      : doc.identity

    await tdb.collection('Purchase').updateOne(
      { _id: new ObjectId(doc._id) },
      {
        $set: {
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date(),
          identity,
          materialId,
          name: doc.name,
          email: doc.email,
          phone: doc.phone,
          reason: doc.reason,
          amount: doc.amount,
          currency: doc.currency || 'INR',
          status: 'PAID',
          // No live Razorpay order backs a migrated historical purchase — a
          // literal `null` here would collide with every other migrated row
          // under `Purchase_razorpayOrderId_key` (@unique treats all missing
          // values as the same null), so each gets its own placeholder
          // instead of leaving the field unset.
          razorpayOrderId: `legacy:${doc._id.toString()}`,
          paidAt: doc.paidAt ? new Date(doc.paidAt) : new Date(doc.createdAt || Date.now()),
        },
      },
      { upsert: true },
    )
    purchasesMigrated += 1
  }
  report.purchases = purchasesMigrated

  // --- 4. QuizAttempts -------------------------------------------------------
  const attempts = await sdb.collection('quizattempts').find().toArray()
  let attemptsMigrated = 0
  for (const doc of attempts) {
    const materialId = materialIdMap.get(doc.materialId.toString())
    if (!materialId) continue

    const identity = doc.identity.startsWith('user:')
      ? legacyIdentity(doc.identity.slice('user:'.length))
      : doc.identity

    await tdb.collection('QuizAttempt').updateOne(
      { _id: new ObjectId(doc._id) },
      {
        $set: {
          createdAt: doc.attemptedAt ? new Date(doc.attemptedAt) : new Date(),
          identity,
          materialId,
          score: doc.score,
          total: doc.total,
          passed: doc.passed,
          certificateId: doc.certificateId || null,
        },
      },
      { upsert: true },
    )
    attemptsMigrated += 1
  }
  report.quizAttempts = attemptsMigrated

  // --- 5. CourseCertificates (final bundle) ---------------------------------
  const certificates = await sdb.collection('coursecertificates').find().toArray()
  let certificatesMigrated = 0
  for (const doc of certificates) {
    const identity = doc.identity.startsWith('user:')
      ? legacyIdentity(doc.identity.slice('user:'.length))
      : doc.identity

    await tdb.collection('CourseCertificate').updateOne(
      { _id: new ObjectId(doc._id) },
      {
        $set: {
          createdAt: doc.attemptedAt ? new Date(doc.attemptedAt) : new Date(),
          identity,
          courseGroup: doc.courseGroup,
          score: doc.score,
          total: doc.total,
          passed: doc.passed,
          longAnswer: doc.longAnswer || '',
          certificateId: doc.certificateId || null,
        },
      },
      { upsert: true },
    )
    certificatesMigrated += 1
  }
  report.certificates = certificatesMigrated

  // --- 6. Enrollments ---------------------------------------------------------
  const enrollments = await sdb.collection('enrollments').find().toArray()
  let enrollmentsMigrated = 0
  let enrollmentsSkipped = 0
  for (const doc of enrollments) {
    const courseId = courseIdMap.get(doc.courseId.toString())
    if (!courseId) {
      enrollmentsSkipped += 1
      continue
    }

    await tdb.collection('Enrollment').updateOne(
      { _id: new ObjectId(doc._id) },
      {
        $set: {
          createdAt: doc.enrolledAt ? new Date(doc.enrolledAt) : new Date(),
          updatedAt: new Date(),
          userId: legacyIdentity(doc.userId),
          courseId,
          courseType: COURSE_TYPE_BY_SLUG[doc.courseType] || 'ONLINE_COURSE',
          courseTitle: doc.courseTitle,
          price: doc.price || '',
          status: doc.status === 'completed' ? 'COMPLETED' : 'ACTIVE',
          progress: doc.progress || 0,
          lastAccessedAt: doc.lastAccessedAt ? new Date(doc.lastAccessedAt) : null,
          enrolledAt: doc.enrolledAt ? new Date(doc.enrolledAt) : new Date(),
        },
      },
      { upsert: true },
    )
    enrollmentsMigrated += 1
  }
  report.enrollments = { migrated: enrollmentsMigrated, skippedUnknownCourse: enrollmentsSkipped }

  console.log('Migration complete:')
  console.log(JSON.stringify(report, null, 2))

  await source.close()
  await target.close()
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
