import Link from 'next/link'
import Image from 'next/image'
import type { Footer } from '@/payload/types'
import { Logo } from '@/components/ui/logo'
import { getURLFromMedia } from '@/payload/utils'
import { toSiteHref } from '@/lib/links'

export default function Footer({ data }: { data: Footer }) {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-15 gap-6">
          <div className="md:col-span-3 space-y-4">
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
                GF - 43, M2K Corporate Park,
                <br />
                N Block, Mayfield Garden,
                <br />
                Sector 51, Gurugram, Haryana 122018
              </div>
            </div>
            <div>
              <div className="font-medium">Contact:</div>
              <div className="text-primary-foreground/50">089205 30832</div>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            {getURLFromMedia(data.footer?.info?.image || '') ? (
              <Image src={getURLFromMedia(data.footer?.info?.image || '')} alt="" width={94} height={69} />
            ) : null}
            <div className="font-medium">{data.footer?.info?.title}</div>
            <div className="text-primary-foreground/50">{data.footer?.info?.info}</div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="mb-4 text-lg font-medium uppercase">SITE MAP</h3>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  {item.id === 'home' ? (
                    <Link
                      href={toSiteHref(item.href)}
                      className="transition-colors text-primary-foreground/50 hover:text-primary-foreground"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={toSiteHref(item.href)}
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
                    href={toSiteHref(item.href)}
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
            <h3 className="mb-4 text-lg font-medium uppercase">Explore</h3>
            <ul className="space-y-2">
              {EXPLORE_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={toSiteHref(item.href)}
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
            <h3 className="mb-4 text-lg font-medium uppercase">OUR SERVICES</h3>
            <ul className="space-y-2">
              {LINKS_1.map((item) => (
                <li key={item.id}>
                  <a
                    href={toSiteHref(item.href)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors text-primary-foreground/50 hover:text-primary-foreground"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <ul className="space-y-2 md:mt-11">
              {LINKS_2.map((item) => (
                <li key={item.id}>
                  <a
                    href={toSiteHref(item.href)}
                    target="_blank"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* left column */}
          <div className="flex text-center items-center gap-5">
            {data.footer?.social?.map((item) => {
              const iconUrl = getURLFromMedia(item.icon || '')
              return iconUrl ? (
                <a key={item.id} href={toSiteHref(item.url || '')} target="_blank" rel="noopener noreferrer">
                  <Image src={iconUrl} alt="" width={30} height={30} />
                </a>
              ) : null
            })}
          </div>

          {/* right column */}
          <div className="flex text-sm sm:justify-self-end justify-center space-x-6">
            <p className="transition-colors text-primary-foreground/50 hover:text-primary-foreground">
              Copyright © {new Date().getFullYear()}
            </p>
            <a
              href="/terms-and-conditions"
              rel="noopener noreferrer"
              className="transition-colors text-primary-foreground/50 hover:text-primary-foreground"
            >
              Terms & Conditions
            </a>
            <a
              href="/privacy-policy"
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
  { id: 'services', href: '/services', label: 'Services' },
  { id: 'our-experts', href: '/portal/experts', label: 'Our Experts' },
]

const EXPLORE_ITEMS = [
  { id: 'ambassador', href: '/ambassador', label: 'Ambassador' },
  { id: 'academy', href: '/academy', label: 'Academy' },
  { id: 'souvenir', href: '/souvenir', label: 'Souvenir' },
]

const AWARENESS_ITEMS = [
  { id: 'blogs', href: '/blogs', label: 'Blogs' },
  { id: 'webinar', href: '/webinars', label: 'Webinars & Workshops' },
  // { id: 'press-release', href: '/press-release', label: 'Press Releases' },
  // { id: 'news', href: '/news', label: 'News' },
  // { id: 'campaigns', href: '/campaigns', label: 'Campaigns' },
  // { id: 'ambassador-program', href: '/ambassador-program', label: 'Ambassador Program' },
  { id: 'internship', href: '/internship', label: 'Internship' },
  { id: 'franchise', href: '/franchise', label: 'Franchise' },
]

const LINKS_1 = [
  {
    id: 'ocd',
    href: '/services/brainsway-tms-system/obsessive-compulsive-and-related-disorders',
    label: 'Obsessive Compulsive & Related Disorders',
  },
  { id: 'addiction', href: '/services/brainsway-tms-system/addiction', label: 'Addiction' },
  { id: 'tinnitus', href: '/services/brainsway-tms-system/deep-tms-tinnitus', label: 'Tinnitus' },
  { id: 'schizophrenia', href: '/services/brainsway-tms-system/deep-tms-schizophrenia', label: 'Schizophrenia' },
]

const LINKS_2 = [
  {
    id: 'anxiety',
    href: '/services/brainsway-tms-system/anxiety-and-related-disorders',
    label: 'Anxiety & Related Disorders',
  },
  { id: 'bipolar', href: '/services/brainsway-tms-system/bipolar-depression', label: 'Bipolar Depression' },
  { id: 'smoking', href: '/services/brainsway-tms-system/dtms-smoking-cessation', label: 'Smoking Cessation' },
  { id: 'mdd', href: '/services/brainsway-tms-system/major-depressive-disorder', label: 'Major depressive Disorder' },
]
