import Image from 'next/image'
import type { Academy } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { RichText } from '@payloadcms/richtext-lexical/react'

type ServicesSectionProps = {
  data: Academy['servicesSection']
}

export default function ServicesSection({ data }: ServicesSectionProps) {
  return (
    <section className="w-full bg-primary">
      <div className="px-4 py-8 sm:px-6 md:px-8 md:py-10 lg:px-12 lg:py-14 xl:px-16 xl:py-18">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl md:text-3xl xl:text-4xl font-semibold text-primary-foreground text-center">
              {data?.title}
            </h1>
            <p className="sm:text-lg lg:text-xl font-medium text-primary-foreground text-center mt-4">
              {data?.subtitle}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 justify-center gap-6 mt-12 w-full">
              {data?.cards?.map((card) => {
                return (
                  <div key={card.id} className="bg-accent px-6 py-6 rounded-lg max-w-full">
                    {card.icon && (
                      <div className="flex justify-between">
                        <Image
                          src={getURLFromMedia(card.icon)}
                          alt=""
                          width={40}
                          height={40}
                          className="object-contain text-primary"
                        />
                      </div>
                    )}
                    <p className="text-2xl font-semibold text-primary mt-4 uppercase">{card.heading}</p>
                    <p className="text-lg font-semibold text-primary mt-2">{card.subHeading}</p>
                    <p className="text-primary mt-2">
                      {card?.about ? <RichText data={card.about} disableContainer={true} /> : null}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
