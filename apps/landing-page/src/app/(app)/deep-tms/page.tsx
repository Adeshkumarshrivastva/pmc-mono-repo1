import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import { getServices } from '@/payload/actions'
import { Service } from '@/payload/types'
import HeroSection from './_components/hero-section'
import FAQSection from '../_components/faq-section'
import AppointmentSection from '../_components/appointment-section'
import WorkSection from './_components/work-section'
import { EligibilitySection } from './_components/eligibility-section'
import ComparisonTableSection from './_components/comparison-table-section'
import ServicesSection from './_components/services-section'

export default async function DeepTmsPage() {
  const payload = await getPayloadClient()
  const {
    deepTmsHeroSection,
    deepTmsWorkSection,
    faqSection,
    appointmentSection,
    deepTmsComparisonSection,
    deepTmsEligibilitySection,
    servicesSection,
  } = await payload.findGlobal({
    slug: 'deep-tms',
  })

  const services = await getServices({})
  const deepTmsServices = services.docs.find((service) => service.slug === 'deep-tms')?.subservices

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <HeroSection data={deepTmsHeroSection} />
      <WorkSection data={deepTmsWorkSection} />
      <EligibilitySection data={deepTmsEligibilitySection} />
      <ComparisonTableSection data={deepTmsComparisonSection} />
      <AppointmentSection data={appointmentSection} services={services.docs} />
      <ServicesSection data={servicesSection} services={deepTmsServices?.docs as Service[]} />
      <FAQSection data={faqSection} />
    </div>
  )
}
