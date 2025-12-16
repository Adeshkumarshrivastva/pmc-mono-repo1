'use client'

import type { Home } from '@/payload/types'
import { getAltFromFromMedia, getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'

type PartnersSectionProps = {
  data: Home['partnersSection']
}

export default function PartnersSection({ data }: PartnersSectionProps) {
  if (!data) return null

  return (
    <section className="w-full bg-background">
      <div className="px-4 py-10 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="flex items-start">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-10">{data.title}</h2>
            )}
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {data.partners?.map((partner, index) => {
              if (!partner?.logo) return null

              const logoUrl = typeof partner.logo === 'string' ? partner.logo : getURLFromMedia(partner.logo)

              return (
                <div
                  key={partner.id ?? index}
                  className="flex items-center justify-center rounded-xl border bg-white px-6 py-8 shadow-sm transition hover:shadow-md"
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
    </section>
  )
}
