'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, ChevronRight, MenuIcon } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { Service } from '@/payload/types'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import * as z from 'zod'

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
] as const

const HOVER_DELAY = 400

export default function Navbar({ services }: NavbarProps) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  const { data, isPending } = useQuery({
    queryKey: ['get-user'],
    queryFn: async () => {
      const res = await fetch(`/server/auth/get-session`, {
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

  const dashboard = () => {
    const getUrl = process.env.NEXT_PUBLIC_API_BASE_URL
    if (!getUrl) {
      return
    }
  }

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
  const [activeServiceId, setActiveServiceId] = useState<string | undefined>(services[0].id)
  const activeService = services.find((service) => service.id === activeServiceId)

  return (
    <HoverCard
      open={isHovered}
      openDelay={HOVER_DELAY}
      onOpenChange={(value) => {
        if (!value) {
          setActiveServiceId(services[0].id)
          setIsHovered(false)
        }
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

      <HoverCardContent align="center" className="p-0 flex w-lg">
        <div className="cursor-pointer w-full flex flex-col bg-primary-foreground">
          {services.map((service) => {
            const isActiveService = service.id === activeServiceId
            return (
              <div
                className={cn('flex w-full justify-between', isActiveService ? 'bg-accent' : null)}
                key={service.id}
                onMouseEnter={() => {
                  setActiveServiceId(service.id)
                }}
              >
                <Link href={`/services/${service.slug}`} className="group flex w-full">
                  <button
                    className={cn(
                      'flex w-full justify-between text-left items-center py-2 px-4 space-x-2 cursor-pointer',
                      isActiveService ? 'font-medium' : null,
                    )}
                  >
                    <span>{service.name}</span>
                    <ChevronRight
                      className={cn('size-4 flex-shrink-0 text-primary', isActiveService ? 'opacity-100' : 'opacity-0')}
                    />
                  </button>
                </Link>
              </div>
            )
          })}
        </div>
        <div className="cursor-pointer w-full flex flex-col bg-primary-foreground shadow-xl">
          {activeService
            ? activeService.subservices?.docs?.map((subService) => {
                const typedSubService = subService as Service

                return (
                  <Link
                    key={typedSubService.id}
                    href={`/services/${activeService.slug}/${typedSubService.slug}`}
                    className="flex w-full"
                  >
                    <button className="flex w-full text-left items-center py-2 px-4 hover:font-medium space-x-2 cursor-pointer">
                      <span>{typedSubService.name}</span>
                    </button>
                  </Link>
                )
              })
            : null}
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
