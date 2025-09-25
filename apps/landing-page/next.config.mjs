import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '',
   images: {
   remotePatterns: [
      {
        protocol: 'https',
        hostname: 'positivemindcare.com',
      },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
