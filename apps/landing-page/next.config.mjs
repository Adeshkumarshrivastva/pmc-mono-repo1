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
        pathname: '/api/media/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/admin-login',
        destination: '/portal',
        permanent: false,
      },
      {
        source: '/admin-login/:path*',
        destination: '/portal',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return []
    return [
      { source: '/portal', destination: 'http://localhost:5173/portal' },
      { source: '/portal/:path*', destination: 'http://localhost:5173/portal/:path*' },
      // Academy course app (apps/academy) — Vite dev server on :5174, same
      // arrangement as the portal above. Its Express backend stays on :5000 and
      // is called directly in dev (VITE_API_URL), so it needs no rewrite here.
      { source: '/academy-app', destination: 'http://localhost:5174/academy-app' },
      { source: '/academy-app/:path*', destination: 'http://localhost:5174/academy-app/:path*' },
      // Vite dev server internal paths injected as root-relative URLs in HTML
      { source: '/@vite/:path*', destination: 'http://localhost:5173/@vite/:path*' },
      { source: '/@react-refresh', destination: 'http://localhost:5173/@react-refresh' },
      { source: '/@fs/:path*', destination: 'http://localhost:5173/@fs/:path*' },
      { source: '/src/:path*', destination: 'http://localhost:5173/src/:path*' },
      { source: '/node_modules/.vite/:path*', destination: 'http://localhost:5173/node_modules/.vite/:path*' },
    ]
  },
  output: 'standalone',
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
