import { Fragment } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { CallIcon } from '@/components/ui/icons'
import { getURLFromMedia } from '@/payload/utils'
import type { Home } from '@/payload/types'
import AppointmentForm from './appointment-form'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

type HeroSectionProps = {
  data: Home['heroSetion']
}

export default function HeroSection({ data }: HeroSectionProps) {
  const backgroundImageUrl = getURLFromMedia(data?.heroSectionImage ?? '')

  return (
    <div className="bg-primary min-h-[600px] sm:min-h-[700px] xl:min-h-[800px] flex items-center relative">
      <Image
        src={backgroundImageUrl}
        alt="Hero background"
        fill
        sizes="100vw"
        className="object-cover xl:object-contain xl:object-bottom"
        priority
      />
      <div className="relative 2xl:container w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-25 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8 xl:gap-12">
            <div className="flex-1 max-w-2xl xl:max-w-none">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-primary-foreground leading-tight">
                  {data?.heroSectionTitle ? <RichText data={data.heroSectionTitle} disableContainer={true} /> : null}
                </h2>

                {data?.heroSectionDescription ? (
                  <p className="sm:text-lg text-primary-foreground leading-relaxed opacity-80 bg-primary/60 border border-primary/30 rounded-2xl backdrop-blur-md xl:bg-transparent xl:border-0 xl:rounded-none xl:backdrop-blur-none xl:w-[425px]">
                    {data.heroSectionDescription}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex-shrink-0 w-full xl:w-72 hidden xl:block ">
              <div className="space-y-4 p-6 bg-accent rounded-xl">
                <p className="hidden xl:block sm:text-lg text-primary">
                  <p className="font-semibold">{data?.heroSectionHeadline1}</p>
                  {data?.heroSectionHeadline}
                </p>

                {data?.heroSectionDetails && data.heroSectionDetails.length > 0 ? (
                  <div className="space-y-4">
                    <div className="hidden xl:block">
                      <div className="grid grid-cols-[1fr_1px_1fr] gap-4 w-full items-center">
                        {data.heroSectionDetails.map((item, index) => (
                          <Fragment key={index}>
                            {index % 2 === 0 && (
                              <div className="col-span-full border-[0.5px] h-px shrink-0 border-primary border-dashed" />
                            )}
                            <div className="col-span-1 text-primary flex flex-col justify-center">
                              <p className="text-sm font-light">{item.label}</p>
                              <p className="font-semibold">{item.value}</p>
                            </div>
                            {index % 2 === 0 && <div className="h-16 border-[0.5px] border-primary border-dashed" />}
                          </Fragment>
                        ))}
                        <div className="col-span-3 border-[0.5px] h-px shrink-0 border-primary border-dashed" />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
              {data?.heroSectionAction ? (
                <AppointmentForm
                  trigger={
                    <Button variant="secondary" icon={<CallIcon />} className="w-full mt-4">
                      {data.heroSectionAction}
                    </Button>
                  }
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
