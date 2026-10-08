import { customAlphabet } from 'nanoid'
import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import { minioUploadFile, minioGetFileStream, BUCKET_NAME } from '../../lib/minio'
import { getErrorMessage } from '../../lib/utils'
import { hasAccess } from './academy.access'
import { ALLOWED_MATERIAL_MIME_TYPES, type MaterialIdInput, type UploadMaterialInput } from './materials.input'
import type { CourseMaterial, File as PrismaFile } from '../../generated/prisma'

const generateRandomFileId = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 16)

function publicMaterial(material: CourseMaterial & { file: PrismaFile }) {
  return {
    id: material.id,
    title: material.title,
    fileName: material.fileName,
    mimeType: material.file.mimeType,
    size: material.file.size,
    price: material.price,
    uploadedAt: material.createdAt,
    courseGroup: material.courseGroup ?? null,
    // `?? null`, not `|| null` — order 0 (the free intro/preview part) is a
    // real, meaningful value and must not collapse to null like an unset one.
    order: material.order ?? null,
  }
}

/** Every material's metadata — open to everyone, no login needed. */
export async function listMaterials(c: C) {
  try {
    // Sequential-course parts (courseGroup + order) sort together in order;
    // everything else keeps the old newest-first behaviour.
    const materials = await prisma.courseMaterial.findMany({
      include: { file: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    })
    return c.json({ materials: materials.map(publicMaterial) })
  } catch (error) {
    return c.json({ error: `Failed to fetch materials - ${getErrorMessage(error)}` }, 500)
  }
}

/** Admin-only: upload a new PDF/PPT material, storing the file in S3/MinIO. */
export async function uploadMaterial(c: C, input: UploadMaterialInput) {
  try {
    if (!ALLOWED_MATERIAL_MIME_TYPES.includes(input.file.type as (typeof ALLOWED_MATERIAL_MIME_TYPES)[number])) {
      return c.json({ error: 'Only PDF or PPT/PPTX files are allowed' }, 400)
    }

    const buffer = Buffer.from(await input.file.arrayBuffer())
    const today = new Date().toISOString().slice(0, 10)
    const randomId = generateRandomFileId()
    const storagePath = `academy/${today}/${input.file.name}_${randomId}`

    await minioUploadFile(storagePath, buffer, input.file.type)

    const courseGroup = input.courseGroup || null
    const order = input.order ?? null

    // Order 0 = free intro/preview (open to everyone). Order 1 = the paid
    // entry point. Order 2+ is earned by the previous part's quiz, not
    // paid for.
    let price = input.price
    if (courseGroup) {
      if (order === 0) price = 0
      else if (order !== null && order > 1) price = 0
    }

    const user = c.get('user')
    const file = await prisma.file.create({
      data: {
        fileName: storagePath,
        bucket: BUCKET_NAME,
        mimeType: input.file.type,
        size: buffer.length,
      },
    })

    const material = await prisma.courseMaterial.create({
      data: {
        title: (input.title || input.file.name).trim(),
        fileName: input.file.name,
        fileId: file.id,
        price,
        uploadedBy: user?.id,
        courseGroup,
        order,
      },
      include: { file: true },
    })

    return c.json({ success: true, material: publicMaterial(material) })
  } catch (error) {
    return c.json({ error: `Failed to upload material - ${getErrorMessage(error)}` }, 500)
  }
}

/** Can this visitor (logged in or guest) see this material? */
export async function getMaterialAccess(c: C, input: MaterialIdInput) {
  try {
    const material = await prisma.courseMaterial.findUnique({ where: { id: input.materialId } })
    if (!material) return c.json({ error: 'Material not found' }, 404)

    const identity = c.get('academyIdentity')!
    const purchased = await hasAccess(identity, material)
    const locked = !purchased && !!(material.courseGroup && material.order !== null && material.order > 1)

    return c.json({ purchased, locked })
  } catch (error) {
    return c.json({ error: `Failed to check access - ${getErrorMessage(error)}` }, 500)
  }
}

/** Streams the file, only once unlocked. */
export async function downloadMaterial(c: C, input: MaterialIdInput) {
  try {
    const material = await prisma.courseMaterial.findUnique({ where: { id: input.materialId }, include: { file: true } })
    if (!material) return c.json({ error: 'Material not found' }, 404)

    const identity = c.get('academyIdentity')!
    const ok = await hasAccess(identity, material)
    if (!ok) {
      const message =
        material.courseGroup && material.order !== null && material.order > 1
          ? "Complete the previous part's quiz first to unlock this file"
          : `Please complete the ₹${material.price} payment to download this file`
      return c.json({ error: message }, 403)
    }

    const stream = await minioGetFileStream(material.file.fileName)
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }

    return c.body(Buffer.concat(chunks), 200, {
      'Content-Type': material.file.mimeType,
      'Content-Disposition': `attachment; filename="${material.fileName}"`,
    })
  } catch (error) {
    return c.json({ error: `Failed to download material - ${getErrorMessage(error)}` }, 500)
  }
}

/** Admin-only. */
export async function deleteMaterial(c: C, input: MaterialIdInput) {
  try {
    const material = await prisma.courseMaterial.findUnique({ where: { id: input.materialId } })
    if (!material) return c.json({ error: 'Material not found' }, 404)

    await prisma.courseMaterial.delete({ where: { id: input.materialId } })
    await prisma.file.delete({ where: { id: material.fileId } }).catch(() => null)

    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: `Failed to delete material - ${getErrorMessage(error)}` }, 500)
  }
}
