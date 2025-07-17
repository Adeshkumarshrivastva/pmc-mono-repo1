import SVGImageIcon from '@/components/svg-image-icon'
import { Button } from '@/components/ui/button'
import { CallIcon } from '@/components/ui/icons'
import { Service } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { RichText } from '@payloadcms/richtext-lexical/react'

type HeroSectionProps = {
  data: Service['servicesHeroSection']
}

export default function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="p-25 flex flex-col gap-20">
        <div className="flex gap-5 items-center">
          <img
            src={getURLFromMedia(data?.image ?? '')}
            alt={`services`}
            width={400}
            height={505}
            className="object-contain rounded-xl"
          />
          <div className="p-15">
            <div className="flex flex-col gap-8 pb-6">
              <p className="text-5xl font-semibold">{data?.title}</p>
              {data?.description ? (
                <div>
                  <RichText data={data.description} disableContainer={true} className="text-lg" />
                </div>
              ) : null}
            </div>
            <Button icon={<CallIcon />}>{data?.action}</Button>
          </div>
        </div>
        <div className="flex justify-evenly">
          {data?.featureCards &&
            data?.featureCards.length > 0 &&
            data.featureCards.map((feature) => {
              return (
                <div className="flex flex-col gap-5 bg-card rounded-xl text-primary-foreground w-[376px] p-5">
                  <div className="h-10 w-10 rounded-full bg-primary flex justify-center items-center">
                    {feature.featureImage && (
                      <SVGImageIcon src={getURLFromMedia(feature.featureImage)} className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="font-medium text-xl">{feature.title}</p>
                    <p className="text-sm opacity-80">{feature.description}</p>
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </section>
  )
}
