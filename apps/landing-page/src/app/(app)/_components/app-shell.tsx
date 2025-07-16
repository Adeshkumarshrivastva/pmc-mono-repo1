import Footer from './footer'
import Navbar from './navbar'

export default function AppShell({ children }: React.PropsWithChildren) {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}
