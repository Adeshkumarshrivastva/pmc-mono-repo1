import { customAlphabet } from 'nanoid'
import type { C } from '../../lib/context'
import { prisma } from '../../lib/db'
import { minioUploadFile, minioClient, BUCKET_NAME } from '../../lib/minio'
import type { UploadFileInput } from './file.input'

const generateRandomFileId = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 16)

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg']

export async function uploadFile(c: C, formData: UploadFileInput) {
  try {
    const file = formData.file
    if (!file) {
      return c.json({ error: 'Missing file' }, 400)
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return c.json({ error: `Invalid file type: ${file.type}` }, 400)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const today = new Date().toISOString().slice(0, 10)
    const randomId = generateRandomFileId()
    const filePath = `files/${today}/${file.name}_${randomId}`

    await minioUploadFile(filePath, buffer, file.type)

    const record = await prisma.file.create({
      data: {
        fileName: filePath,
        bucket: process.env.S3_BUCKET!,
        mimeType: file.type,
        size: buffer.length,
      },
    })

    return c.json({ success: true, file: record })
  } catch {
    return c.json({ error: 'Failed to upload file' }, 500)
  }
}

export async function getFile(c: C) {
  const filePath = c.req.param('filePath')
  if (!filePath) {
    return c.json({ error: 'Missing filePath param' }, 400)
  }

  try {
    const [stat, stream] = await Promise.all([
      minioClient.statObject(BUCKET_NAME, filePath),
      minioClient.getObject(BUCKET_NAME, filePath),
    ])

    const mimeType = stat.metaData?.['content-type'] || 'application/octet-stream'

    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }

    const fileBuffer = Buffer.concat(chunks)

    return c.body(fileBuffer, 200, {
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${filePath.split('/').pop()}"`,
    })
  } catch {
    return c.json({ error: 'File not found' }, 404)
  }
}
