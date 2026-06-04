'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, ChevronRight, MenuIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import * as z from 'zod'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { Service } from '@/payload/types'
import { cn } from '@/lib/utils'
import { env } from '@/env'

type NavbarProps = { services: Service[] }

const NAV_ITEMS = [
  { id: 'home', href: '/', label: 'Home' },
  { id: 'about', href: '/about-us', label: 'About Us' },
  { id: 'deepTms', href: '/deep-tms', label: 'Deep TMS' },
  { id: 'services', href: '/services', label: 'Services' },
  { id: 'our-experts', href: '/portal/experts', label: 'Our Experts' },
  { id: 'awareness', href: '/webinars', label: 'Awareness' },
  { id: 'contact-us', href: '/contact-us', label: 'Contact' },
] as const

const AWARENESS_ITEMS = [
  { id: 'blogs', href: '/blogs', label: 'Blogs' },
  { id: 'webinars', href: '/webinars', label: 'Webinar & Workshops' },
  { id: 'internship', href: '/internship', label: 'Internship' },
  { id: 'events', href: '/events', label: 'Events&Camp' },
  // { id: 'camps', href: '/camps', label: 'Camps' },
] as const

const HOVER_DELAY = 400

export default function Navbar({ services }: NavbarProps) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  const { data, isPending } = useQuery({
    queryKey: ['get-user'],
    queryFn: async () => {
      const res = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/server/auth/get-session`, {
        credentials: 'include',
      })

      const data = await res.json()
      const parsed = z
        .object({
          user: z.object({
            id: z.string(),
          }),
        })
        .safeParse(data)

      if (!parsed.success) {
        return null
      }
      return parsed.data
    },
  })

  const isUserLoggedIn = data?.user && data.user.id

  const SHOW_BOOKING_BUTTON_ON_ROUTES = ['/', '/deep-tms', '/about-us', '/services']

  const showBookingButton =
    pathname === '/' || SHOW_BOOKING_BUTTON_ON_ROUTES.some((route) => route !== '/' && pathname.startsWith(route))

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow" style={{ height: NAVBAR_HEIGHT }}>
      <nav className="flex items-center justify-between h-full px-4 py-2 mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="size-16" />
          <div className="text-left">
            <div className="text-2xl font-semibold leading-tight">Positive</div>
            <div className="text-base leading-tight">Mind Care</div>
          </div>
        </Link>

        <div className="flex-1 hidden xl:flex items-center justify-center xl:space-x-8">
          {NAV_ITEMS.map((item) => {
            const isActive = `/${pathname.split('/')[1]}` === item.href
            if (item.id === 'services') {
              return <ServicesMenu key={item.id} services={services} isActive={isActive} />
            } else if (item.id === 'awareness') {
              return <AwarenessMenu key={item.id} isActive={isActive} />
            } else {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'text-lg font-semibold rounded-md px-2 py-1 transition-colors',
                    isActive ? 'text-primary-foreground' : 'text-primary-foreground/50 hover:text-primary-foreground',
                  )}
                >
                  {item.label}
                </Link>
              )
            }
          })}
        </div>
        {showBookingButton && (
          <Button
            variant="secondary"
            className="hidden xl:flex"
            disabled={isPending}
            onClick={() => {
              if (isUserLoggedIn) {
                window.location.href = `/portal`
              } else {
                window.location.href = `/portal/login`
              }
            }}
          >
            {isUserLoggedIn ? 'DASHBOARD' : 'SIGN IN'}
          </Button>
        )}

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className="block xl:hidden">
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="top">
            <SheetHeader>
              <SheetTitle className="mb-8 text-2xl text-accent-foreground">Positive Mind Care</SheetTitle>
              <SheetDescription asChild>
                <div className="space-y-6">
                  {NAV_ITEMS.map((link) => (
                    <div key={link.id} className="text-lg">
                      <Link href={link.href} onClick={() => setSheetOpen(false)}>
                        {link.label}
                      </Link>
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

function ServicesMenu({ services, isActive }: { services: Service[]; isActive: boolean }) {
  const [isHovered, setIsHovered] = useState(false)

  // Filter main services (those without parent)
  const mainServices = services.filter(service => !service.parent)


  return (
    <HoverCard
      open={isHovered}
      openDelay={HOVER_DELAY}
      onOpenChange={(value) => {
        setIsHovered(value)
      }}
    >
      <HoverCardTrigger asChild>
        <Link
          href={'/services'}
          className={cn(
            'transition-colors rounded-md px-2 py-1',
            isActive || isHovered
              ? 'text-primary-foreground'
              : 'text-primary-foreground/50 hover:text-primary-foreground',
          )}
          onMouseEnter={() => {
            setIsHovered(true)
          }}
        >
          <button className="flex w-full justify-between text-left items-center text-lg font-semibold space-x-2 cursor-pointer">
            <span>Services</span>
            <ChevronDown
              className={cn('size-4 flex-shrink-0 transition-transform duration-200', isHovered ? 'rotate-180' : null)}
            />
          </button>
        </Link>
      </HoverCardTrigger>

      <HoverCardContent align="center" className="p-0 w-[900px] max-h-[500px] overflow-y-auto">
        <div className="grid grid-cols-3 gap-0 bg-primary-foreground">
          {mainServices.length === 0 ? (
            <div className="col-span-3 p-4 text-center text-muted-foreground">
              No main services found. Please add services in CMS.
            </div>
          ) : (
            mainServices.map((mainService) => (
              <div key={mainService.id} className="border-r last:border-r-0 border-border">
                {/* Main Category Header */}
                <div className="bg-accent p-3 border-b border-border sticky top-0 z-10">
                  <Link href={`/services/${mainService.slug}`}>
                    <h3 className="font-bold text-xs uppercase text-primary hover:text-primary/80">
                      {mainService.name}
                    </h3>
                  </Link>
                </div>
                
                {/* Sub-services */}
                <div className="flex flex-col">
                  {mainService.subservices?.docs && mainService.subservices.docs.length > 0 ? (
                    mainService.subservices.docs.map((subService) => {
                      const typedSubService = subService as Service
                      return (
                        <Link
                          key={typedSubService.id}
                          href={`/services/${mainService.slug}/${typedSubService.slug}`}
                          className="px-3 py-2 hover:bg-accent text-xs text-foreground hover:text-primary transition-colors border-b border-border/50 last:border-b-0"
                        >
                          {typedSubService.name}
                        </Link>
                      )
                    })
                  ) : (
                    <div className="px-3 py-2 text-xs text-muted-foreground italic">
                      No sub-services
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

function AwarenessMenu({ isActive }: { isActive: boolean }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <HoverCard open={isHovered} openDelay={HOVER_DELAY} onOpenChange={setIsHovered}>
      <HoverCardTrigger asChild>
        <Link
          href={'/webinars'}
          className={cn(
            'transition-colors rounded-md px-2 py-1',
            isActive || isHovered
              ? 'text-primary-foreground'
              : 'text-primary-foreground/50 hover:text-primary-foreground',
          )}
          onMouseEnter={() => {
            setIsHovered(true)
          }}
        >
          <button className="flex w-full justify-between text-left items-center text-lg font-semibold space-x-2 cursor-pointer">
            <span>Awareness</span>
            <ChevronDown
              className={cn('size-4 flex-shrink-0 transition-transform duration-200', isHovered ? 'rotate-180' : null)}
            />
          </button>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent align="center" className="p-0 flex flex-col w-64 bg-primary-foreground">
        {AWARENESS_ITEMS.map((item) => {
          const isExternal = item.href.startsWith('http')
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex w-full"
              {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
            >
              <button className="flex w-full text-left items-center py-2 px-4 hover:font-medium hover:bg-accent space-x-2 cursor-pointer">
                <span>{item.label}</span>
              </button>
            </Link>
          )
        })}
      </HoverCardContent>
    </HoverCard>
  )
}
