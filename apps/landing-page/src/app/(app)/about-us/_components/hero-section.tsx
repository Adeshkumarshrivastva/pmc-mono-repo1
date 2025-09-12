import { RichText } from '@payloadcms/richtext-lexical/react'
import type { AboutUs } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

type HeroSectionProps = {
  data: AboutUs['aboutUsHeroSection']
}

export default function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16 space-y-10">
          <div>
            <div className="col-span-full text-primary text-sm md:text-lg font-bold uppercase tracking-wider">
              {data?.preHeader}
            </div>
            <div className="mt-3 grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-12">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold leading-tight sm:text-3xl md:text-5xl">{data?.heading}</h2>
              </div>

              <div className="flex flex-col justify-center space-y-4 md:space-y-6">
                {data?.description ? (
                  <div className="max-w-none md:text-lg">
                    <RichText data={data?.description} disableContainer={true} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <div
            className="flex flex-col bg-cover bg-[center_30%] bg-no-repeat w-full p-4 sm:p-6 md:p-8 lg:p-12 min-h-[300px] md:min-h-[400px] lg:min-h-[450px] rounded-2xl relative"
            style={{ backgroundImage: `url('${getURLFromMedia(data?.overlayContent?.overlayImage ?? '')}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-transparent rounded-2xl"></div>
            <div className="flex-1 max-w-xl space-y-3 sm:space-y-4 relative z-10">
              <div className="text-lg sm:text-xl md:text-2xl font-medium text-background">
                {data?.overlayContent?.heading}
              </div>
              <div className="text-sm sm:text-base text-background opacity-80">{data?.overlayContent?.description}</div>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8 lg:gap-12 z-10 relative">
              {data?.overlayContent?.statistics?.map((stat) => (
                <div key={stat.id} className="text-background">
                  <div className="text-xl sm:text-2xl md:text-3xl font-light">{stat.value}</div>
                  <div className="text-xs sm:text-sm md:text-base font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
