import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getService, getServices } from '@/payload/actions'
import { getURLFromMedia } from '@/payload/utils'
import { Button } from '@/components/ui/button'
import { CallIcon, LocationIcon, MailIcon } from '@/components/ui/icons'

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
    <>
      <section className="w-full bg-accent">
        <div className="px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-20 lg:px-12 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-primary text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl lg:text-6xl text-center">
              {service.name}
            </h2>

            {service.image ? (
              <div className="mt-12 md:mt-16 flex items-center justify-center  w-full relative">
                <div className="relative w-full min-h-[300px] md:min-h-[400px] lg:min-h-[450px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getURLFromMedia(service.image ?? '')}
                    alt={service.name}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                  />
                </div>

                <div className="absolute inset-x-4 bottom-4 bg-primary-foreground/50 md:bg-primary-foreground/90 backdrop-blur-sm rounded-xl p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 items-center text-sm">
                    {/* TODO: Remove hardcoded contact details, handle via CMS */}
                    <div className="flex items-center space-x-2 min-w-0">
                      <LocationIcon className="w-5 h-5 text-primary shrink-0" />
                      <span>804, Arcadia, South City II, Sector-49, Gurugram, HR 122018</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CallIcon className="w-5 h-5 text-primary shrink-0" />
                      <a href="tel:+918920530832">089205 30832</a>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MailIcon className="w-5 h-5 text-primary shrink-0" />
                      <a href="mailto:contact@positivemindcare.com">contact@positivemindcare.com</a>
                    </div>

                    <Button className="w-full sm:w-auto justify-self-start sm:justify-self-end">
                      <Link href="/contact-us">Book a visit</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            <article className="mt-12 md:mt-16">
              <RichText className="prose prose-sm sm:prose-base lg:prose-lg max-w-none" data={service.description!} />
            </article>
          </div>
        </div>
      </section>
      {subServices.docs.length > 0 ? (
        <section className="w-full bg-card">
          <div className="px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-20 lg:px-12 lg:py-24">
            <div className="max-w-7xl mx-auto space-y-10 md:space-y-16">
              <h3 className="text-primary-foreground text-3xl sm:text-4xl md:text-5xl font-semibold text-center">
                {service?.name} Sub Services
              </h3>

              <div className="space-y-8 md:space-y-12">
                {subServices.docs.map((sub) => {
                  if (typeof sub === 'string') return null

                  return (
                    <article
                      key={sub.id}
                      className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 bg-accent rounded-2xl shadow-md p-6 md:p-8"
                    >
                      <div className="lg:col-span-3 flex flex-col justify-center space-y-3 md:space-y-4">
                        <h4 className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary">{sub.name}</h4>
                        {sub.description && (
                          <div className="text-primary text-sm sm:text-base md:text-lg">
                            <RichText data={sub.description} className="prose prose-sm sm:prose-base lg:prose-lg" />
                          </div>
                        )}
                      </div>

                      {sub.image && (
                        <div className="lg:col-span-2 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getURLFromMedia(sub.image)}
                            alt={sub.name}
                            className="w-full h-auto max-h-64 md:max-h-80 object-cover rounded-xl"
                          />
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
