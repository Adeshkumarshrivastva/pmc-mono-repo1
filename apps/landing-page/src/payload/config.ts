import path from 'path'
import { fileURLToPath } from 'url'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { s3Storage } from '@payloadcms/storage-s3'
import { importExportPlugin } from '@payloadcms/plugin-import-export'
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
import { OurBlogs } from './globals/our-blogs'
import { PrivacyPolicy } from './globals/privacy-policy'
import { TermsAndConditions } from './globals/terms-and-conditions'
import { Webinars } from './collections/webinars'
import { Quiz } from './collections/quiz'
import { QuizPage } from './globals/quiz'
import { Internships } from './collections/internships'
import { Footer } from './globals/footer'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Blog,
    Experts,
    TeamMembers,
    Testimonial,
    Services,
    Leads,
    Appointments,
    Webinars,
    Quiz,
    Internships,
  ],
  globals: [
    Home,
    DeepTms,
    OurServices,
    ContactUs,
    AboutUs,
    PrivacyPolicy,
    TermsAndConditions,
    OurBlogs,
    QuizPage,
    Footer,
  ],
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
    importExportPlugin({
      collections: ['leads'],
      disableSave: true,
    }),
  ],
})
