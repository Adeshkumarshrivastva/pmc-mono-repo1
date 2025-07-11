import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '',
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
