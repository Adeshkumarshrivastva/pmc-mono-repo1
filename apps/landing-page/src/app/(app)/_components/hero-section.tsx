import { Fragment } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Button } from '@/components/ui/button'
import { CallIcon } from '@/components/ui/icons'
import { getURLFromMedia } from '@/payload/utils'
import type { Home } from '@/payload/types'
import AppointmentForm from './appointment-form'
import Image from 'next/image'

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
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 xl:px-25 z-10">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8 xl:gap-12">
          <div className="flex-1 max-w-2xl xl:max-w-none">
            <div className="space-y-6 xl:w-[484px]">
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-semibold text-primary-foreground leading-tight">
                {data?.heroSectionTitle ? <RichText data={data.heroSectionTitle} disableContainer={true} /> : null}
              </h1>

              {data?.heroSectionDescription ? (
                <p className="sm:text-lg text-primary-foreground leading-relaxed opacity-80 p-2 bg-primary/60 border border-primary/30 rounded-2xl backdrop-blur-md sm:bg-transparent sm:border-0 sm:rounded-none sm:backdrop-blur-none">
                  {data.heroSectionDescription}
                </p>
              ) : null}
            </div>

            <div className="mt-8">
              {data?.heroSectionAction ? (
                <AppointmentForm
                  trigger={
                    <Button variant="secondary" icon={<CallIcon />} className="w-full sm:w-auto">
                      {data.heroSectionAction}
                    </Button>
                  }
                />
              ) : null}
            </div>
          </div>

          <div className="flex-shrink-0 w-full xl:w-72">
            <div className="space-y-4 p-6">
              <p className="hidden xl:block sm:text-lg text-primary-foreground font-medium">
                {data?.heroSectionHeadline}
              </p>

              {data?.heroSectionDetails && data.heroSectionDetails.length > 0 ? (
                <div className="space-y-4">
                  <div className="hidden xl:block">
                    <div className="grid grid-cols-[1fr_1px_1fr] gap-4 w-full items-center">
                      {data.heroSectionDetails.map((item, index) => (
                        <Fragment key={index}>
                          {index % 2 === 0 && (
                            <div className="col-span-full border-[0.5px] h-px shrink-0 border-primary-foreground border-dashed" />
                          )}
                          <div className="col-span-1 text-primary-foreground flex flex-col justify-center">
                            <p className="text-sm font-light">{item.label}</p>
                            <p className="font-semibold">{item.value}</p>
                          </div>
                          {index % 2 === 0 && (
                            <div className="h-16 border-[0.5px] border-primary-foreground border-dashed" />
                          )}
                        </Fragment>
                      ))}
                      <div className="col-span-3 border-[0.5px] h-px shrink-0 border-primary-foreground border-dashed" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
