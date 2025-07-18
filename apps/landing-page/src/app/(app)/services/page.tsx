import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import { getServices } from '@/payload/actions'
import HeroSection from './_components/hero-section'
import OurServicesSection from './_components/our-services-section'

export default async function ServicesPage() {
  const payload = await getPayloadClient()

  const { servicesHeroSection } = await payload.findGlobal({
    slug: 'our-services',
  })

  const services = await getServices({})

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <HeroSection data={servicesHeroSection} />
      <OurServicesSection services={services.docs} />
    </div>
  )
}
