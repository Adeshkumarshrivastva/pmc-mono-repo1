// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'pmc-mono-repo',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
    }
  },
  async run() {
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
      path: 'apps/portal',
      build: {
        command: 'pnpm build',
        output: 'dist',
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
      path: 'apps/landing-page',
      router: {
        instance: router,
        path: '/',
      },
    })
  },
})
