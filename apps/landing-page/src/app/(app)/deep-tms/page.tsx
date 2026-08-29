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

const deepTmsSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'MedicalWebPage',
      '@id': 'https://positivemindcare.com/deep-tms/#webpage',
      url: 'https://positivemindcare.com/deep-tms',
      name: 'Deep TMS Therapy in India | BrainsWay Deep TMS | Positive Mind Care',
      description:
        'FDA-cleared BrainsWay Deep TMS Therapy for Depression, OCD, Anxiety, Addiction and Smoking Cessation. Non-invasive, drug-free mental health treatment in Gurugram.',
      keywords: [
        'Deep TMS Therapy India',
        'BrainsWay TMS India',
        'Deep TMS Gurgaon',
        'Deep TMS Delhi NCR',
        'TMS Therapy for Depression',
        'TMS Therapy for OCD',
        'TMS Therapy for Anxiety',
        'Deep TMS for Addiction',
        'Smoking Cessation Treatment',
        'Drug Free Depression Treatment',
        'FDA Approved TMS India',
        'Non Invasive Mental Health Treatment',
        'Treatment Resistant Depression India',
        'OCD Treatment Without Medication',
        'Advanced Mental Health Treatment India',
      ],
    },
    {
      '@type': 'MedicalProcedure',
      name: 'BrainsWay Deep TMS Therapy',
      procedureType: 'Non-Invasive Brain Stimulation',
      bodyLocation: 'Brain',
      howPerformed:
        'Magnetic pulses are delivered through an H-Coil helmet to stimulate deep brain regions associated with mood, behavior and emotional regulation.',
      recognizingAuthority: 'FDA',
      description:
        'Deep TMS is a non-invasive brain stimulation therapy that reaches deeper brain structures than standard TMS and is used for depression, OCD, anxiety and addiction.',
    },
    {
      '@type': 'MedicalTherapy',
      name: 'Deep Transcranial Magnetic Stimulation (Deep TMS)',
      alternateName: 'BrainsWay Deep TMS',
      description:
        'Advanced FDA-cleared treatment using magnetic stimulation to target deep brain regions involved in depression, OCD, anxiety and addiction.',
      medicineSystem: 'Evidence Based Medicine',
    },
    {
      '@type': 'MedicalClinic',
      '@id': 'https://positivemindcare.com/#clinic',
      name: 'Positive Mind Care',
      url: 'https://positivemindcare.com',
      telephone: '+918920530832',
      medicalSpecialty: ['Psychiatry', 'Mental Health', 'Psychology', 'Behavioral Health', 'Neurostimulation Therapy'],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'GF - 43, M2K Corporate Park, N Block, Mayfield Garden, Sector 51',
        addressLocality: 'Gurugram',
        addressRegion: 'Haryana',
        postalCode: '122018',
        addressCountry: 'IN',
      },
    },
    {
      '@type': 'Service',
      name: 'Deep TMS Treatment Services',
      provider: {
        '@id': 'https://positivemindcare.com/#clinic',
      },
      areaServed: ['Gurugram', 'Delhi', 'Noida', 'Faridabad', 'Ghaziabad', 'Delhi NCR', 'India'],
      serviceType: [
        'Deep TMS for Depression',
        'Deep TMS for OCD',
        'Deep TMS for Anxiety',
        'Deep TMS for Addiction',
        'Deep TMS for Smoking Cessation',
        'Deep TMS for Bipolar Depression',
        'Deep TMS for Parkinson\'s',
        'Deep TMS for Schizophrenia',
        'Deep TMS for Tinnitus',
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is Deep TMS and how is it different from standard TMS?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Deep TMS uses BrainsWay H-Coil technology to stimulate deeper brain regions involved in mood, anxiety and compulsive behaviors, reaching significantly deeper areas than standard TMS.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Deep TMS FDA approved?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Deep TMS is FDA-cleared for conditions including Depression, OCD and Smoking Cessation.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can Deep TMS help with depression and OCD?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Deep TMS is commonly used for treatment-resistant depression, OCD and other mental health conditions by targeting neural circuits associated with symptoms.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does a Deep TMS session take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A typical Deep TMS session takes approximately 20 minutes and requires no anesthesia or recovery time.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is Deep TMS a medication-free treatment?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Deep TMS is a drug-free and non-invasive treatment that uses magnetic stimulation rather than medication.',
          },
        },
      ],
    },
  ],
}

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(deepTmsSchema) }} />
      <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
        <HeroSection data={deepTmsHeroSection} />
      <WorkSection data={deepTmsWorkSection} />
      <EligibilitySection data={deepTmsEligibilitySection} />
      <ComparisonTableSection data={deepTmsComparisonSection} />
      <ContactSection data={contactSection} />
        <ServicesSection data={servicesSection} services={deepTmsServices.docs} />
        <FAQSection data={faqSection} />
      </div>
    </>
  )
}
