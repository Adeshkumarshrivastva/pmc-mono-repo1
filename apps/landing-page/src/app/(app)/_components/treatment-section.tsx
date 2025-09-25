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
                  <a href="/contact-us">
                    <Button icon={<ChatIcon />} className="w-full sm:w-auto">
                      {data.action}
                    </Button>
                  </a>
                </div>
              ) : null}

              <div className="pt-6">
                <div className="w-full">
                  <iframe
                    src={data?.videoUrl ?? ''}
                    title="About Deep TMS"
                    className="aspect-video w-full rounded-sm"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
