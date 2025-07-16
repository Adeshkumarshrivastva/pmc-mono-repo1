import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import HeroSection from './_components/hero-section'

export default async function Page() {
  const payload = await getPayloadClient()
  const { aboutUsHeroSection } = await payload.findGlobal({
    slug: 'about-us',
  })

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <HeroSection data={aboutUsHeroSection} />
    </div>
  )
}
