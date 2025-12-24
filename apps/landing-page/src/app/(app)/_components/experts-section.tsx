'use client'

import { useState, useMemo } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CallIcon, OouiArrowPreviousLtr, OouiArrowPreviousRtl } from '@/components/ui/icons'
import type { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AppointmentForm from './appointment-form'
import { getFileUrl, type Expert } from '@/lib/experts'
import Link from 'next/link'

type ExpertsSectionProps = { data: Home['expertsSection']; experts: Expert[] }

function toTitleCase(str: string) {
  return str
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function ExpertsSection({ data, experts }: ExpertsSectionProps) {
  const [startIdx, setStartIdx] = useState(0)
  const [activeTab, setActiveTab] = useState<'psychologist' | 'psychiatrist'>('psychiatrist')
  const cardsPerPage = 2

  const filteredExperts = useMemo(
    () => experts.filter((e) => e.type?.toLowerCase().includes(activeTab)),
    [experts, activeTab],
  )

  const handlePrev = () => setStartIdx((prev) => Math.max(prev - cardsPerPage, 0))
  const handleNext = () =>
    setStartIdx((prev) => Math.min(prev + cardsPerPage, Math.max(filteredExperts.length - cardsPerPage, 0)))

  const visibleExperts = filteredExperts.slice(startIdx, startIdx + cardsPerPage)

  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 lg:px-12 ">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6 sm:space-y-10 md:space-y-5 lg:space-y-15">
            <div className="flex flex-col lg:flex-row lg:justify-between gap-4 sm:gap-0">
              <h2 className="font-semibold text-xl sm:text-2xl md:text-5xl max-w-full md:max-w-2xl">{data?.title}</h2>
              <div className="md:flex md:justify-end md:pt-2">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => {
                    setActiveTab(v as 'psychologist' | 'psychiatrist')
                    setStartIdx(0)
                  }}
                >
                  <TabsList className="border border-primary w-full sm:w-[400px] py-6 px-1">
                    <TabsTrigger
                      value="psychiatrist"
                      className="cursor-pointer text-primary data-[state=active]:bg-primary dark:data-[state=active]:text-accent dark:text-primary p-5 font-normal text-lg"
                    >
                      Psychiatrists
                    </TabsTrigger>
                    <TabsTrigger
                      value="psychologist"
                      className="cursor-pointer text-primary data-[state=active]:bg-primary dark:data-[state=active]:text-accent dark:text-primary p-5 font-normal text-lg"
                    >
                      Psychologists
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {filteredExperts.length === 0 ? (
              <p className="text-center text-accent/70 col-span-full py-10">No {activeTab}s available at the moment.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-9">
                  {visibleExperts.map((expert, idx) => (
                    <div
                      key={expert.id ?? idx}
                      className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 bg-card p-3 rounded-2xl"
                    >
                      <div className="flex justify-center sm:justify-start">
                        <Image
                          alt="expert"
                          width={180}
                          height={190}
                          className="h-[190px] w-full max-w-[180px] sm:w-[140px] lg:w-[180px] object-cover py-2 rounded-xl bg-primary shadow-[0px_0px_4px_0px_#FEFEE3]"
                          src={expert.image}
                        />
                      </div>

                      <div className="flex flex-col justify-around pr-0 sm:pr-3 lg:pr-5 space-y-3 sm:space-y-3">
                        <div className="text-accent text-center sm:text-left">
                          <p className="font-semibold text-xl sm:text-xl lg:text-2xl">{expert.name}</p>
                          <p className="text-sm sm:text-base">{toTitleCase(expert.type)}</p>
                        </div>

                        {expert.bio && (
                          <div className="text-accent opacity-80 text-center sm:text-left text-sm sm:text-base line-clamp-3">
                            <p>{expert.bio}</p>
                          </div>
                        )}

                        <div className="flex pt-5 justify-center md:justify-start">
                          <Link href={`/portal/experts/${expert.slug}`} className="w-full max-w-[264px]">
                            <Button
                              icon={<CallIcon />}
                              variant="secondary"
                              className="font-normal text-sm sm:text-base w-full"
                            >
                              {data?.action}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-8 justify-center sm:self-auto">
                  <Button
                    icon={<OouiArrowPreviousLtr className="h-5 w-5" />}
                    variant="secondary"
                    size="icon"
                    className="border rounded-full h-10 w-10"
                    onClick={handlePrev}
                    disabled={startIdx === 0}
                  />
                  <Button
                    icon={<OouiArrowPreviousRtl className="h-5 w-5" />}
                    variant="secondary"
                    size="icon"
                    className="border rounded-full h-10 w-10"
                    onClick={handleNext}
                    disabled={startIdx + cardsPerPage >= filteredExperts.length}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
