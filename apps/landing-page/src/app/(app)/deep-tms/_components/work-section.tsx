import { DeepTm } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

type WorkSectionProps = {
  data: DeepTm['deepTmsWorkSection']
}

export default function WorkSection({ data }: WorkSectionProps) {
  return (
    <section className="w-full bg-primary">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-25">
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          <div className="space-y-16">
            <h1 className="text-3xl font-semibold text-primary-foreground sm:text-4xl lg:text-5xl">{data?.title}</h1>
            <div className="grid grid-cols-1 justify-center items-center lg:grid-cols-3 lg:gap-12">
              {data?.deepTmsWorkCards?.map((card, index) => (
                <div key={index} className="space-y-6">
                  <Image
                    src={getURLFromMedia(card.image ?? '')}
                    alt={`Deep TMS Treatment - ${index}`}
                    width={380}
                    height={340}
                  />
                  <div className="space-y-4">
                    <div className="font-medium text-2xl text-primary-foreground">{card.title}</div>
                    <RichText data={card.description!} className="text-primary-foreground" />
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
