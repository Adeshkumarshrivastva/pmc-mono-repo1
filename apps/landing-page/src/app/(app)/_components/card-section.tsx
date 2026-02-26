import Image from 'next/image'
import type { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

type CardSectionProps = {
  data: Home['cardSection']
}

export default function CardSection({ data }: CardSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-14 xl:px-16 xl:py-18">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-12 mb-8 sm:mb-10">
            <div className="max-w-lg">
              <h2 className="text-2xl font-semibold leading-tight text-primary sm:text-3xl md:text-4xl">
                {data?.title}
              </h2>
              <div className="text-xl font-semibold text-primary max-w-md mt-2">{data?.subTitle}</div>
            </div>

            <div className="flex flex-col items-end">
              <div className="max-w-[480px]">
                {data?.description ? (
                  <p className="text-lg text-foreground leading-relaxed opacity-80">{data.description}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="sm:pt-4 flex flex-col items-center justify-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary">{data?.cardHeading?.toUpperCase()}</div>
            <div className="text-xl font-semibold text-primary mt-2">{data?.cardSubHeading}</div>

            {data?.cardImage ? (
              <div className="relative max-w-4xl w-full mt-4 sm:mt-8">
                <Image
                  src={getURLFromMedia(data.cardImage ?? '')}
                  alt="Card Image"
                  width={900}
                  height={305}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
