import { RichText } from '@payloadcms/richtext-lexical/react'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getService, getServices } from '@/payload/actions'
import { getURLFromMedia } from '@/payload/utils'
import { Button } from '@/components/ui/button'

type SubServicePageProps = {
  params: Promise<{ subServiceSlug: string }>
}

export default async function SubServicePage({ params }: SubServicePageProps) {
  const { subServiceSlug } = await params

  const service = await getService({ serviceSlug: subServiceSlug })

  const subServices = await getServices({
    parentServiceSlug: service.slug,
  })

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
      <section className="w-full bg-card">
        <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
          <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 lg:space-y-15 flex flex-col">
            <h3 className="text-primary-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold w-full text-center">
              {service?.name} Sub Services
            </h3>
            <div className="space-y-6 md:space-y-8 lg:space-y-12 xl:space-y-15">
              {subServices.docs.map((service) => {
                if (typeof service === 'string') {
                  return null
                }
                return (
                  <div
                    key={service.slug}
                    className="p-4 sm:p-6 md:p-8 bg-accent rounded-xl md:rounded-2xl shadow-md flex flex-col-reverse gap-5 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-6"
                  >
                    <div className="flex flex-col space-y-4 sm:space-y-6 md:space-y-12 lg:max-w-xl xl:max-w-2xl">
                      <div className="flex flex-col space-y-2 md:space-y-8">
                        <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-primary">
                          {service.name}
                        </h4>
                        {service?.description ? (
                          <div className="text-primary max-w-none text-sm sm:text-base md:text-lg">
                            <RichText data={service.description} disableContainer={true} />
                          </div>
                        ) : null}
                      </div>
                      <Button className="max-w-[128px] text-sm sm:text-base self-start">Learn More</Button>
                    </div>
                    <div className="flex-shrink-0">
                      {service.image && (
                        <img
                          alt={service.name}
                          src={getURLFromMedia(service.image) ?? ''}
                          className="object-cover w-full max-w-[300px] sm:max-w-[500px] lg:max-w-[500px] h-auto max-h-[200px] sm:max-h-[300px] lg:max-h-[400px] rounded-xl md:rounded-2xl mx-auto lg:mx-0"
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
