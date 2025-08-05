'use client'

import Link from 'next/link'
import Autoscroll from 'embla-carousel-auto-scroll'
import { ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Home, Service } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import QuestionnaireModal from './questionnaire-modal'

type ServicesSectionProps = {
  data: Home['servicesSection']
  services: Service[]
}

export default function ServicesSection({ data, services }: ServicesSectionProps) {
  if (!data) return null

  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-8 sm:space-y-12">
            <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-start md:justify-between">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl md:text-5xl max-w-xl">{data?.title}</h2>
              <div className="flex space-x-2">
                {/* TODO: Handle button text from CMS */}
                <QuestionnaireModal
                  trigger={
                    <Button icon={<ArrowRightIcon className="h-4 w-4" />} iconPosition="right">
                      Find the right expert
                    </Button>
                  }
                />
                {data?.action ? (
                  <Link href={'/services'}>
                    <Button className="bg-accent border border-primary text-primary hover:border-transparent hover:text-primary-foreground">
                      {data.action}
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>

            <Carousel
              opts={{
                loop: true,
                dragFree: true,
              }}
              plugins={[
                Autoscroll({
                  speed: 0.7,
                  startDelay: 500,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
            >
              <CarouselContent className="w-full">
                {services?.map((service) => {
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
                              {data.cardAction}
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
