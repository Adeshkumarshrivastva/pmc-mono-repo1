// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

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
    const router = new sst.aws.Router('PmcRouter', {
      domain:
        $app.stage === 'production'
          ? {
              name: 'positivemindcare.com',
              redirects: ['www.positivemindcare.com'],
            }
          : $app.stage === 'development'
            ? {
                name: 'staging.positivemindcare.com',
              }
            : undefined,
    })

    const BetterAuthSecret = new sst.Secret('BETTER_AUTH_SECRET')
    const DatabaseUrl = new sst.Secret('DATABASE_URL')
    const GoogleClientId = new sst.Secret('GOOGLE_CLIENT_ID')
    const GoogleClientSecret = new sst.Secret('GOOGLE_CLIENT_SECRET')

    new sst.aws.Function('PmcHonoServer', {
      link: [router, BetterAuthSecret, DatabaseUrl, GoogleClientId, GoogleClientSecret],
      handler: 'apps/server/src/index.handler',
      url: {
        router: {
          instance: router,
          path: '/server',
        },
        cors: false,
      },
    })

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
        VITE_PUBLIC_API_BASE_URL: router.url,
        VITE_PUBLIC_BASE_PATH: '/portal',
      },
    })

    const PayloadSecret = new sst.Secret('PAYLOAD_SECRET')
    const PayloadDBUrl = new sst.Secret('PAYLOAD_DB_URL')
    const RazorpayKeyId = new sst.Secret('RAZORPAY_KEY_ID')
    const RazorpayKeySecret = new sst.Secret('RAZORPAY_KEY_SECRET')
    const MediaBucket = new sst.aws.Bucket('PMC_LANDING_PAGE_MEDIA_BUCKET')

    new sst.aws.Nextjs('PmcLandingPage', {
      link: [MediaBucket, PayloadDBUrl, PayloadSecret, RazorpayKeyId, RazorpayKeySecret],
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
