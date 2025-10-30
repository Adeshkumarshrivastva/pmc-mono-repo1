import { getPayloadClient } from '@/lib/payload'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getServices } from '@/payload/actions'
import HeroSection from './_components/hero-section'
import TreatmentSection from './_components/treatment-section'
import AppointmentSection from './_components/appointment-section'
import DeepTmsSection from './_components/deep-tms-section'
import FAQSection from './_components/faq-section'
import WhyChooseSection from './_components/why-choose-section'
import TestimonialSection from './_components/testimonial-section'
import BlogsSection from './_components/blogs-section'
import ExpertsSection from './_components/experts-section'
import ServicesSection from './_components/services-section'
import AchievementSection from './_components/achievement-section'
import QuizSection from './_components/quiz-section'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const {
    heroSetion,
    deepTmsSection,
    treatmentSection,
    appointmentSection,
    faqSection,
    whyChooseSection,
    testimonialSection,
    expertsSection,
    servicesSection,
    achievementSection,
    quizSection,
    blogsSection,
  } = await payload.findGlobal({
    slug: 'home',
  })

  const topBlogs = await payload.find({
    collection: 'blog',
    sort: '-publishedAt',
    limit: 3,
  })

  const services = await getServices({})

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <HeroSection data={heroSetion} />
      <DeepTmsSection data={deepTmsSection} />
      <QuizSection data={quizSection} />
      <ServicesSection data={servicesSection} services={services.docs} />
      <TreatmentSection data={treatmentSection} />
      <WhyChooseSection data={whyChooseSection} />
      <ExpertsSection data={expertsSection} />
      {/* <PackagesSection data={packagesSection} /> */}
      <AppointmentSection data={appointmentSection} services={services.docs} />
      <TestimonialSection data={testimonialSection} />
      <AchievementSection data={achievementSection} />
      <BlogsSection data={blogsSection} blogs={topBlogs.docs} />
    </div>
  )
}
