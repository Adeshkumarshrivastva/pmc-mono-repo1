'use client'

import { useState, useMemo } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Button } from '@/components/ui/button'
import { CallIcon, OouiArrowPreviousLtr, OouiArrowPreviousRtl } from '@/components/ui/icons'
import { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import AppointmentForm from './appointment-form'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type ExpertsSectionProps = { data: Home['expertsSection'] }

export default function ExpertsSection({ data }: ExpertsSectionProps) {
  const experts = Array.isArray(data?.experts) ? data.experts.filter((e) => typeof e !== 'string') : []

  const [startIdx, setStartIdx] = useState(0)
  const [activeTab, setActiveTab] = useState<'psychologist' | 'psychiatrist'>('psychologist')
  const cardsPerPage = 2

  const filteredExperts = useMemo(
    () => experts.filter((e) => e.profession?.toLowerCase() === activeTab),
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
              <h2 className="font-semibold text-xl sm:text-2xl md:text-4xl max-w-full md:max-w-xl">{data?.title}</h2>
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
                      value="psychologist"
                      className="cursor-pointer text-primary data-[state=active]:bg-primary dark:data-[state=active]:text-accent dark:text-primary p-5 font-normal text-lg"
                    >
                      Psychologists
                    </TabsTrigger>
                    <TabsTrigger
                      value="psychiatrist"
                      className="cursor-pointer text-primary data-[state=active]:bg-primary dark:data-[state=active]:text-accent dark:text-primary p-5 font-normal text-lg"
                    >
                      Psychiatrists
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
                        <img
                          alt="expert"
                          width={180}
                          height={190}
                          className="h-auto w-full max-w-[180px] sm:w-[140px] lg:w-[180px] object-contain py-2 rounded-xl bg-primary shadow-[0px_0px_4px_0px_#FEFEE3]"
                          src={getURLFromMedia(expert?.image ?? '')}
                        />
                      </div>

                      <div className="flex flex-col justify-around pr-0 sm:pr-3 lg:pr-5 space-y-3 sm:space-y-3">
                        <div className="text-accent text-center sm:text-left">
                          <p className="font-semibold text-xl sm:text-xl lg:text-2xl">{expert.expertName}</p>
                          <p className="text-sm sm:text-base">{expert.profession}</p>
                        </div>

                        {expert.headline && (
                          <div className="text-accent opacity-80 text-center sm:text-left text-sm sm:text-base line-clamp-3">
                            <RichText data={expert.headline} disableContainer />
                          </div>
                        )}

                        <div className="flex pt-5 justify-center md:justify-start">
                          <AppointmentForm
                            trigger={
                              <Button
                                icon={<CallIcon />}
                                variant="secondary"
                                className="font-normal text-sm sm:text-base w-full max-w-[264px]"
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
