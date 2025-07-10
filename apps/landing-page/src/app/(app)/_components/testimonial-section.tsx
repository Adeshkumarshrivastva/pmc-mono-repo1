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
    <div className="bg-accent flex justify-center items-center">
      <div className="p-4 sm:p-8 lg:p-20 space-y-6 sm:space-y-10 lg:space-y-15 w-full max-w-7xl md:max-w-none">
        <p className="font-semibold text-2xl sm:text-3xl lg:text-5xl text-center lg:text-left">{data?.title}</p>
        <div className="bg-primary-foreground border-primary border rounded-md m-2 md:m-0">
          {currentTestimonial && (
            <div className="flex flex-col md:flex-row items-center p-4 sm:p-6 lg:p-8 gap-6 sm:gap-10 lg:gap-20">
              <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
                <Image
                  alt="Doctors"
                  width={427}
                  height={427}
                  className="rounded-md w-full max-w-[280px] sm:max-w-[350px] lg:max-w-[427px] h-auto object-cover"
                  src={getURLFromMedia(currentTestimonial?.image ?? '')}
                />
              </div>
              <div className="flex flex-col space-y-4 sm:space-y-6 lg:space-y-10 text-center md:text-left">
                <p className="font-semibold text-lg sm:text-xl lg:text-2xl text-primary">{currentTestimonial.title}</p>
                <p className="text-sm sm:text-base leading-relaxed">{currentTestimonial.quote}</p>
                <p className="text-base sm:text-lg lg:text-xl font-semibold text-foreground">
                  {currentTestimonial.quoteAuthor}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center items-center gap-4 sm:gap-6 lg:gap-8 mt-4 lg:space-x-25 space-x-0">
          <button
            onClick={handlePrev}
            className="rounded-full flex justify-center items-center bg-primary h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 cursor-pointer pl-1 lg:pl-2"
            aria-label="Previous testimonial"
            type="button"
          >
            <MaterialSymbolsArrowBackIos className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary-foreground" />
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
            className="rounded-full flex justify-center items-center bg-primary h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 cursor-pointer"
            aria-label="Next testimonial"
            type="button"
          >
            <MaterialSymbolsArrowForwardIos className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
