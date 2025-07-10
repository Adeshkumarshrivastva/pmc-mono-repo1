'use client'

import { MaterialSymbolsArrowBackIos, MaterialSymbolsArrowForwardIos } from '@/components/ui/icons'
import { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'
import React, { useState } from 'react'

export type testimonialSectionProps = {
  data: Home['testimonialSection']
}

export function TestimonialSection({ data }: testimonialSectionProps) {
  const slides = data?.testimonialSlides ?? []
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  }

  const currentTestimonial = slides[currentIndex]

  return (
    <div className="bg-accent flex justify-center items-center ">
      <div className="p-20 space-y-15">
        <p className="font-semibold text-5xl">{data?.title}</p>
        <div className="bg-primary-foreground border-primary border rounded-md m-2 md:m-0">
          {currentTestimonial && (
            <div className="flex flex-col md:flex-row items-center p-8 gap-20">
              <Image
                alt="Doctors"
                width={427}
                height={427}
                className="rounded-md"
                src={getURLFromMedia(currentTestimonial?.image ?? '')}
              />
              <div className="flex flex-col space-y-10">
                <p className="font-semibold text-2xl text-primary">{currentTestimonial.title}</p>
                <p className="text-sm">{currentTestimonial.quote}</p>
                <p className="text-xl font-semibold text-foreground">{currentTestimonial.quoteAuthor}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center items-center gap-4 mt-4 md:space-x-25 space-x-10">
          <button
            onClick={handlePrev}
            className="rounded-full flex justify-center items-center bg-primary h-14 w-14 cursor-pointer pl-2"
            aria-label="Previous testimonial"
            type="button"
          >
            <MaterialSymbolsArrowBackIos className="h-8 w-8 text-primary-foreground" />
          </button>
          <div className="flex gap-2">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`rounded-full h-2 w-2 ${idx === currentIndex ? 'bg-primary' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="rounded-full flex justify-center items-center bg-primary h-14 w-14 cursor-pointer"
            aria-label="Next testimonial"
            type="button"
          >
            <MaterialSymbolsArrowForwardIos className="h-8 w-8 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
