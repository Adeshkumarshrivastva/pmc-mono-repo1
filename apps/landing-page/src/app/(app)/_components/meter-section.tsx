import type { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import Link from 'next/link'

type MeterSectionProps = {
  data: Home['meterSection']
}

const SCREENING_TESTS = [
  { title: 'Anxiety', href: 'https://forestgreen-scorpion-490773.hostingersite.com/anxiety-screening/' },
  { title: 'Depression', href: 'https://forestgreen-scorpion-490773.hostingersite.com/depression-screening/' },
]

export default function MeterSection({ data }: MeterSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12 xl:px-16 xl:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 md:gap-8 lg:gap-12 mb-8 sm:mb-10">
            <div className="space-y-4 max-w-lg">
              <h2 className="text-2xl font-semibold leading-tight text-primary sm:text-3xl md:text-4xl">
                {data?.title ? <RichText data={data.title} disableContainer={true} /> : null}
              </h2>
            </div>

            <div className="flex flex-col items-end">
              <div className="max-w-xl">
                {data?.description ? (
                  <p className="text-lg text-foreground leading-relaxed opacity-80">{data.description}</p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {data?.meters?.map((meter) => {
              const imageUrl = getURLFromMedia(meter.meterImage ?? '')
              return (
                <Link href={meter.href ?? ''} key={meter.id}>
                  <div className="bg-card p-4 rounded-xl flex flex-col items-center justify-between h-[320px]">
                    <div className="flex-1 flex items-center justify-center w-full">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={meter.title ?? ''}
                          width={256}
                          height={161}
                          className="object-contain max-h-[200px]"
                        />
                      ) : null}
                    </div>
                    <h3 className="text-2xl font-semibold text-accent text-center mt-4">{meter.title}</h3>
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="mt-8 sm:mt-10">
            <h3 className="text-xl font-semibold text-primary text-center mb-4 sm:mb-6">Minds AI for Screening Test</h3>
            <div className="grid gap-4 xl:gap-6 grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto">
              {SCREENING_TESTS.map((test) => (
                <a href={test.href} target="_blank" rel="noopener noreferrer" key={test.title}>
                  <div className="bg-card p-4 rounded-xl flex items-center justify-center h-[140px]">
                    <h3 className="text-2xl font-semibold text-accent text-center">{test.title}</h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
