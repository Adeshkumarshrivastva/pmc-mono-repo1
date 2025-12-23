'use client'

import { useState } from 'react'
import type { Home } from '@/payload/types'
import { getAltFromFromMedia, getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'
import Autoscroll from 'embla-carousel-auto-scroll'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PartnersSectionProps = {
  data?: Home['partnersSection']
}

export default function PartnersSection({ data }: PartnersSectionProps) {
  const [activeTab, setActiveTab] = useState<'university' | 'hospital'>('university')
  console.log('partners data', data)
  if (!data || (!data.universityPartners?.length && !data.hospitalPartners?.length)) {
    return null
  }

  const partners = activeTab === 'university' ? (data.universityPartners ?? []) : (data.hospitalPartners ?? [])

  return (
    <section className="w-full bg-background">
      <div className="px-4 py-10 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-10">
            {data.title && <h2 className="text-3xl md:text-4xl font-bold text-left text-primary">{data.title}</h2>}

            <div className="md:flex md:justify-end md:pt-1">
              <div className="border p-1 flex space-x-2 rounded-md">
                <Button
                  className={cn(
                    buttonVariants({
                      variant: activeTab === 'university' ? 'default' : 'secondary',
                      size: 'sm',
                    }),
                    'min-w-32 h-6',
                  )}
                  onClick={() => setActiveTab('university')}
                >
                  University
                </Button>

                <Button
                  className={cn(
                    buttonVariants({
                      variant: activeTab === 'hospital' ? 'default' : 'secondary',
                      size: 'sm',
                    }),
                    'min-w-32 h-6',
                  )}
                  onClick={() => setActiveTab('hospital')}
                >
                  Hospital
                </Button>
              </div>
            </div>
          </div>

          <Carousel
            key={activeTab}
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
              {partners.map((partner) => {
                const logoUrl = typeof partner.logo === 'string' ? partner.logo : getURLFromMedia(partner.logo)

                return (
                  <CarouselItem key={partner.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/4">
                    <div className="flex items-center justify-center h-full rounded-xl border bg-primary-foreground px-6 py-8 shadow-sm transition hover:shadow-md">
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
