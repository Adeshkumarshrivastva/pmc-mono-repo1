import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Mounted at the path prefix `/academy-app`, same convention as apps/portal's
// `/portal` — see apps/landing-page/src/lib/academy.ts.
// (Not `/academy` — that path already serves the marketing/CMS page for the
// academy program, apps/landing-page/src/app/(app)/academy/page.tsx.)
//
// The prefix is unconditional, dev included, so the dev server answers the same
// URLs the landing page links to and next.config.mjs can proxy them straight
// through — exactly how apps/portal is wired.
export default defineConfig({
  plugins: [react()],
  base: '/academy-app',
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
