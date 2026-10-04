'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronRight, MenuIcon, Download, X, CheckCircle2, Loader2, MessageCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import * as z from 'zod'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { Service } from '@/payload/types'
import { cn } from '@/lib/utils'
import { apiUrl } from '@/lib/api'
import { ACADEMY_APP_URL } from '@/lib/academy'
import { openQuikwitChatWidget } from './quikwit-chat-widget'
import { toSiteHref } from '@/lib/links'

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

// `external: true` marks a destination that is not a Next.js route — it is served
// by a different app behind the same domain, so it needs a full page load via <a>.
const EXTERNAL_NAV_ITEMS = [
  { id: 'ambassador', href: '/ambassador', label: 'Ambassador', external: false },
  { id: 'academy', href: ACADEMY_APP_URL, label: 'Academy', external: true },
  { id: 'souvenir', href: '/souvenir', label: 'Souvenir', external: false },
] as const

const AWARENESS_ITEMS = [
  { id: 'blogs', href: '/blogs', label: 'Blogs' },
  { id: 'webinars', href: '/webinars', label: 'Webinar & Workshops' },
  { id: 'internship', href: '/internship', label: 'Internship' },
  { id: 'events', href: '/events', label: 'Events & Camp' },
  { id: 'news', href: '/news', label: 'News' },
  // { id: 'camps', href: '/camps', label: 'Camps' },
] as const

const HOVER_DELAY = 400

// Served from apps/landing-page/public/app-release.apk
const APP_DOWNLOAD_URL = '/app-release.apk'

const APP_DOWNLOAD_FEATURES = [
  'Book appointments in seconds',
  'Secure, private access to your care',
  'Real-time updates & reminders',
] as const

