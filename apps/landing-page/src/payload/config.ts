import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { Resource } from 'sst'
import { s3Storage } from '@payloadcms/storage-s3'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { env } from '@/env'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'types.ts'),
  },
  db: mongooseAdapter({
    url: env.DATABASE_URI,
  }),
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: true,
      },
      bucket: Resource.PMC_LANDING_PAGE_MEDIA_BUCKET.name,
      config: {},
    }),
  ],
})
