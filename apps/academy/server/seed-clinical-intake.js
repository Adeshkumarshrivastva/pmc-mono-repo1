// Seeds the 5-part "Clinical Intake Assessment" sequential course from the
// PDFs PMC dropped at D:\PMC-Projects\Academy-Course — copies each file into
// uploads/ and creates its CourseMaterial record (courseGroup:
// 'clinical-intake', order 1-5). Safe to re-run: it removes any existing
// clinical-intake materials (and their files) first.
//
// Run with: node seed-clinical-intake.js

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const CourseMaterial = require('./models/CourseMaterial');

const COURSE_GROUP = 'clinical-intake';
const SOURCE_DIR = 'D:\\PMC-Projects\\Academy-Course';
const UPLOAD_DIR = path.join(__dirname, 'uploads');

const PARTS = [
  { order: 1, file: 'PART 1 - INTRODUCTION TO CLINICAL INTAKE.pdf', title: 'Part 1 - Introduction to Clinical Intake' },
  { order: 2, file: 'PART 2 - PRINCIPLES AND PROCESS OF ASSESSMENTS.pdf', title: 'Part 2 - Principles and Process of Assessment' },
  { order: 3, file: 'PART 3 - CASE HISTORY.pdf', title: 'Part 3 - Case History' },
  { order: 4, file: 'PART 4 - RAPPORT FORMATION AND DIAGNOSIS.pdf', title: 'Part 4 - Rapport Formation and Diagnosis' },
  { order: 5, file: 'PART 5 - MENTAL STATUS EXAMINATION.pdf', title: 'Part 5 - Mental Status Examination' },
];

async function seed() {
  await connectDB();
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const existing = await CourseMaterial.find({ courseGroup: COURSE_GROUP });
  for (const m of existing) {
    const filePath = path.join(UPLOAD_DIR, m.storedFileName);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  await CourseMaterial.deleteMany({ courseGroup: COURSE_GROUP });

  for (const part of PARTS) {
    const sourcePath = path.join(SOURCE_DIR, part.file);
    if (!fs.existsSync(sourcePath)) {
      console.error(`Missing source file, skipping: ${sourcePath}`);
      continue;
    }

    const storedFileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.pdf`;
    fs.copyFileSync(sourcePath, path.join(UPLOAD_DIR, storedFileName));
    const { size } = fs.statSync(sourcePath);

    await CourseMaterial.create({
      title: part.title,
      fileName: part.file,
      storedFileName,
      mimeType: 'application/pdf',
      size,
      price: part.order === 1 ? 99 : 0, // only part 1 is paid; 2-5 unlock via quiz
      courseGroup: COURSE_GROUP,
      order: part.order,
    });
    console.log(`Seeded part ${part.order}: ${part.title}`);
  }

  await mongoose.disconnect();
  console.log('Done. MongoDB disconnected.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