export default function Navbar({ services }: NavbarProps) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isAppDownloadModalOpen, setIsAppDownloadModalOpen] = useState(false)
  const [isAppDownloading, setIsAppDownloading] = useState(false)

  const handleAppDownloadClick = () => {
    if (isAppDownloading) return

    setIsAppDownloading(true)
    window.setTimeout(() => {
      setIsAppDownloading(false)
    }, 2500)
  }

  const handleAppDownloadModalOpen = () => {
    setIsAppDownloadModalOpen(true)
  }

  const handleAppDownloadModalClose = () => {
    setIsAppDownloadModalOpen(false)
    setIsAppDownloading(false)
  }

  // Radix leaves `pointer-events: none` stuck on <body> when this dialog opens in the same tick as the
  // mobile menu (Sheet) closing — that made every button inside the modal, including Close, unclickable.
  useEffect(() => {
    if (!isAppDownloadModalOpen) return

    const timer = window.setTimeout(() => {
      if (document.body.style.pointerEvents === 'none') {
        document.body.style.pointerEvents = ''
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [isAppDownloadModalOpen])

  const { data, isPending } = useQuery({
    queryKey: ['get-user'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/server/auth/get-session'), {
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
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo className="size-10" />
          <div className="text-left">
            <div className="text-lg font-semibold leading-tight">Positive</div>
            <div className="text-sm leading-tight">Mind Care</div>
          </div>
        </Link>

        <div className="flex-1 min-w-0 hidden xl:flex items-center justify-center gap-2">
          {NAV_ITEMS.map((item) => {
            if (item.id === 'contact-us') return null
            const isActive = `/${pathname.split('/')[1]}` === item.href
            if (item.id === 'services') {
              return <ServicesMenu key={item.id} services={services} isActive={isActive} />
            } else if (item.id === 'awareness') {
              return <AwarenessMenu key={item.id} isActive={isActive} />
            } else {
              return (
                <Link
                  key={item.id}
                  href={toSiteHref(item.href)}
                  className={cn(
                    'text-sm font-semibold rounded-md px-1.5 py-1 transition-colors whitespace-nowrap',
                    isActive ? 'text-primary-foreground' : 'text-primary-foreground/50 hover:text-primary-foreground',
                  )}
                >
                  {item.label}
                </Link>
              )
            }
          })}
          <div className="flex items-center gap-1.5 border-l border-primary-foreground/20 pl-3">
            {EXTERNAL_NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const className = cn(
                'text-xs font-semibold rounded-full border border-primary-foreground/40 px-2.5 py-0.5 transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary-foreground text-primary'
                  : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:border-primary-foreground',
              )

              // Another app on the same domain — needs a real navigation, not a
              // client-side route resolve.
              if (item.external) {
                return (
                  <a key={item.id} href={toSiteHref(item.href)} className={className}>
                    {item.label}
                  </a>
                )
              }

              return (
                <Link key={item.id} href={toSiteHref(item.href)} className={className}>
                  {item.label}
                </Link>
              )
            })}
          </div>
          <Link
            href="/contact-us"
            className={cn(
              'text-sm font-semibold rounded-md px-1.5 py-1 transition-colors whitespace-nowrap',
              `/${pathname.split('/')[1]}` === '/contact-us'
                ? 'text-primary-foreground'
                : 'text-primary-foreground/50 hover:text-primary-foreground',
            )}
          >
            Contact
          </Link>
        </div>
        <div className="hidden xl:flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={openQuikwitChatWidget}
            className="flex items-center gap-1.5 text-xs font-semibold rounded-full border border-primary-foreground/40 px-2.5 py-1 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:border-primary-foreground transition-colors whitespace-nowrap shrink-0"
          >
            <MessageCircle className="size-3.5" />
            Dr Shy
          </button>

          <button
            type="button"
            onClick={handleAppDownloadModalOpen}
            className="flex items-center gap-1.5 text-xs font-semibold rounded-full border border-primary-foreground/40 px-2.5 py-1 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:border-primary-foreground transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="size-3.5" />
            Get the App
          </button>

          {showBookingButton && (
            <Button
              variant="secondary"
              size="sm"
              disabled={isPending}
              className="shrink-0 whitespace-nowrap"
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
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className="block xl:hidden">
            <MenuIcon />
          </SheetTrigger>
          <SheetContent side="top">
            <SheetHeader>
              <SheetTitle className="mb-8 text-2xl text-accent-foreground">Positive Mind Care</SheetTitle>
              <SheetDescription asChild>
                <div className="space-y-6">
                  {NAV_ITEMS.filter((link) => link.id !== 'contact-us').map((link) => {
                    if (link.id === 'awareness') {
                      return (
                        <div key={link.id} className="space-y-3">
                          <div className="text-lg">
                            <Link href={toSiteHref(link.href)} onClick={() => setSheetOpen(false)}>
                              {link.label}
                            </Link>
                          </div>
                          <div className="pl-4 space-y-3 border-l border-accent-foreground/20">
                            {AWARENESS_ITEMS.map((item) => (
                              <div key={item.id} className="text-base text-accent-foreground/80">
                                <Link href={toSiteHref(item.href)} onClick={() => setSheetOpen(false)}>
                                  {item.label}
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={link.id} className="text-lg">
                        <Link href={toSiteHref(link.href)} onClick={() => setSheetOpen(false)}>
                          {link.label}
                        </Link>
                      </div>
                    )
                  })}
                  <div className="flex flex-wrap gap-2">
                    {EXTERNAL_NAV_ITEMS.map((link) => {
                      const className =
                        'text-xs font-semibold rounded-full border border-primary-foreground/40 px-2.5 py-0.5 text-primary-foreground/70 hover:text-primary-foreground'

                      if (link.external) {
                        return (
                          <a key={link.id} href={toSiteHref(link.href)} className={className}>
                            {link.label}
                          </a>
                        )
                      }

                      return (
                        <Link
                          key={link.id}
                          href={toSiteHref(link.href)}
                          onClick={() => setSheetOpen(false)}
                          className={className}
                        >
                          {link.label}
                        </Link>
                      )
                    })}
                  </div>
                  <div className="text-lg">
                    <Link href="/contact-us" onClick={() => setSheetOpen(false)}>
                      Contact
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSheetOpen(false)
                        openQuikwitChatWidget()
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-full border border-accent-foreground/40 px-3 py-1.5 text-accent-foreground/80 hover:text-accent-foreground w-fit"
                    >
                      <MessageCircle className="size-4" />
                      Dr Shy
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSheetOpen(false)
                        // Wait for the Sheet's own close animation/cleanup to finish before opening the
                        // download dialog — opening both at once is what left the page unclickable.
                        window.setTimeout(() => {
                          handleAppDownloadModalOpen()
                        }, 300)
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-full border border-accent-foreground/40 px-3 py-1.5 text-accent-foreground/80 hover:text-accent-foreground w-fit"
                    >
                      <Download className="size-4" />
                      Get the App
                    </button>
                  </div>
                </div>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </nav>

      <Dialog
        open={isAppDownloadModalOpen}
        onOpenChange={(open) => {
          if (!open) handleAppDownloadModalClose()
        }}
      >
        <DialogContent showCloseButton={false} className="max-w-md gap-0 overflow-hidden rounded-3xl border-none p-0 shadow-2xl">
          <DialogTitle className="sr-only">Download the Positive Mind Care app</DialogTitle>
          <DialogDescription className="sr-only">
            Get the official Positive Mind Care mobile app for appointments, updates, and care access.
          </DialogDescription>

          {/* Header */}
          <div className="relative overflow-hidden bg-primary px-6 pt-6 pb-8 text-primary-foreground">
            <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-primary-foreground/10" />
            <div className="pointer-events-none absolute -bottom-16 -left-12 size-40 rounded-full bg-primary-foreground/5" />

            <DialogClose
              onClick={handleAppDownloadModalClose}
              className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </DialogClose>

            <div className="relative flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground shadow-lg">
                <Logo className="size-8 text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground/70">
                  Positive Mind Care
                </p>
                <h2 className="text-xl font-bold leading-tight">Download the App</h2>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-5 bg-background p-6">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Everything you need for your care journey, right in your pocket.
            </p>

            <ul className="space-y-3">
              {APP_DOWNLOAD_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <CheckCircle2 className="size-3.5" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href={APP_DOWNLOAD_URL}
              download
              onClick={handleAppDownloadClick}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90 hover:shadow-lg active:scale-[0.99]"
            >
              {isAppDownloading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="size-4 transition-transform group-hover:-translate-y-0.5" />
                  Download APK
                </>
              )}
            </a>

            <p className="text-center text-xs text-muted-foreground">Available for Android · APK file</p>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}

function ServicesMenu({ services, isActive }: { services: Service[]; isActive: boolean }) {
  const [isHovered, setIsHovered] = useState(false)
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Filter main services (those without parent)
  const mainServices = services.filter(service => !service.parent)

  const clearTimers = () => {
    if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
  }

  useEffect(() => clearTimers, [])

  const handleMouseEnter = () => {
    clearTimers()
    openTimeoutRef.current = setTimeout(() => setIsHovered(true), HOVER_DELAY)
  }

  const handleMouseLeave = () => {
    clearTimers()
    closeTimeoutRef.current = setTimeout(() => setIsHovered(false), 200)
  }

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Link
        href={'/services'}
        className={cn(
          'transition-colors rounded-md px-2 py-1',
          isActive || isHovered
            ? 'text-primary-foreground'
            : 'text-primary-foreground/50 hover:text-primary-foreground',
        )}
      >
        <button className="flex w-full justify-between text-left items-center text-sm font-semibold space-x-2 cursor-pointer">
          <span>Services</span>
          <ChevronDown
            className={cn('size-4 flex-shrink-0 transition-transform duration-200', isHovered ? 'rotate-180' : null)}
          />
        </button>
      </Link>

      {isHovered && (
        // Centered on the viewport (not the trigger) since this mega-menu is wider than the nav item that opens it
        <div
          className="fixed left-1/2 z-50 w-[900px] max-w-[95vw] max-h-[500px] -translate-x-1/2 overflow-y-auto rounded-sm border border-border bg-primary-foreground text-foreground shadow-md animate-in fade-in-0 zoom-in-95"
          style={{ top: NAVBAR_HEIGHT }}
        >
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
        </div>
      )}
    </div>
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
          <button className="flex w-full justify-between text-left items-center text-sm font-semibold space-x-2 cursor-pointer">
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
              href={toSiteHref(item.href)}
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
