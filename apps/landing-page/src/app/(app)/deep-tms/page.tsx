import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import HeroSection from './_components/hero-section'
import FAQSection from '../_components/faq-section'
import AppointmentSection from '../_components/appointment-section'

export default async function DeepTmsPage() {
    const payload = await getPayloadClient()
    const { deepTmsHeroSection, faqSection, appointmentSection } = await payload.findGlobal({
        slug: 'deep-tms',
    })

    return (
        <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
            <HeroSection data={deepTmsHeroSection} />
            <AppointmentSection data={appointmentSection} />
            <FAQSection data={faqSection} />
        </div>
    )
}
