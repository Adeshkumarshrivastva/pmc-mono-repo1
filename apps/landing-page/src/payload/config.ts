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
import { Academy } from './globals/academy'
import { Franchise } from './globals/franchise'
import { FranchiseRequest } from './collections/franchise'
import { PopupNotifications } from './collections/popup-notifications'
import { Souvenir } from './collections/souvenir'
import { News } from './collections/news'
import { Events } from './globals/events'
import { ReturnPolicy } from './globals/return-policy'
import { OutingPage } from './globals/outing-page'

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
    FranchiseRequest,
    PopupNotifications,
    Souvenir,
    News,
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
    Academy,
    Franchise,
    Events,
    ReturnPolicy,
    OutingPage,
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
    payloadCloudPlugin({
      storage: false,
    }),
    s3Storage({
      collections: {
        media: true,
      },
      bucket: env.PAYLOAD_BUCKET,
      config: {
        region: env.PAYLOAD_BUCKET_REGION,
        credentials: {
          accessKeyId: env.PAYLOAD_BUCKET_ACCESS_KEY,
          secretAccessKey: env.PAYLOAD_BUCKET_SECRET_KEY,
        },
        // Only set for self-hosted S3-compatible storage (e.g. MinIO). Leave
        // PAYLOAD_BUCKET_ENDPOINT unset to use real AWS S3 as before.
        ...(env.PAYLOAD_BUCKET_ENDPOINT
          ? { endpoint: env.PAYLOAD_BUCKET_ENDPOINT, forcePathStyle: true }
          : {}),
      },
    }),
    importExportPlugin({
      collections: ['leads'],
      disableSave: true,
    }),
  ],
})
