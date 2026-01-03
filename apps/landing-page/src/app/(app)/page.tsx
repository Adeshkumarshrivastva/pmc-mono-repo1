import { getPayloadClient } from '@/lib/payload'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getServices } from '@/payload/actions'
import HeroSection from './_components/hero-section'
import BookingSection from './_components/booking-section'
import TreatmentSection from './_components/treatment-section'
import ContactSection from './_components/contact-section'
import DeepTmsSection from './_components/deep-tms-section'
import FAQSection from './_components/faq-section'
import WhyChooseSection from './_components/why-choose-section'
import TestimonialSection from './_components/testimonial-section'
import BlogsSection from './_components/blogs-section'
import ExpertsSection from './_components/experts-section'
import ServicesSection from './_components/services-section'
import AchievementSection from './_components/achievement-section'
import QuizSection from './_components/quiz-section'
import MapSection from './_components/map-section'
import { getWebinars } from '@/payload/actions'
import WebinarsSection from './_components/webinars-section'
import PartnersSection from './_components/partners-section'
import { fetchPublicExperts } from '@/lib/experts'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const {
    heroSetion,
    bookingSection,
    deepTmsSection,
    mapSection,
    treatmentSection,
    contactSection,
    faqSection,
    whyChooseSection,
    testimonialSection,
    expertsSection,
    servicesSection,
    achievementSection,
    partnersSection,
    quizSection,
    blogsSection,
    webinarsSection,
  } = await payload.findGlobal({
    slug: 'home',
  })

  const topBlogs = await payload.find({
    collection: 'blog',
    sort: '-publishedAt',
    limit: 3,
  })

  const services = await getServices({})
  const webinars = await getWebinars({})

  const experts = await fetchPublicExperts()

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <HeroSection data={heroSetion} />
      <BookingSection data={bookingSection} />
      <DeepTmsSection data={deepTmsSection} />
      <MapSection data={mapSection} />
      <QuizSection data={quizSection} />
      <ServicesSection data={servicesSection} services={services.docs} />
      <TreatmentSection data={treatmentSection} />
      <WhyChooseSection data={whyChooseSection} />
      <ExpertsSection data={expertsSection} experts={experts} />
      {/* <PackagesSection data={packagesSection} /> */}
      <ContactSection data={contactSection} />
      <TestimonialSection data={testimonialSection} />
      <AchievementSection data={achievementSection} />
      <PartnersSection data={partnersSection} />
      <WebinarsSection data={webinarsSection} webinars={webinars.docs} />
      <BlogsSection data={blogsSection} blogs={topBlogs.docs} />
    </div>
  )
}
