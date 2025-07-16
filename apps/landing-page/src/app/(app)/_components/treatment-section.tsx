import { RichText } from '@payloadcms/richtext-lexical/react'
import { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { Button } from '@/components/ui/button'
import { ChatIcon, MedalRibbonIcon } from '@/components/ui/icons'

type TreatmentSectionProps = {
  data: Home['treatmentSection']
}

export default function TreatmentSection({ data }: TreatmentSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="hidden lg:block">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Deep TMS treatment"
                  width={564}
                  height={800}
                  className="h-auto w-full object-contain rounded-xl"
                  src={getURLFromMedia(data?.premaryImage ?? '')}
                />
              </div>
            </div>

            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-4 lg:space-y-6">
                <h1 className="text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl">{data?.title}</h1>
                {data?.description ? (
                  <div className="lg:text-lg">
                    <RichText data={data.description} disableContainer={true} />
                  </div>
                ) : null}
              </div>

              {data?.subTitle ? (
                <h2 className="text-xl font-medium text-primary sm:text-2xl">{data.subTitle}</h2>
              ) : null}

              {data?.action ? (
                <div className="pt-2">
                  <Button icon={<ChatIcon />} className="w-full sm:w-auto">
                    {data.action}
                  </Button>
                </div>
              ) : null}

              <div className="hidden pt-6 lg:grid lg:grid-cols-1 xl:grid-cols-2">
                {data?.featureList && data.featureList.length > 0 ? (
                  <div className="space-y-4 lg:space-y-6">
                    {data.featureList.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 lg:space-x-4">
                        <div className="flex-shrink-0 pt-1">
                          <MedalRibbonIcon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-9 lg:w-9" />
                        </div>
                        <span className="text-lg font-semibold sm:text-xl">{feature.title}</span>
                      </div>
                    ))}
                  </div>
                ) : null}

                {data?.secondryImage ? (
                  <div>
                    <div className="relative max-w-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        width={356}
                        height={280}
                        alt={data.title ? `${data.title} secondary image` : 'Treatment secondary image'}
                        src={getURLFromMedia(data.secondryImage)}
                        className="h-auto w-full object-contain rounded-sm"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
