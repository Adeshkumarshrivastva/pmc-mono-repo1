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
    const MediaBucket = new sst.aws.Bucket('PMC_LANDING_PAGE_MEDIA_BUCKET')
    const router = new sst.aws.Router('PmcRouter', {})

    new sst.aws.Function('PmcHonoServer', {
      handler: 'apps/server/src/index.handler',
      url: {
        router: {
          instance: router,
          path: '/api',
        },
      },
    })

    new sst.aws.StaticSite('PmcPortal', {
      build: {
        command: 'pnpm build --filter=@pmc/portal',
        output: 'apps/portal/dist',
      },
      router: {
        instance: router,
        path: '/portal',
      },
      environment: {
        VITE_PUBLIC_API_BASE_URL: $interpolate`${router.url}`,
        VITE_PUBLIC_BASE_PATH: '/portal',
      },
    })

    new sst.aws.Nextjs('PmcLandingPage', {
      link: [MediaBucket],
      buildCommand: 'pnpm build --filter=@pmc/landing-page',
      router: {
        instance: router,
        path: '/',
      },
    })
  },
})
