import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getURLFromMedia } from '@/payload/utils'
import type { Home } from '@/payload/types'
import Link from 'next/dist/client/link'
import { ArrowRightIcon } from 'lucide-react'
import { toSiteHref } from '@/lib/links'

type AcademySectionProps = {
  data: Home['academySection']
}

export default function AcademySection({ data }: AcademySectionProps) {
  return (
    <section className="w-full bg-primary text-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12 xl:px-16 xl:py-18">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="flex flex-col">
              <div className="rounded-xl overflow-hidden shadow-lg">
                {data.leftImage && (
                  <Image
                    src={getURLFromMedia(data.leftImage)}
                    alt=""
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div>
                {data.subTitle && <p className="text-sm uppercase tracking-widest text-black-200">{data.subTitle}</p>}

                {data.title && <h1 className="text-4xl font-sm mt-4 leading-tight">{data.title}</h1>}

                {data.description && <p className="text-gray-200 mt-6 max-w-xl">{data.description}</p>}

                <div className="grid grid-cols-2 gap-6 mt-8 text-sm">
                  {data.featuresCards?.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {feature.featureIcon && (
                        <Image
                          src={getURLFromMedia(feature.featureIcon)}
                          alt=""
                          width={20}
                          height={20}
                          className="object-contain"
                        />
                      )}
                      <span>{feature.featureTitle}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 mt-6">
                  <Link href={toSiteHref(data?.href1 || '')}>
                    <Button
                      variant="secondary"
                      icon={<ArrowRightIcon />}
                      iconPosition="right"
                      className="font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap"
                    >
                      {data?.button1 || ''}
                    </Button>
                  </Link>

                  <Link href={toSiteHref(data?.href2 || '')}>
                    <Button
                      variant="secondary"
                      icon={<ArrowRightIcon />}
                      iconPosition="right"
                      className="font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap"
                    >
                      {data?.button2 || ''}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent p-10 rounded-xl mt-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {data.stats?.stats?.map((stat, i) => (
                <div key={i}>
                  {stat.icon && (
                    <Image
                      src={getURLFromMedia(stat.icon)}
                      alt=""
                      width={28}
                      height={28}
                      className="object-contain text-muted-foreground"
                    />
                  )}
                  <p className="text-4xl font-bold text-primary mt-4">{stat.number}</p>
                  <p className="text-muted-foreground mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
