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
import AcademySection from './_components/academy-section'
import ServicesSection from './_components/services-section'
import WhyChooseSection from './_components/why-choose-section'
import MapSection from './_components/map-section'
import ContactSection from './_components/contact-section'
import TestimonialSection from './_components/testimonial-section'
import AchievementSection from './_components/achievement-section'
import PartnersSection from './_components/partners-section'
import BlogsSection from './_components/blogs-section'
import PopupNotification from './_components/popup-notification'
import SouvenirSection from './_components/souvenir-section'
import NewsSection from './_components/news-section'
import { flattenNews } from './_components/news-card'

const homepageSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://positivemindcare.com/#mentalhealthclinic',
      name: 'Positive Mind Care',
      url: 'https://positivemindcare.com/',
      logo: 'https://positivemindcare.com/wp-content/uploads/2024/03/logo.png',
      description:
        'Positive Mind Care is a leading mental health clinic in Gurugram providing expert psychiatric care, psychological counselling, Deep TMS therapy and evidence-based treatment for anxiety, depression, OCD, ADHD, addiction, bipolar disorder and other mental health conditions.',
    },
    {
      '@type': 'MedicalClinic',
      '@id': 'https://positivemindcare.com/#clinic',
      name: 'Positive Mind Care',
      url: 'https://positivemindcare.com/',
      telephone: '+91-8920530832',
      priceRange: '₹₹',
      medicalSpecialty: ['Psychiatry', 'Mental Health', 'Psychology', 'Addiction Medicine', 'Behavioral Health'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'GF - 43, M2K Corporate Park, N Block, Mayfield Garden, Sector 51',
        addressLocality: 'Gurugram',
        addressRegion: 'Haryana',
        postalCode: '122018',
        addressCountry: 'IN',
      },
      areaServed: ['Gurugram', 'Delhi', 'Noida', 'Faridabad', 'Ghaziabad', 'Delhi NCR'],
      description:
        'Best mental health clinic in Gurugram offering treatment for anxiety, depression, OCD, ADHD, addiction, bipolar disorder, sleep disorders and Deep TMS therapy.',
      keywords: [
        'Mental Health Clinic Gurgaon',
        'Best Psychiatrist Gurgaon',
        'Psychologist Gurgaon',
        'Anxiety Treatment Gurgaon',
        'Depression Treatment Gurgaon',
        'OCD Treatment Gurgaon',
        'ADHD Treatment Gurgaon',
        'Addiction Treatment Gurgaon',
        'Deep TMS Gurgaon',
        'Mental Health Centre Gurgaon',
        'Mental Health Clinic Delhi NCR',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://positivemindcare.com/#website',
      url: 'https://positivemindcare.com/',
      name: 'Positive Mind Care',
      publisher: {
        '@id': 'https://positivemindcare.com/#organization',
      },
      inLanguage: 'en-IN',
    },
    {
      '@type': 'WebPage',
      '@id': 'https://positivemindcare.com/#webpage',
      url: 'https://positivemindcare.com/',
      name: 'Best Mental Health Clinic in Gurgaon | Positive Mind Care',
      isPartOf: {
        '@id': 'https://positivemindcare.com/#website',
      },
      about: {
        '@id': 'https://positivemindcare.com/#clinic',
      },
      description:
        'Positive Mind Care provides psychiatric treatment, psychological counselling, Deep TMS therapy and mental health services in Gurugram.',
    },
    {
      '@type': 'OfferCatalog',
      name: 'Mental Health Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: 'Anxiety Treatment' } },
        { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: 'Depression Treatment' } },
        { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: 'OCD Treatment' } },
        { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: 'ADHD Treatment' } },
        { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: 'Addiction Treatment' } },
        { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: 'Bipolar Disorder Treatment' } },
        { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: 'Deep TMS Therapy' } },
        { '@type': 'Offer', itemOffered: { '@type': 'MedicalTherapy', name: 'Psychological Counselling' } },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What mental health services does Positive Mind Care provide?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Positive Mind Care provides treatment for anxiety, depression, OCD, ADHD, addiction, bipolar disorder, stress disorders, sleep disorders and psychological counselling.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Positive Mind Care provide Deep TMS therapy?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, Positive Mind Care offers Deep TMS therapy for depression, OCD and other mental health conditions.',
          },
        },
        {
          '@type': 'Question',
          name: 'Where is Positive Mind Care located?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Positive Mind Care is located in Sector 51, Gurugram, Haryana and serves patients across Delhi NCR.',
          },
        },
      ],
    },
  ],
}

export default async function HomePage() {
  try {
    const payload = await getPayloadClient()

    const [homeData, topBlogs, services, webinars, souvenirs, topNews] = await Promise.all([
      payload.findGlobal({ slug: 'home', depth: 2 }),
      payload.find({ collection: 'blog', sort: '-publishedAt', limit: 3, depth: 2 }),
      getServices({}),
      getWebinars({}),
      payload.find({ collection: 'souvenirs', depth: 2, limit: 1, sort: 'createdAt' }),
      payload.find({ collection: 'news', sort: '-publishedAt', limit: 10, depth: 2 }),
    ])

    const {
      bookingSection,
      meterSection,
      heroSetion,
      deepTmsSection,
      treatmentSection,
      wellnessSection,
      cardSection,
      newsSection,
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
    } = homeData

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
        />
        <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
          <PopupNotification />
        <BookingSection data={bookingSection} />
        <MeterSection data={meterSection} />
        <HeroSection data={heroSetion} />
        <DeepTmsSection data={deepTmsSection} />
        <TreatmentSection data={treatmentSection} />
        <WellnessSection data={wellnessSection} />
        <CardSection data={cardSection} />
        <SouvenirSection souvenir={(souvenirs.docs[0] as import('@/payload/types').Souvenir) ?? null} />
        <NewsSection data={newsSection} news={flattenNews(topNews.docs).slice(0, 3)} />
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
        </div>
      </>
    )
  } catch (error) {
    console.error('[HomePage] Failed to load page data from Payload:', error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500 p-8 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Failed to load page</h1>
          <p className="text-sm opacity-70">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    )
  }
}
