'use client'

import { useState } from 'react'
import { match, P } from 'ts-pattern'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import type { Home, Testimonial } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export type TestimonialSectionProps = {
  data: Home['testimonialSection']
}

export default function TestimonialSection({ data }: TestimonialSectionProps) {
  const [api, setApi] = useState<CarouselApi>()

  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-16">
            <div className="flex justify-between">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl md:text-5xl">{data?.title}</h2>
              <div className="flex gap-2 self-start sm:self-auto">
                <Button
                  icon={<ArrowLeft className="h-4 w-4" />}
                  variant="secondary"
                  size="icon"
                  className="border rounded-full"
                  onClick={() => {
                    api?.scrollPrev()
                  }}
                />
                <Button
                  icon={<ArrowRight className="h-4 w-4" />}
                  variant="secondary"
                  size="icon"
                  className="border rounded-full"
                  onClick={() => {
                    api?.scrollNext()
                  }}
                />
              </div>
            </div>

            <Carousel
              opts={{
                loop: false,
              }}
              setApi={setApi}
            >
              <CarouselContent className="w-full">
                {data?.testimonialSlides?.map((testimonial) => {
                  const typedTestimonial = testimonial as Testimonial
                  return (
                    <CarouselItem key={typedTestimonial.id} className="md:basis-1/2">
                      {match(typedTestimonial.type)
                        .returnType<React.ReactNode>()
                        .with('text', () => (
                          <div className="w-full h-full bg-primary-foreground border border-border rounded-lg p-8">
                            <blockquote className="text-foreground text-lg leading-relaxed mb-6 flex-grow">
                              &quot;{typedTestimonial.message}&quot;
                            </blockquote>
                            <div className="flex items-center gap-4">
                              <div className="relative w-12 h-12">
                                <Image
                                  fill
                                  src={getURLFromMedia(typedTestimonial.auhtorImage ?? '')}
                                  alt={typedTestimonial.authorName}
                                  className="rounded-full object-cover mr-4"
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{typedTestimonial.authorName}</p>
                              </div>
                            </div>
                          </div>
                        ))
                        .with('video', () => (
                          <div className="w-full h-full bg-primary-foreground rounded-lg">
                            <iframe
                              src={typedTestimonial.videoUrl ?? ''}
                              title={typedTestimonial.authorName}
                              className="w-full h-full rounded-lg aspect-video"
                            />
                          </div>
                        ))
                        .with(P._, () => null)
                        .exhaustive()}
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
