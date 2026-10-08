import type { Home } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'
import Image from 'next/image'
import Link from 'next/link'
import AITools from './ai-tools'
import ExpertTests from './expert-tests'
import { toSiteHref } from '@/lib/links'

type MeterSectionProps = {
  data: Home['meterSection']
}

export default function MeterSection({ data }: MeterSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-12 lg:py-12 xl:px-16 xl:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-8 text-center text-[clamp(1.5rem,2.3vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-primary sm:mb-12">
            Our Next Generation Psychodiagnostic Services
          </h2>

          <AITools />

          <div className="mb-8 text-center sm:mb-10">
            <h2 className="text-[clamp(1.5rem,2.3vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-primary">
              Check your mental health within 2 minutes
            </h2>
            {data?.description ? (
              <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-primary opacity-80 sm:text-lg">
                {data.description}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
            {data?.meters?.map((meter) => {
              const imageUrl = getURLFromMedia(meter.meterImage ?? '')

              return (
                <Link href={toSiteHref(meter.href ?? '')} key={meter.id}>
                  <div className="flex h-[320px] flex-col items-center justify-between rounded-xl bg-card p-4">
                    <div className="flex w-full flex-1 items-center justify-center">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={meter.title ?? ''}
                          width={256}
                          height={161}
                          className="max-h-[200px] object-contain"
                        />
                      ) : null}
                    </div>
                    <h3 className="mt-4 text-center text-xl font-semibold text-accent">{meter.title}</h3>
                  </div>
                </Link>
              )
            })}
          </div>

          <ExpertTests />
        </div>
      </div>
    </section>
  )
}
