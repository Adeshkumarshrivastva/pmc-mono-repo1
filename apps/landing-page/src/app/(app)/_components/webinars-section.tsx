'use client'

import Link from 'next/link'
import Autoscroll from 'embla-carousel-auto-scroll'
import { ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import type { Home, Webinar } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { ChatIcon } from '@/components/ui/icons'

type WebinarsSectionProps = {
  data: Home['webinarsSection']
  webinars: Webinar[]
}

export default function WebinarsSection({ data, webinars }: WebinarsSectionProps) {
  if (!data || !webinars || webinars.length === 0) {
    return null
  }

  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-start md:justify-between">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl md:text-5xl max-w-xl">{data.title}</h2>
            {data.action && (
              <Link href="/webinars">
                <Button icon={<ChatIcon />} className="w-full sm:w-auto">
                  {data.action}
                </Button>
              </Link>
            )}
          </div>
          <h3 className="lg:text-xl mt-6 lg:mb-2">{data.description}</h3>

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
            <CarouselContent className="w-full mt-8">
              {webinars.map((webinar) => (
                <CarouselItem key={webinar.id} className="md:basis-1/3 lg:basis-1/4">
                  <Link href={`/webinars/${webinar.slug}`} className="group flex flex-col space-y-4 h-full">
                    {webinar.poster && (
                      <div className="overflow-hidden rounded-xl bg-muted relative aspect-[4/3] w-full">
                        <Image
                          src={getURLFromMedia(webinar.poster)}
                          alt={webinar.title}
                          fill
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="flex-1 rounded-xl bg-primary p-6 shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
                      <div className="space-y-3 flex flex-col justify-between h-full">
                        <h3 className="flex-1 text-accent font-semibold text-2xl leading-tight">{webinar.title}</h3>
                        <div className="text-primary-foreground font-medium flex items-center space-x-2">
                          View Webinar
                          <ArrowRightIcon className="size-4 ml-1 group-hover:ml-2 transition-transform duration-300" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  )
}
