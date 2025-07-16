import { RichText } from '@payloadcms/richtext-lexical/react'
import { AboutUs } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

type WhatWeDoSectionProps = {
  data: AboutUs['whatWeDoSection']
}

export default function WhatWeDoSection({ data }: WhatWeDoSectionProps) {
  return (
    <section className="w-full bg-primary">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16 space-y-10">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-12">
            <div className="space-y-4">
              <h2 className="text-primary-foreground text-2xl font-semibold leading-tight sm:text-3xl md:text-5xl">
                {data?.heading}
              </h2>
            </div>

            <div className="flex flex-col justify-center space-y-4 md:space-y-6">
              {data?.description ? (
                <div className="text-primary-foreground max-w-none">
                  <RichText data={data?.description} disableContainer={true} />
                </div>
              ) : null}
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3 md:gap-8 lg:gap-12">
            {data?.featureCards?.map((feature) => (
              <div
                key={feature.id}
                className="bg-cover bg-center bg-no-repeat bg-primary-foreground min-h-80 space-y-4 p-6 rounded-3xl"
                style={{
                  backgroundImage: `url(${getURLFromMedia(feature?.image ?? '')})`,
                }}
              >
                <div className="text-2xl font-medium">{feature?.heading}</div>
                {feature?.description ? <RichText data={feature?.description} className="opacity-80" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
