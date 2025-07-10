'use client'

import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Home } from '@/payload/types'
import { Button } from '@/components/ui/button'
import { ChatIcon } from '@/components/ui/icons'
import { getURLFromMedia } from '@/payload/utils'
import { cn } from '@/lib/utils'

type DeepTmsSectionProps = {
  data: Home['deepTmsSection']
}

export default function DeepTMSSection({ data }: DeepTmsSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-25">
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold leading-tight text-primary sm:text-3xl md:text-4xl">
                {data?.title}
              </h2>
            </div>

            <div className="flex flex-col justify-center space-y-4 md:space-y-6">
              {data?.description ? (
                <div className="text-primary max-w-none">
                  <RichText data={data.description} disableContainer={true} />
                </div>
              ) : null}

              {data?.action ? (
                <div className="flex">
                  <Button
                    variant="secondary"
                    icon={<ChatIcon />}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md transition-all duration-200 hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:px-6 sm:py-3"
                  >
                    {data.action}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {data?.deepTmsFeatures && data.deepTmsFeatures.length > 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
              {data?.deepTmsFeatures?.map((feature, index) => (
                <div
                  key={index}
                  className={cn(
                    'relative h-[402px] p-6 rounded-lg flex flex-col justify-between',
                    feature.background === 'primary'
                      ? 'bg-card text-primary-foreground'
                      : 'bg-card-foreground text-primary border border-green-900',
                  )}
                >
                  <h3 className="z-10 text-3xl font-semibold mb-2">{feature.title}</h3>
                  <div className="absolute top-0 right-0">
                    {feature.image ? (
                      <Image
                        alt={feature?.title ?? ''}
                        width={400}
                        height={220}
                        className="object-contain w-full h-auto"
                        src={getURLFromMedia(feature.image ?? '')}
                      />
                    ) : null}
                  </div>
                  <div className="mt-2">
                    <p className="text-base">{feature.description}</p>
                    {feature?.stampImage ? (
                      <div className="mt-5">
                        <Image
                          alt="stamp image"
                          width={120}
                          height={120}
                          className="object-contain h-auto"
                          src={getURLFromMedia(feature.stampImage ?? '')}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
