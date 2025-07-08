import { getPayloadClient } from '@/lib/payload'
import HeroSection from './_components/hero-section'
import TreatmentSection from './_components/treatment-section'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const { heroSetion, treatmentSection } = await payload.findGlobal({ slug: 'home' })

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection data={heroSetion} />
      <TreatmentSection data={treatmentSection} />
    </div>
  )
}
