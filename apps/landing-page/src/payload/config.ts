import path from 'path'
import { fileURLToPath } from 'url'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { s3Storage } from '@payloadcms/storage-s3'
import { env } from '@/env'
import { Home } from './globals/home'
import { DeepTms } from './globals/deep-tms'
import { ContactUs } from './globals/contact-us'
import { Blog } from './collections/blog'
import { Experts } from './collections/experts'
import { AboutUs } from './globals/about-us'
import { TeamMembers } from './collections/team-members'
import { Users } from './collections/users'
import { Media } from './collections/media'
import { Testimonial } from './collections/testimonial'
import { OurServices } from './globals/our-services'
import { Services } from './collections/services'
import { Leads } from './collections/leads'
import { Appointments } from './collections/appointments'
import { PrivacyPolicy } from './globals/privacy-policy'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Blog, Experts, TeamMembers, Testimonial, Services, Leads, Appointments],
  globals: [Home, DeepTms, OurServices, ContactUs, AboutUs, PrivacyPolicy],
  editor: lexicalEditor({}),
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'types.ts'),
  },
  db: mongooseAdapter({
    url: env.PAYLOAD_DB_URL,
  }),
  plugins: [
    payloadCloudPlugin(),
    s3Storage({
      collections: {
        media: true,
      },
      bucket: env.PAYLOAD_BUCKET,
      config: {},
    }),
  ],
})
