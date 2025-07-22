'use client'

import Link from 'next/link'
import Autoscroll from 'embla-carousel-auto-scroll'
import { ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Home, Service } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

type ServicesSectionProps = {
  data: Home['servicesSection']
}

export default function ServicesSection({ data }: ServicesSectionProps) {
  if (!data) return null

  return (
    <section className="w-full bg-accent" aria-labelledby="services-heading">
      <div className="px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12 lg:py-24 xl:px-16 xl:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-8 sm:space-y-12">
            <header className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-start md:justify-between">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl max-w-md">{data?.title}</h2>
              {data?.action ? <Button className="w-full sm:w-auto">{data.action}</Button> : null}
            </header>

            <Carousel
              opts={{
                loop: true,
              }}
              plugins={[
                Autoscroll({
                  speed: 1,
                  startDelay: 500,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
            >
              <CarouselContent className="w-full">
                {data.services?.map((service) => {
                  const typedService = service as Service
                  return (
                    <CarouselItem key={typedService.id} className="md:basis-1/3 lg:basis-1/4">
                      <Link href={`/services/${typedService.slug}`} className="group flex flex-col space-y-4 h-full">
                        <div className="overflow-hidden rounded-xl bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getURLFromMedia(typedService.image ?? '')}
                            alt={typedService.name}
                            className="aspect-[4/3] w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 rounded-xl bg-primary p-6 shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
                          <div className="space-y-3 flex flex-col justify-between h-full">
                            <h3 className="flex-1 text-accent font-semibold text-2xl leading-tight">
                              {typedService.name}
                            </h3>
                            <div className="text-primary-foreground font-medium flex items-center space-x-2">
                              Explore More{' '}
                              <ArrowRightIcon className="size-4 ml-1 group-hover:ml-2 transition-transform duration-300" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  )
}
