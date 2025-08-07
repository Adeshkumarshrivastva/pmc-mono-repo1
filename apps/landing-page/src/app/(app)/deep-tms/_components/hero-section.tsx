import { RichText } from '@payloadcms/richtext-lexical/react'
import { DeepTm } from '@/payload/types'

type HeroSectionProps = {
  // TODO: Rename DeepTm to DeepTms in payload and update accordingly
  data: DeepTm['deepTmsHeroSection']
}

export default function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-25">
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16 space-y-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="space-y-4 lg:space-y-8">
              <h1 className="text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl">{data?.title}</h1>
              {data?.description ? (
                <div className="lg:text-lg">
                  <RichText data={data.description} disableContainer={true} />
                </div>
              ) : null}
            </div>
            <div>
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <iframe className="h-auto w-full aspect-video rounded-lg" src={data?.videoUrl ?? ''} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {data?.statCards?.map((stat, index) => (
              <div key={index} className="rounded-2xl border border-border px-6 py-4 bg-card/20 space-y-4">
                <div className="text-2xl text-muted-foreground font-medium font-display">{stat.title}</div>
                <div className="font-semibold text-4xl">{stat.value}</div>
                <div className="text-lg">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
