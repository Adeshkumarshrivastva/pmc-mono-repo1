import type { Academy } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type WhyChooseSectionProps = {
  data: Academy['whyChoose']
}

export default function WhyChooseSection({ data }: WhyChooseSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-12 lg:py-16 xl:px-16 xl:py-20">
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12 space-y-3">
          <h2 className="text-2xl font-semibold leading-tight text-primary sm:text-3xl md:text-4xl">{data?.title}</h2>

          <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between">
            {data?.subtitle ? <div className="text-primary text-lg font-semibold max-w-lg">{data.subtitle}</div> : null}

            {data?.subtitleAlt ? (
              <div className="text-primary text-lg font-semibold max-w-lg">{data.subtitleAlt}</div>
            ) : null}
          </div>
        </div>

        {data?.features && data.features.length > 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
              {data?.features?.map((feature, index) => (
                <div
                  key={index}
                  className={cn(
                    'relative h-90 p-6 rounded-lg flex flex-col justify-between',
                    feature.background === 'primary'
                      ? 'bg-card text-primary-foreground'
                      : 'bg-card-foreground text-primary border border-primary',
                  )}
                >
                  <div>
                    <h3 className="z-10 text-3xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-base max-w-xs">{feature.description}</p>
                  </div>
                  <div>
                    {feature?.stampImage ? (
                      <>
                        <Image
                          alt="stamp image"
                          width={120}
                          height={120}
                          className="object-contain h-auto"
                          src={getURLFromMedia(feature.stampImage ?? '')}
                        />
                      </>
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
