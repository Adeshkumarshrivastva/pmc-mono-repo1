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
    <>
      <HeroSection data={servicesHeroSection} />
      <OurServicesSection services={services.docs} />
    </>
  )
}
