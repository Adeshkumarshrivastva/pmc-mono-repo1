'use client'

import type { Home } from '@/payload/types'
import { getAltFromFromMedia, getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'
import Autoscroll from 'embla-carousel-auto-scroll'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'

type PartnersSectionProps = {
  data?: Home['partnersSection']
}

export default function PartnersSection({ data }: PartnersSectionProps) {
  if (!data || !data.partners?.length) {
    return null
  }
  return (
    <section className="w-full bg-background">
      <div className="px-4 py-10 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {data.title && <h2 className="text-3xl md:text-4xl font-bold text-left text-primary mb-10">{data.title}</h2>}

          <Carousel
            opts={{
              loop: true,
              dragFree: true,
            }}
            plugins={[
              Autoscroll({
                speed: 0.6,
                startDelay: 500,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
          >
            <CarouselContent>
              {data.partners.map((partner) => {
                const logoUrl = typeof partner.logo === 'string' ? partner.logo : getURLFromMedia(partner.logo)

                return (
                  <CarouselItem key={partner.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/4">
                    <div className="flex items-center justify-center h-full rounded-xl border bg-white px-6 py-8 shadow-sm transition hover:shadow-md">
                      <Image
                        src={logoUrl}
                        alt={getAltFromFromMedia(partner.logo)}
                        width={160}
                        height={80}
                        className="object-contain"
                        loading="lazy"
                      />
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  )
}
