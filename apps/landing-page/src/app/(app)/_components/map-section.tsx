import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { getURLFromMedia } from '@/payload/utils'
import type { Home } from '@/payload/types'
import AppointmentForm from './appointment-form'
import { CallIcon } from '@/components/ui/icons'

type MapSectionProps = {
  data: Home['mapSection']
}

export default function MapSection({ data }: MapSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-12 sm:px-6 sm:py-16 md:px-8 md:py-20 lg:px-12 lg:py-20 relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="flex">
              <div className="space-y-6">
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-primary leading-tight">
                  {data?.title}
                </div>

                {data?.description ? (
                  <div className="text-base sm:text-lg text-primary leading-relaxed">
                    <RichText data={data.description} disableContainer={true} />
                  </div>
                ) : null}

                {/* <div>
                  <AppointmentForm
                    trigger={
                      <Button variant="default" icon={<CallIcon />} className="w-full sm:w-auto">
                        Book Trial Session Now
                      </Button>
                    }
                  />
                </div> */}
              </div>
            </div>

            {data?.image ? (
              <div className="flex justify-center lg:justify-end">
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src={getURLFromMedia(data.image)}
                    alt="World map showing locations"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 700px, 780px"
                    className="object-contain"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
