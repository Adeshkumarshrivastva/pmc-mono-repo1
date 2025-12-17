'use client'

import type { Home } from '@/payload/types'
import { getAltFromFromMedia, getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'
import { useEffect, useRef } from 'react'

type PartnersSectionProps = {
  data: Home['partnersSection']
}

export default function PartnersSection({ data }: PartnersSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let rafId: number
    const speed = 0.5

    const scroll = () => {
      el.scrollLeft += speed

      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft = 0
      }

      rafId = requestAnimationFrame(scroll)
    }

    rafId = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(rafId)
  }, [])

  if (!data || !data.partners?.length) return null

  return (
    <section className="w-full bg-background">
      <div className="px-4 py-10 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="flex items-start">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-10">
                {data.title}
              </h2>
            )}
          </div>

          {/* Carousel viewport */}
          <div ref={scrollRef} className="overflow-hidden">
            <div className="flex gap-6">
              {[...data.partners, ...data.partners].map((partner, index) => {
                if (!partner?.logo) return null

                const logoUrl =
                  typeof partner.logo === 'string'
                    ? partner.logo
                    : getURLFromMedia(partner.logo)

                return (
                  <div
                    key={`${partner.id ?? index}-${index}`}
                    className="flex items-center justify-center min-w-[220px] rounded-xl border bg-white px-6 py-8 shadow-sm transition hover:shadow-md"
                  >
                    <Image
                      src={logoUrl}
                      alt={getAltFromFromMedia(partner.logo)}
                      width={160}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
