'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CallIcon, OouiArrowPreviousLtr, OouiArrowPreviousRtl } from '@/components/ui/icons'
import { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

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
    <div className="p-20 bg-accent">
      <div className="space-y-15">
        <div className="flex justify-between">
          <p className="font-semibold text-3xl max-w-[520px]">{data?.title}</p>
          <div className="flex gap-2">
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
        <div className="grid grid-cols-2 gap-9">
          {visibleExperts.map((expert, idx) => (
            <div key={expert.id || idx} className="flex gap-8 bg-card p-3 rounded-2xl">
              <Image
                alt="expert"
                width={180}
                height={190}
                className="h-auto object-contain py-2 rounded-xl bg-primary shadow-[0px_0px_4px_0px_#FEFEE3]"
                src={getURLFromMedia(expert?.image ?? '')}
              />
              <div className="flex flex-col justify-around pr-5">
                <div className="text-accent">
                  <p className="font-semibold text-2xl">{expert.expertName}</p>
                  <p>{expert.profession}</p>
                </div>
                {expert?.headline ? (
                  <div className="text-accent opacity-80">
                    <RichText data={expert.headline} disableContainer={true} />
                  </div>
                ) : null}
                <Button icon={<CallIcon />} variant={'secondary'} className="font-normal">
                  {data?.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
