// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

import type { CdnArgs } from './.sst/platform/src/components/aws'

type Domain = NonNullable<CdnArgs['domain']>

export default $config({
  app(input) {
    return {
      name: 'pmc-mono-repo',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          region: 'ap-south-1',
        },
      },
    }
  },
  async run() {
    let domain: Domain | undefined = undefined

    if ($app.stage === 'production' && !$dev) {
      domain = {
        name: 'positivemindcare.com',
        redirects: ['www.positivemindcare.com'],
      }
    } else if ($app.stage === 'development' && !$dev) {
      domain = {
        name: 'staging.positivemindcare.com',
        redirects: ['www.staging.positivemindcare.com'],
      }
    }

    const router = new sst.aws.Router('PmcRouter', { domain })

    const BetterAuthSecret = new sst.Secret('BETTER_AUTH_SECRET')
    const DatabaseUrl = new sst.Secret('DATABASE_URL')
    const GoogleClientId = new sst.Secret('GOOGLE_CLIENT_ID')
    const GoogleClientSecret = new sst.Secret('GOOGLE_CLIENT_SECRET')
    const JwtSecret = new sst.Secret('JWT_SECRET')
    const RazorpayKeyId = new sst.Secret('RAZORPAY_KEY_ID')
    const RazorpayKeySecret = new sst.Secret('RAZORPAY_KEY_SECRET')
    const WhatsappApiKeySecret = new sst.Secret('WHATSAPP_API_KEY_SECRET')
    const WhatsappLicenceNumberSecret = new sst.Secret('WHATSAPP_LICENCE_NUMBER_SECRET')
    const WhatsappTestNumberSecret = new sst.Secret('WHATSAPP_TEST_NUMBER_SECRET')
    const BrowserlessWsEndpoint = new sst.Secret('BROWSERLESS_WS_ENDPOINT')
    const GoogleServiceAccountEmail = new sst.Secret('GOOGLE_SERVICE_ACCOUNT_EMAIL')
    const GoogleServiceAccountPrivateKey = new sst.Secret('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')
    const GoogleCalendarEmail = new sst.Secret('GOOGLE_CALENDAR_EMAIL')
    const SmsServiceUserId = new sst.Secret('SMS_SERVICE_USERID')
    const SmsServicePassword = new sst.Secret('SMS_SERVICE_PASSWORD')
    const PortalMediaBucket = new sst.aws.Bucket('PMC_PORTAL_MEDIA_BUCKET')
    const S3AccessKey = new sst.Secret('S3_ACCESS_KEY')
    const S3SecretKey = new sst.Secret('S3_SECRET_KEY')
    const S3Region = new sst.Secret('S3_REGION')

    const SenderEmail =
      $app.stage === 'production'
        ? new sst.aws.Email('SenderEmail', {
            sender: 'no-reply@positivemindcare.com',
          })
        : sst.aws.Email.get('SenderEmail', 'no-reply-dev@positivemindcare.com')

    const getServerEnvironment = () => ({
      BETTER_AUTH_SECRET: BetterAuthSecret.value,
      DATABASE_URL: DatabaseUrl.value,
      GOOGLE_CLIENT_ID: GoogleClientId.value,
      GOOGLE_CLIENT_SECRET: GoogleClientSecret.value,
      RAZORPAY_KEY_ID: RazorpayKeyId.value,
      RAZORPAY_KEY_SECRET: RazorpayKeySecret.value,
      JWT_SECRET: JwtSecret.value,
      WHATSAPP_API_KEY_SECRET: WhatsappApiKeySecret.value,
      WHATSAPP_LICENCE_NUMBER_SECRET: WhatsappLicenceNumberSecret.value,
      WHATSAPP_TEST_NUMBER_SECRET: WhatsappTestNumberSecret.value,
      EMAIL_SENDER: $interpolate`${SenderEmail.sender}`,
      BROWSERLESS_WS_ENDPOINT: BrowserlessWsEndpoint.value,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: GoogleServiceAccountEmail.value,
      GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: GoogleServiceAccountPrivateKey.value,
      GOOGLE_CALENDAR_EMAIL: GoogleCalendarEmail.value,
      SMS_SERVICE_USERID: SmsServiceUserId.value,
      SMS_SERVICE_PASSWORD: SmsServicePassword.value,
      S3_BUCKET: PortalMediaBucket.name,
    })

    new sst.aws.Function('PmcHonoServer', {
      architecture: 'arm64',
      handler: 'apps/server/src/index.handler',
      link: [SenderEmail, PortalMediaBucket],
      url: {
        router: {
          instance: router,
          path: '/server',
        },
        cors: false,
      },
      environment: getServerEnvironment(),
      copyFiles: [
        {
          from: 'apps/server/src/generated/prisma/libquery_engine-linux-arm64-openssl-3.0.x.so.node',
          to: 'src/generated/prisma/libquery_engine-linux-arm64-openssl-3.0.x.so.node',
        },
        {
          from: 'apps/server/src/static/assets/logo.png',
          to: 'src/static/assets/logo.png',
        },
      ],
    })

    if ($app.stage === 'production') {
      new sst.aws.Cron('CleanupDraftBookingsCron', {
        schedule: 'rate(5 minutes)',
        job: {
          architecture: 'arm64',
          handler: 'apps/server/src/cron.handler',
          environment: getServerEnvironment(),
          copyFiles: [
            {
              from: 'apps/server/src/generated/prisma/libquery_engine-linux-arm64-openssl-3.0.x.so.node',
              to: 'src/generated/prisma/libquery_engine-linux-arm64-openssl-3.0.x.so.node',
            },
          ],
        },
      })
    }

    new sst.aws.StaticSite('PmcPortal', {
      build: {
        command: 'pnpm build --filter=@pmc/portal',
        output: 'apps/portal/dist',
      },
      dev: {
        directory: 'apps/portal',
      },
      router: {
        instance: router,
        path: '/portal',
      },
      environment: {
        VITE_PUBLIC_API_BASE_URL: $interpolate`${router.url}`,
        VITE_PUBLIC_BASE_PATH: '/portal',
        VITE_PUBLIC_RAZORPAY_KEY_ID: RazorpayKeyId.value,
      },
    })

    const PayloadSecret = new sst.Secret('PAYLOAD_SECRET')
    const PayloadDBUrl = new sst.Secret('PAYLOAD_DB_URL')
    const MediaBucket = new sst.aws.Bucket('PMC_LANDING_PAGE_MEDIA_BUCKET')

    new sst.aws.Nextjs('PmcLandingPage', {
      link: [MediaBucket],
      path: 'apps/landing-page',
      router: {
        instance: router,
        path: '/',
      },
      environment: {
        PAYLOAD_SECRET: PayloadSecret.value,
        PAYLOAD_BUCKET: MediaBucket.name,
        PAYLOAD_DB_URL: PayloadDBUrl.value,
        RAZORPAY_KEY_ID: RazorpayKeyId.value,
        RAZORPAY_KEY_SECRET: RazorpayKeySecret.value,
        NEXT_PUBLIC_RAZORPAY_KEY_ID: $interpolate`${RazorpayKeyId.value}`,
      },
    })
  },
})
