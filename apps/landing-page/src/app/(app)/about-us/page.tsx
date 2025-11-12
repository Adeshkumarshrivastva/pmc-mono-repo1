import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import { getServices } from '@/payload/actions'
import HeroSection from './_components/hero-section'
import WhatWeDoSection from './_components/what-we-do-section'
import MissionVisionSection from './_components/mission-vision-section'
import OpportunitySection from './_components/opportunity-section'
import TeamMembersSection from './_components/team-members-section'
import ExpertsSection from '../_components/experts-section'
import ContactSection from '../_components/contact-section'

export default async function Page() {
  const payload = await getPayloadClient()
  const {
    aboutUsHeroSection,
    whatWeDoSection,
    missionVisionStory,
    teamMembersSection,
    expertsSection,
    opportunitiesSection,
    contactSection,
  } = await payload.findGlobal({
    slug: 'about-us',
  })

  const services = await getServices({})

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <HeroSection data={aboutUsHeroSection} />
      <WhatWeDoSection data={whatWeDoSection} />
      <MissionVisionSection data={missionVisionStory} />
      <TeamMembersSection data={teamMembersSection} />
      <ExpertsSection data={expertsSection} />
      <OpportunitySection data={opportunitiesSection} />
      <ContactSection data={contactSection} services={services.docs} />
    </div>
  )
}
