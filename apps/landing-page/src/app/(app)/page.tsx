import { getPayloadClient } from '@/lib/payload'
import HeroSection from './_components/hero-section'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const { heroSetion } = await payload.findGlobal({ slug: 'home' })

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection data={heroSetion} />
    </div>
  )
}
