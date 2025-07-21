import { RichText } from '@payloadcms/richtext-lexical/react'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getService, getServices } from '@/payload/actions'
import { getURLFromMedia } from '@/payload/utils'

type SubServicePageProps = {
  params: Promise<{ subServiceSlug: string }>
}

export default async function SubServicePage({ params }: SubServicePageProps) {
  const { subServiceSlug } = await params

  const service = await getService({ serviceSlug: subServiceSlug })

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <section className="w-full bg-accent">
        <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
          <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16 space-y-20">
            <div className="grid gap-6 md:gap-8 lg:gap-12">
              <div className="space-y-4 mx-auto">
                <h2 className="text-primary text-2xl font-semibold leading-tight sm:text-3xl md:text-5xl">
                  {service?.name}
                </h2>
              </div>
              {service.image ? (
                <div
                  className="bg-cover bg-center bg-no-repeat rounded-2xl min-h-[300px] md:min-h-[400px] lg:min-h-[450px] w-full"
                  style={{ backgroundImage: `url('${getURLFromMedia(service.image ?? '')}')` }}
                >
                  {/* TODO: Add Banner having Location, Phone, Email and Book a visit CTA Button */}
                </div>
              ) : null}
            </div>
            <article>
              <RichText className="prose lg:prose-lg max-w-full" data={service.description!} />
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
