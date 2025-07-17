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
      <div className="p-6 sm:p-10 lg:py-20 lg:px-5 flex flex-col gap-10 sm:gap-15 lg:gap-20 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-5 items-center">
          <img
            src={getURLFromMedia(data?.image ?? '')}
            alt={`services`}
            width={545}
            height={505}
            className="object-contain rounded-xl w-full max-w-sm sm:max-w-md lg:max-w-none lg:w-[400px]"
          />
          <div className="p-4 sm:p-8 lg:p-15 w-full">
            <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 pb-4 sm:pb-5 lg:pb-6">
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-center lg:text-left leading-[140%]">
                {data?.title}
              </p>
              {data?.description ? (
                <div>
                  <RichText
                    data={data.description}
                    disableContainer={true}
                    className="text-sm sm:text-base lg:text-lg text-center lg:text-left"
                  />
                </div>
              ) : null}
            </div>
            <div className="flex justify-center lg:justify-start">
              <Button icon={<CallIcon />}>{data?.action}</Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap justify-center lg:justify-evenly gap-5 sm:gap-4 xl:gap-0 lg:gap-2">
          {data?.featureCards &&
            data?.featureCards.length > 0 &&
            data.featureCards.map((feature, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-col gap-5 bg-card rounded-xl text-primary-foreground w-full sm:w-[calc(50%-0.5rem)] lg:w-[376px] p-5 mx-auto sm:mx-0"
                >
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
