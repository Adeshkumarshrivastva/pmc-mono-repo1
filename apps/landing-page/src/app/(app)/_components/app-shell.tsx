import { getServices } from '@/payload/actions'
import { getPayloadClient } from '@/lib/payload'
import Footer from './footer'
import Navbar from './navbar'

export default async function AppShell({ children }: React.PropsWithChildren) {
  const payload = await getPayloadClient()
  const footerData = await payload.findGlobal({
    slug: 'footer',
  })

  const services = await getServices({})

  return (
    <div>
      <Navbar services={services.docs} />
      {children}
      <Footer data={footerData} />
    </div>
  )
}
