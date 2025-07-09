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
      <div className="p-20 space-y-15">
        <p className="font-semibold text-5xl">{data?.title}</p>
        <div className="bg-white border-primary border rounded-md">
          {currentTestimonial && (
            <div className="flex items-center p-8 gap-20">
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
                <p className="text-xl font-semibold">{currentTestimonial.quoteAuthor}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={handlePrev}
            className="rounded-full flex justify-center items-center bg-primary h-14 w-14 cursor-pointer"
            aria-label="Previous testimonial"
            type="button"
          >
            <MaterialSymbolsArrowBackIos className="h-12 w-12 text-white rounded-full p-1 text-center" />
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
            <MaterialSymbolsArrowForwardIos className="h-12 w-12 text-white rounded-full p-1 text-center" />
          </button>
        </div>
      </div>
    </div>
  )
}
