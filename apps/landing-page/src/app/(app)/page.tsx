import { getPayloadClient } from '@/lib/payload'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getServices, getWebinars } from '@/payload/actions'
import BookingSection from './_components/booking-section'
import MeterSection from './_components/meter-section'
import HeroSection from './_components/hero-section'
import DeepTmsSection from './_components/deep-tms-section'
import TreatmentSection from './_components/treatment-section'
import WellnessSection from './_components/wellness-section'
import CardSection from './_components/card-section'
import PackagesSection from './_components/packages-section'
import WebinarsSection from './_components/webinars-section'
import AcademySection from './academy/page'
import ServicesSection from './_components/services-section'
import WhyChooseSection from './_components/why-choose-section'
import MapSection from './_components/map-section'
import ContactSection from './_components/contact-section'
import TestimonialSection from './_components/testimonial-section'
import AchievementSection from './_components/achievement-section'
import PartnersSection from './_components/partners-section'
import BlogsSection from './_components/blogs-section'
import ExpertsSection from './_components/experts-section'
import QuizSection from './_components/quiz-section'
import FAQSection from './_components/faq-section'

export default async function HomePage() {
  const payload = await getPayloadClient()
  const {
    bookingSection,
    meterSection,
    heroSetion,
    deepTmsSection,
    treatmentSection,
    wellnessSection,
    cardSection,
    packagesSection,
    webinarsSection,
    academySection,
    servicesSection,
    whyChooseSection,
    mapSection,
    contactSection,
    testimonialSection,
    achievementSection,
    partnersSection,
    blogsSection,
    // expertsSection,
    // quizSection,
    // faqSection,
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

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <BookingSection data={bookingSection} />
      <MeterSection data={meterSection} />
      <HeroSection data={heroSetion} />
      <DeepTmsSection data={deepTmsSection} />
      <TreatmentSection data={treatmentSection} />
      <WellnessSection data={wellnessSection} />
      <CardSection data={cardSection} />
      <PackagesSection data={packagesSection} />
      <WebinarsSection data={webinarsSection} webinars={webinars.docs} />
      <AcademySection data={academySection} />
      <ServicesSection data={servicesSection} services={services.docs} />
      <WhyChooseSection data={whyChooseSection} />
      <MapSection data={mapSection} />
      <ContactSection data={contactSection} />
      <TestimonialSection data={testimonialSection} />
      <AchievementSection data={achievementSection} />
      <PartnersSection data={partnersSection} />
      <BlogsSection data={blogsSection} blogs={topBlogs.docs} />
      {/* <ExpertsSection data={expertsSection} experts={experts} /> */}
      {/* <QuizSection data={quizSection} /> */}
      {/* <FAQSection data={faqSection} /> */}
    </div>
  )
}
