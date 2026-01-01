import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import { getServices } from '@/payload/actions'
import HeroSection from './_components/hero-section'
import FAQSection from '../_components/faq-section'
import ContactSection from '../_components/contact-section'
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
    contactSection,
    deepTmsComparisonSection,
    deepTmsEligibilitySection,
    servicesSection,
  } = await payload.findGlobal({
    slug: 'deep-tms',
  })

  const services = await getServices({})
  const deepTmsServices = await getServices({ parentServiceSlug: 'deep-tms' })

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <HeroSection data={deepTmsHeroSection} />
      <WorkSection data={deepTmsWorkSection} />
      <EligibilitySection data={deepTmsEligibilitySection} />
      <ComparisonTableSection data={deepTmsComparisonSection} />
      <ContactSection data={contactSection} />
      <ServicesSection data={servicesSection} services={deepTmsServices.docs} />
      <FAQSection data={faqSection} />
    </div>
  )
}
