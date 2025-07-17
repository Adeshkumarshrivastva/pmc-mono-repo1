import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import HeroSection from './_components/hero-section'

export default async function ServicesPage() {
  const payload = await getPayloadClient()

  const { servicesHeroSection } = await payload.findGlobal({
    slug: 'services',
  })

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <HeroSection data={servicesHeroSection} />
    </div>
  )
}
