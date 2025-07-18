'use client'

import { useState } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Button } from '@/components/ui/button'
import { CallIcon, OouiArrowPreviousLtr, OouiArrowPreviousRtl } from '@/components/ui/icons'
import { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import AppointmentForm from './appointment-form'

type ExportsectionProps = {
  data: Home['expertsSection']
}

export default function ExpertsSection({ data }: ExportsectionProps) {
  const experts = Array.isArray(data?.experts) ? data.experts.filter((e) => typeof e !== 'string') : []
  const [startIdx, setStartIdx] = useState(0)
  const cardsPerPage = 2

  const handlePrev = () => {
    setStartIdx((prev) => Math.max(prev - cardsPerPage, 0))
  }

  const handleNext = () => {
    setStartIdx((prev) => Math.min(prev + cardsPerPage, Math.max(experts.length - cardsPerPage, 0)))
  }

  const visibleExperts = experts.slice(startIdx, startIdx + cardsPerPage)

  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-22 xl:px-28 xl:py-24">
        <div className="max-w-7xl mx-auto ">
          <div className="space-y-6 sm:space-y-10 lg:space-y-15">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:gap-0">
              <p className="font-semibold text-xl sm:text-2xl lg:text-3xl max-w-full sm:max-w-[520px]">{data?.title}</p>
              <div className="flex gap-2 self-start sm:self-auto">
                <Button
                  icon={<OouiArrowPreviousLtr className="h-4 w-4" />}
                  variant={'secondary'}
                  className="p-0 rounded-full h-7 w-7 flex items-center justify-center text-foreground border cursor-pointer"
                  onClick={handlePrev}
                  disabled={startIdx === 0}
                />
                <Button
                  icon={<OouiArrowPreviousRtl className="h-4 w-4" />}
                  variant={'secondary'}
                  className="p-0 rounded-full h-7 w-7 flex items-center justify-center text-foreground border cursor-pointer"
                  onClick={handleNext}
                  disabled={startIdx + cardsPerPage >= experts.length}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-9">
              {visibleExperts.map((expert, idx) => (
                <div
                  key={expert.id || idx}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 bg-card p-3 rounded-2xl"
                >
                  <div className="flex justify-center sm:justify-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="expert"
                      width={180}
                      height={190}
                      className="h-auto w-full max-w-[180px] sm:w-[140px] lg:w-[180px] object-contain py-2 rounded-xl bg-primary shadow-[0px_0px_4px_0px_#FEFEE3]"
                      src={getURLFromMedia(expert?.image ?? '')}
                    />
                  </div>
                  <div className="flex flex-col justify-around pr-0 sm:pr-3 lg:pr-5 space-y-3 sm:space-y-0">
                    <div className="text-accent text-center sm:text-left">
                      <p className="font-semibold text-xl sm:text-xl lg:text-2xl">{expert.expertName}</p>
                      <p className="text-sm sm:text-base">{expert.profession}</p>
                    </div>
                    {expert?.headline ? (
                      <div className="text-accent opacity-80 text-center sm:text-left text-sm sm:text-base">
                        <RichText data={expert.headline} disableContainer={true} />
                      </div>
                    ) : null}
                    <div className="flex justify-center sm:justify-start">
                      <AppointmentForm
                        trigger={
                          <Button
                            icon={<CallIcon />}
                            variant={'secondary'}
                            className="font-normal text-sm sm:text-base w-full sm:w-auto"
                          >
                            {data?.action}
                          </Button>
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
