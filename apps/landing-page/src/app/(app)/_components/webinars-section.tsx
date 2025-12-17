'use client'

import { useState } from 'react'
import Link from 'next/link'
import Autoscroll from 'embla-carousel-auto-scroll'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import type { Home, Webinar } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { ChatIcon } from '@/components/ui/icons'
import { CalendarIcon } from 'lucide-react'

type WebinarsSectionProps = {
  data: Home['webinarsSection']
  webinars: Webinar[]
}

export default function WebinarsSection({ data, webinars }: WebinarsSectionProps) {
  if (webinars.length === 0) {
    return null
  }

  const [api, setApi] = useState<CarouselApi>()
  const [autoscrollPlugin] = useState(() => {
    return Autoscroll({
      speed: 0.7,
      startDelay: 1000,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
    })
  })

  const handlePrev = () => {
    if (!api) {
      return
    }
    autoscrollPlugin.stop()
    api.scrollPrev()
    autoscrollPlugin.play()
  }

  const handleNext = () => {
    if (!api) {
      return
    }
    autoscrollPlugin.stop()
    api.scrollNext()
    autoscrollPlugin.play()
  }

  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 sm:gap-8 md:flex-row md:items-start md:justify-between">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl md:text-5xl max-w-xl">{data?.title}</h2>
            {data?.action && (
              <Link href="/webinars">
                <Button icon={<ChatIcon />} className="w-full sm:w-auto">
                  {data.action}
                </Button>
              </Link>
            )}
          </div>
          <h3 className="lg:text-xl mt-6 lg:mb-2">{data?.description}</h3>

          <Carousel opts={{ loop: true, dragFree: false }} plugins={[autoscrollPlugin]} setApi={setApi}>
            <CarouselContent className="mt-8">
              {webinars.map((webinar) => {
                return (
                  <CarouselItem key={webinar.id} className="basis-full md:basis-[80%] lg:basis-[70%]">
                    <div className="flex flex-col gap-4 lg:flex-row bg-primary rounded-2xl overflow-hidden p-4">
                      <div className="relative w-full lg:w-1/2 h-[250px] sm:h-[280px] lg:h-[350px] bg-muted flex-shrink-0">
                        {webinar.poster && (
                          <Image
                            src={getURLFromMedia(webinar.poster)}
                            alt={webinar.title}
                            fill
                            className="object-cover rounded-3xl"
                            loading="lazy"
                          />
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between lg:ml-6 min-h-[250px] sm:min-h-[300px] md:py-4">
                        <h2 className="text-2xl lg:text-4xl font-semibold leading-tight line-clamp-3 text-primary-foreground">
                          {webinar.title}
                        </h2>

                        <div className="space-y-4 text-primary-foreground">
                          <div className="flex gap-3">
                            <CalendarIcon />
                            <div className="text-lg font-semibold">
                              {new Date(webinar.date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </div>
                          </div>

                          {webinar.speaker && (
                            <div className="flex gap-3">
                              {webinar.speaker.image && (
                                <Image
                                  src={getURLFromMedia(webinar.speaker.image)}
                                  alt={webinar.speaker.name || 'Speaker'}
                                  width={60}
                                  height={60}
                                  className="rounded-md object-cover"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-2xl">{webinar.speaker.name}</p>
                                <p className="opacity-70 text-lg">{webinar.speaker.profession}</p>
                              </div>
                            </div>
                          )}

                          <Link href={`/webinars/${webinar.slug}`}>
                            <Button variant="secondary" className="w-full lg:w-40 font-medium">
                              View Webinar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                )
              })}
            </CarouselContent>
            <div className=" flex justify-center relative">
              <div className="mt-6 lg:mt-10">
                <CarouselPrevious onClick={handlePrev} className=" relative h-12 w-12" variant={'default'} />
                <CarouselNext onClick={handleNext} className=" relative h-12 w-12 " variant={'default'} />
              </div>
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  )
}
