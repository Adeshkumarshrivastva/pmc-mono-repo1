import Link from 'next/link'
import { Logo } from '@/components/ui/logo'

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <div className="md:col-span-6 space-y-4">
            <div className="flex">
              <Link href="/" className="flex items-center gap-2">
                <Logo className="size-16" />
                <div className="text-left">
                  <div className="text-2xl font-semibold leading-tight">Positive</div>
                  <div className="text-base leading-tight">Mind Care</div>
                </div>
              </Link>
            </div>
            <div>
              <div className="font-medium">Address:</div>
              <div className="text-primary-foreground/50">
                804, Arcadia, South City II, Sector 49, <br /> Gurugram, Fatehpur, Haryana 122018
              </div>
            </div>
            <div>
              <div className="font-medium">Contact:</div>
              <div className="text-primary-foreground/50">089205 30832</div>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="mb-4 text-lg font-medium uppercase">SITE MAP</h3>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  {item.id === 'home' ? (
                    <Link
                      href={item.href}
                      className="transition-colors text-primary-foreground/50 hover:text-primary-foreground"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      rel="noopener noreferrer"
                      className="transition-colors text-primary-foreground/50 hover:text-primary-foreground"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="mb-4 text-lg font-medium uppercase">Awareness Campaign</h3>
            <ul className="space-y-2">
              {AWARENESS_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    rel="noopener noreferrer"
                    className="transition-colors text-primary-foreground/50 hover:text-primary-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="mb-4 text-lg font-medium uppercase">FOLLOW US</h3>
            <ul className="space-y-2">
              {FOLLOW_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    rel="noopener noreferrer"
                    className="transition-colors text-primary-foreground/50 hover:text-primary-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="text-primary-foreground/50">Copyright © {new Date().getFullYear()} </div>
          <div className="flex space-x-6">
            <a
              href={'/terms-of-use'}
              rel="noopener noreferrer"
              className="transition-colors text-primary-foreground/50 hover:text-primary-foreground"
            >
              Terms & Conditions
            </a>
            <a
              href={'/privacy-policy'}
              rel="noopener noreferrer"
              className="transition-colors text-primary-foreground/50 hover:text-primary-foreground"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

const NAV_ITEMS = [
  { id: 'home', href: '/', label: 'Home' },
  { id: 'about', href: '/about-us', label: 'About Us' },
  { id: 'deepTms', href: '/deep-tms', label: 'Deep TMS' },
  { id: 'contact-us', href: '/contact-us', label: 'Contact' },
]

const AWARENESS_ITEMS = [
  { id: 'blogs', href: '/blogs', label: 'Blogs' },
  { id: 'webinar', href: '/webinar', label: 'Webinar' },
  { id: 'press-release', href: '/press-release', label: 'Press Releases' },
  { id: 'news', href: '/news', label: 'News' },
  { id: 'campaigns', href: '/campaigns', label: 'Campaigns' },
  { id: 'ambassador-program', href: '/ambassador-program', label: 'Ambassador Program' },
  { id: 'internship', href: '/internship', label: 'Internship' },
]

const FOLLOW_ITEMS = [
  { id: 'facebook', href: '', label: 'Facebook' },
  { id: 'youtube', href: '', label: 'Youtube' },
  { id: 'instagram', href: '', label: 'Instagram' },
]
