import { Client } from 'minio'
import { config } from '../config'

export const minioClient = new Client({
  endPoint: config.minio.endpoint ?? `s3.${config.minio.region}.amazonaws.com`,
  ...(config.minio.port ? { port: config.minio.port } : {}),
  region: config.minio.region,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
})

export const BUCKET_NAME = config.minio.bucket

export async function minioUploadFile(fileName: string, buffer: Buffer, mimeType?: string) {
  return minioClient.putObject(BUCKET_NAME, fileName, buffer, buffer.length, {
    'Content-Type': mimeType || 'application/octet-stream',
  })
}

export async function minioGetFileStream(fileName: string) {
  return minioClient.getObject(BUCKET_NAME, fileName)
}
