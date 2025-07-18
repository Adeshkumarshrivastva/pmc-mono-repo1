import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import { getServices } from '@/payload/actions'
import HeroSection from './_components/hero-section'
import OurServicesSection from './_components/our-services-section'
import AppointmentSection from '../_components/appointment-section'
import { TestimonialSection } from '../_components/testimonial-section'
import FAQSection from '../_components/faq-section'

export default async function ServicesPage() {
  const payload = await getPayloadClient()

  const { servicesHeroSection } = await payload.findGlobal({
    slug: 'our-services',
  })
  const { appointmentSection, faqSection, testimonialSection } = await payload.findGlobal({
    slug: 'home',
  })

  const services = await getServices({})

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <HeroSection data={servicesHeroSection} />
      <OurServicesSection services={services.docs} />
      <TestimonialSection data={testimonialSection} />
      <AppointmentSection data={appointmentSection} services={services.docs} />
      <FAQSection data={faqSection} />
    </div>
  )
}
