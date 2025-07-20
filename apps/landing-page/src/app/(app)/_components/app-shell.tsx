import { getServices } from '@/payload/actions'
import Footer from './footer'
import Navbar from './navbar'

export default async function AppShell({ children }: React.PropsWithChildren) {
  const services = await getServices({})

  return (
    <div>
      <Navbar services={services.docs} />
      {children}
      <Footer />
    </div>
  )
}
