import { Link, useLocation } from '@tanstack/react-router'
import { useState } from 'react'
import { MenuIcon } from 'lucide-react'
import type { Service } from '@pmc/server/src/generated/prisma/client'
import { Logo } from '@/components/ui/logo'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

type NavbarProps = { services: Service[] }

const NAV_ITEMS = [
  { id: 'home', href: 'https://positivemindcare.com/', label: 'Home' },
  { id: 'about', href: 'https://positivemindcare.com/about-us', label: 'About Us' },
  { id: 'deepTms', href: 'https://positivemindcare.com/deep-tms', label: 'Deep TMS' },
  { id: 'services', href: 'https://positivemindcare.com/services', label: 'Services' },
  { id: 'our-experts', href: '/portal/experts', label: 'Our Experts' },
  { id: 'webinars', href: 'https://positivemindcare.com/webinars', label: 'Awareness' },
  { id: 'contact-us', href: 'https://positivemindcare.com/contact-us', label: 'Contact' },
] as const

export default function Navbar({}: NavbarProps) {
  const location = useLocation()
  const pathname = location.pathname
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow" style={{ height: NAVBAR_HEIGHT }}>
      <nav className="flex items-center justify-between h-full px-4 py-2 mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="size-16" />
          <div className="text-left">
            <div className="text-2xl font-semibold leading-tight">Positive</div>
            <div className="text-base leading-tight">Mind Care</div>
          </div>
        </Link>

        <div className="flex-1 hidden xl:flex items-center justify-center xl:space-x-8">
          {NAV_ITEMS.map((item) => {
            const isInternal = item.href.startsWith('/portal')
            const isActive = isInternal && pathname === item.href
            return (
              <a
                key={item.id}
                href={item.href}
                className={cn(
                  'text-lg font-semibold rounded-md px-2 py-1 transition-colors',
                  isActive ? 'text-primary-foreground' : 'text-primary-foreground/50 hover:text-primary-foreground',
                )}
              >
                {item.label}
              </a>
            )
          })}
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className="block xl:hidden">
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="top">
            <SheetHeader>
              <SheetTitle className="mb-8 text-2xl text-accent-foreground">Positive Mind Care</SheetTitle>
              <SheetDescription>
                <div className="space-y-6">
                  {NAV_ITEMS.map((link) => (
                    <div key={link.id} className="text-lg">
                      <a href={link.href} onClick={() => setSheetOpen(false)}>
                        {link.label}
                      </a>
                    </div>
                  ))}
                </div>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
