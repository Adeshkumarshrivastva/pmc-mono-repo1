'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, ChevronRight, MenuIcon } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { CallIcon } from '@/components/ui/icons'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Service } from '@/payload/types'

type NavbarProps = {
  services: Service[]
}

const NAV_ITEMS = [
  { id: 'home', href: '/', label: 'Home' },
  { id: 'about', href: '/about-us', label: 'About Us' },
  { id: 'deepTms', href: '/deep-tms', label: 'Deep TMS' },
  { id: 'services', href: '/services', label: 'Services' },
  { id: 'contact-us', href: '/contact-us', label: 'Contact' },
] as const

const HOVER_DELAY = 400

export default function Navbar({ services }: NavbarProps) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleBooking = () => {
    document.getElementById('appointement-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground" style={{ height: NAVBAR_HEIGHT }}>
      <nav className="flex items-center justify-between h-full px-4 py-2 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-16" />
          <div className="text-left">
            <div className="text-2xl font-semibold leading-tight">Positive</div>
            <div className="text-base leading-tight">Mind Care</div>
          </div>
        </Link>

        <div className="flex-1 hidden md:flex items-center justify-center space-x-8">
          {NAV_ITEMS.map((item) => {
            const isActive = `/${pathname.split('/')[1]}` === item.href

            if (item.id === 'services') {
              return (
                <HoverCard key={item.id} openDelay={HOVER_DELAY}>
                  <HoverCardTrigger asChild>
                    <Link
                      href={item.href}
                      className={`group transition-colors rounded-md px-2 py-1 ${
                        isActive
                          ? 'text-primary-foreground'
                          : 'text-primary-foreground/50 hover:text-primary-foreground'
                      }`}
                    >
                      <button className="flex w-full justify-between text-left items-center py-2 px-4 text-lg font-semibold space-x-2 cursor-pointer">
                        <span>{item.label}</span>
                        <ChevronDown className="size-4 flex-shrink-0 group-hover:rotate-180 transition-transform duration-200" />
                      </button>
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent align="start" className="cursor-pointer flex flex-col p-0">
                    {services.map((service) => (
                      <div className="flex w-full justify-between" key={service.id}>
                        <HoverCard openDelay={HOVER_DELAY}>
                          <HoverCardTrigger asChild>
                            <Link href={`${item.href}/${service.slug}`} className="group flex w-full">
                              <button className="flex w-full justify-between text-left items-center py-2 px-4 font-medium space-x-2 cursor-pointer">
                                <span>{service.name}</span>
                                <ChevronRight className="size-4 flex-shrink-0 text-primary/30 group-hover:text-primary" />
                              </button>
                            </Link>
                          </HoverCardTrigger>
                          <HoverCardContent side="right" align="start" className="flex flex-col p-0 justify-center">
                            {service.subservices?.docs?.map((subService) => {
                              const typedSubService = subService as Service
                              return (
                                <button
                                  key={typedSubService.id}
                                  className="flex w-full text-left items-center py-2 px-4 font-medium space-x-2 cursor-pointer"
                                >
                                  <span>{typedSubService.name}</span>
                                </button>
                              )
                            })}
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    ))}
                  </HoverCardContent>
                </HoverCard>
              )
            }

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

        <Button
          variant="secondary"
          icon={<CallIcon />}
          className="hidden md:flex"
          onClick={() => {
            handleBooking()
          }}
        >
          Book Appointment
        </Button>

        {/* Navigation Menu for Mobile */}
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
