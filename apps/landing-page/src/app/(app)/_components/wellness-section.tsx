import Image from 'next/image'
import type { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

type WellnessSectionProps = {
  data: Home['wellnessSection']
}

export default function WellnessSection({ data }: WellnessSectionProps) {
  return (
    <section className="w-full bg-primary">
      <div className="px-4 py-8 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-14 xl:px-16 xl:py-18">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-2xl md:text-3xl xl:text-5xl font-semibold text-primary-foreground text-center">
              {data?.title}
            </h1>
            <p className="sm:text-lg lg:text-xl font-medium text-primary-foreground text-center mt-6">
              {data?.subTitle}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center w-full">
            <div className="flex flex-wrap justify-center gap-6 mt-12 w-full">
              {data?.topRow?.map((card) => {
                return (
                  <div key={card.id} className="bg-accent px-6 py-8 rounded-lg w-full md:w-[calc(33.333%-1rem)]">
                    {card.icon && (
                      <Image
                        src={getURLFromMedia(card.icon)}
                        alt=""
                        width={36}
                        height={36}
                        className="object-contain text-primary"
                      />
                    )}
                    <p className="text-2xl font-semibold text-primary mt-4">{card.heading?.toUpperCase()}</p>
                    <p className="text-lg font-medium text-primary mt-2">{card.subHeading}</p>
                    <p className="text-primary mt-2">{card.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-6 w-full">
              {data?.bottomRow?.map((card) => {
                return (
                  <div key={card.id} className="bg-accent px-6 py-8 rounded-lg w-full md:w-[calc(33.333%-1rem)]">
                    {card.icon && (
                      <Image
                        src={getURLFromMedia(card.icon)}
                        alt=""
                        width={36}
                        height={36}
                        className="object-contain text-primary"
                      />
                    )}
                    <p className="text-2xl font-semibold text-primary mt-4">{card.heading?.toUpperCase()}</p>
                    <p className="text-lg font-medium text-primary mt-2">{card.subHeading}</p>
                    <p className="text-primary mt-2">{card.description}</p>
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
