import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getURLFromMedia } from '@/payload/utils'

import type { Home } from '@/payload/types'
import Link from 'next/dist/client/link'
import { ArrowRightIcon } from 'lucide-react'

type AcademySectionProps = {
  data: Home['academySection']
}

export default function AcademySection({ data }: AcademySectionProps) {
  return (
    <section className="w-full bg-primary text-accent">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 md:px-8 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="rounded-2xl overflow-hidden shadow-lg">
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

          <div className="flex flex-col">
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

            <div className="flex flex-wrap gap-4 mt-10">
              <Link href={data?.href1 || ''}>
                <Button
                  variant="outline"
                  icon={<ArrowRightIcon />}
                  iconPosition="right"
                  className="w-60 hover:bg-accent"
                >
                  {data?.button1 || ''}
                </Button>
              </Link>

              <Link href={data?.href2 || ''}>
                <Button
                  variant="outline"
                  icon={<ArrowRightIcon />}
                  iconPosition="right"
                  className="w-62 hover:bg-accent"
                >
                  {data?.button2 || ''}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-16 items-start">
          <div className="bg-accent p-10 rounded-2xl">
            <div className="grid grid-cols-2 gap-8">
              {data.stats?.stats?.map((stat, i) => (
                <div key={i}>
                  <div className="flex-col items-center gap-3">
                    {stat.icon && (
                      <Image
                        src={getURLFromMedia(stat.icon)}
                        alt=""
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    )}
                    <p className="text-4xl font-bold text-black mt-4">{stat.number}</p>
                  </div>
                  <p className="text-gray-700 mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-lg -mt-24 lg:-mt-40">
            {data.rightImage && (
              <Image
                src={getURLFromMedia(data.rightImage)}
                alt=""
                width={700}
                height={500}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
