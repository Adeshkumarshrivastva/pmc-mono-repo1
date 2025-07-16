'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { MenuIcon } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { CallIcon } from '@/components/ui/icons'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

export default function Navbar() {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground" style={{ height: NAVBAR_HEIGHT }}>
      <nav className="flex items-center justify-between h-full px-4 py-2">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-16" />
          <div className="text-left">
            <div className="text-2xl font-semibold leading-tight">Positive</div>
            <div className="text-base leading-tight">Mind Care</div>
          </div>
        </Link>

        <div className="flex-1 hidden md:flex items-center justify-center space-x-8">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`text-lg font-semibold transition-colors rounded-md px-2 py-1 ${
                  isActive ? 'text-primary-foreground' : 'text-primary-foreground/50 hover:text-primary-foreground'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <Button variant="secondary" icon={<CallIcon />} className="hidden md:flex">
          Book Appointment
        </Button>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className="block md:hidden">
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="top">
            <SheetHeader>
              <SheetTitle className="mb-8 text-2xl text-accent-foreground">Positive Mind Care</SheetTitle>
              <SheetDescription className="space-y-6">
                {NAV_ITEMS.map((link) => {
                  return (
                    <div key={link.id} className="text-lg">
                      <Link href={`${link.href}`} onClick={() => setSheetOpen(false)}>
                        {link.label}
                      </Link>
                    </div>
                  )
                })}
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}

const NAV_ITEMS = [
  { id: 'home', href: '/', label: 'Home' },
  { id: 'about', href: '/about-us', label: 'About Us' },
  { id: 'deepTms', href: '/deep-tms', label: 'Deep TMS' },
  { id: 'contact-us', href: '/contact-us', label: 'Contact' },
]
