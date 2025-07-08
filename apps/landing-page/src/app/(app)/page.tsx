import { getPayloadClient } from '@/lib/payload'
import HeroSection from './_components/hero-section'
import TreatmentSection from './_components/treatment-section'
import AppointmentSection from './_components/appointment-section'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const { heroSetion, treatmentSection, appointmentSection } = await payload.findGlobal({ slug: 'home' })

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection data={heroSetion} />
      <TreatmentSection data={treatmentSection} />
      <AppointmentSection data={appointmentSection} />
    </div>
  )
}
