import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import { getServices } from '@/payload/actions'
import ContactFormSection from './_components/contact-form-section'

export default async function ContactUsPage() {
  const payload = await getPayloadClient()
  const { contactUs } = await payload.findGlobal({
    slug: 'contact-us',
  })

  const services = await getServices({})

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <ContactFormSection data={contactUs} services={services.docs} />
    </div>
  )
}
