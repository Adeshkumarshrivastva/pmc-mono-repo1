'use client'

import type { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { Button } from '@/components/ui/button'
import { CallIcon, ClipBoardNotesWithQuestionMark } from '@/components/ui/icons'
import SVGImageIcon from '@/components/svg-image-icon'
import Image from 'next/image'

type WhyChooseSectionProps = {
  data: Home['whyChooseSection']
}

export default function WhyChooseSection({ data }: WhyChooseSectionProps) {
  const handleBooking = () => {
    document.getElementById('appointement-section')?.scrollIntoView({ behavior: 'smooth' })
  }
  return (
    <section className="bg-accent">
      <div className="flex-col lg:flex-row w-full flex justify-between max-w-7xl mx-auto px-1 md:px-5 xl:px-0 lg:gap-2">
        <div className="flex flex-col items-center lg:items-start pt-6 sm:pt-10 lg:flex-1">
          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-primary max-w-full lg:max-w-[539px] leading-tight">
            {data?.title ?? ''}
          </p>
          <Button
            icon={<CallIcon />}
            className="font-normal mt-4 sm:mt-5 sm:w-auto"
            onClick={() => {
              handleBooking()
            }}
          >
            {data?.action}
          </Button>
          {data?.image && (
            <div className="w-full max-w-[800px] max-h-[500px] mt-6 lg:mt-0 overflow-hidden flex justify-center items-center lg:justify-start lg:pt-6 relative">
              <div className="w-full aspect-[1/2] sm:aspect-[4/5] md:aspect-[3/4] lg:aspect-[1/2] max-w-[400px] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[600px] max-h-[300px] sm:max-h-[400px] md:max-h-[500px] lg:max-h-[700px] relative">
                <Image
                  src={getURLFromMedia(data.image)}
                  alt="Healthcare professionals"
                  fill
                  sizes="(max-width: 640px) 400px, (max-width: 768px) 400px, (max-width: 1024px) 600px, 600px"
                  className="object-contain"
                />
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 w-full max-w-[400px] sm:max-w-[400px] md:max-w-[600px] lg:max-w-[600px] bg-card p-1 text-primary-foreground text-center text-sm">
                {data?.imageCaption}
              </div>
            </div>
          )}
        </div>

        <div className="pt-8 lg:pt-12 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6 max-h-none lg:max-h-[800px] lg:overflow-auto">
            {data?.featuresCards && data.featuresCards.length !== 0
              ? data.featuresCards.map((feature, index) => (
                  <div
                    key={index}
                    className="flex flex-col bg-card space-y-3 sm:space-y-4 p-4 sm:p-6 w-full max-w-[340px] mx-auto lg:mx-0 min-h-[180px] sm:min-h-[204px] rounded-md"
                  >
                    {feature.featureIcon ? (
                      <SVGImageIcon
                        src={getURLFromMedia(feature.featureIcon)}
                        className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground flex-shrink-0"
                      />
                    ) : (
                      <ClipBoardNotesWithQuestionMark className="h-10 w-10 sm:h-12 sm:w-12 text-primary-foreground flex-shrink-0" />
                    )}
                    <p className="font-semibold text-base sm:text-lg md:text-xl text-primary-foreground leading-tight">
                      {feature.featureTitle}
                    </p>
                    <p className="font-normal text-sm sm:text-base md:text-lg leading-relaxed flex-1 text-primary-foreground">
                      {feature.featureDescription}
                    </p>
                  </div>
                ))
              : null}
          </div>
        </div>
      </div>
    </section>
  )
}
