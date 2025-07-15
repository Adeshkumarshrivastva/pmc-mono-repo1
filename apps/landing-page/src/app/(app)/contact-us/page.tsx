import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import ContactFormSection from './_components/contact-form-section'

export default async function ContactUsPage() {
  const payload = await getPayloadClient()
  const { contactUs } = await payload.findGlobal({
    slug: 'contact-us',
  })

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <ContactFormSection data={contactUs} />
    </div>
  )
}
