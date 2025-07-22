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
          <div className="max-w-7xl mx-auto space-y-15 flex flex-col">
            <h3 className="text-primary-foreground text-5xl font-semibold w-full text-center">
              {service?.name} Sub Services
            </h3>
            <div className="space-y-15">
              {subServices.docs.map((service) => {
                if (typeof service === 'string') {
                  return null
                }
                return (
                  <div
                    key={service.slug}
                    className="p-8 bg-accent rounded-2xl shadow-md flex items-center justify-between space-x-6"
                  >
                    <div className="flex flex-col space-y-9 max-w-xl">
                      <h4 className="text-4xl font-semibold text-primary">{service.name}</h4>
                      {service?.description ? (
                        <div className="text-primary max-w-none text-lg">
                          <RichText data={service.description} disableContainer={true} />
                        </div>
                      ) : null}
                      <Button className="max-w-[128px] text-base">Learn More</Button>
                    </div>
                    <div>
                      {service.image && (
                        <img
                          alt={service.name}
                          src={getURLFromMedia(service.image) ?? ''}
                          className="object-cover max-w-[500px] max-h-[400px] rounded-2xl"
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
