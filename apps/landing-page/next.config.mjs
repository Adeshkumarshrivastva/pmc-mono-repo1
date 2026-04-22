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
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/media/**'
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      }
    ],
  },
  output: 'standalone',
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
