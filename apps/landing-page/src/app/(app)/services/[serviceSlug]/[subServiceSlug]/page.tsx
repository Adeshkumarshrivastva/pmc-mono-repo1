import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { getService, getServices } from '@/payload/actions'
import { getURLFromMedia } from '@/payload/utils'
import { Button } from '@/components/ui/button'
import { CallIcon, LocationIcon, MailIcon } from '@/components/ui/icons'
import Image from 'next/image'

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

            {/* Image and Description - 2 Column Layout */}
            <div className="mt-12 md:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left: Image */}
              {service.image ? (
                <div className="w-full">
                  <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden sticky top-24">
                    <Image
                      src={getURLFromMedia(service.image)}
                      alt={service.name}
                      fill
                      className="object-cover rounded-2xl"
                    />
                  </div>
                </div>
              ) : null}

              {/* Right: Description */}
              <div className="w-full">
                <article className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  <RichText data={service.description!} />
                </article>
              </div>
            </div>

            {/* Contact Info Bar */}
            <div className="mt-8 bg-primary/10 backdrop-blur-sm rounded-xl p-4 border border-primary/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 items-center text-sm">
                <div className="flex items-center space-x-2 min-w-0">
                  <LocationIcon className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground">804 (A), Arcadia, South City II, Sector-49, Gurugram, HR 122018</span>
                </div>

                <div className="flex items-center space-x-2">
                  <CallIcon className="w-5 h-5 text-primary shrink-0" />
                  <a href="tel:+918920530832" className="text-foreground hover:text-primary">089205 30832</a>
                </div>

                <div className="flex items-center space-x-2">
                  <MailIcon className="w-5 h-5 text-primary shrink-0" />
                  <a href="mailto:contact@positivemindcare.com" className="text-foreground hover:text-primary">contact@positivemindcare.com</a>
                </div>

                <Button className="w-full sm:w-auto">
                  <Link href="/contact-us">Book a visit</Link>
                </Button>
              </div>
            </div>
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
                        <div className="relative w-full max-h-64 md:max-h-80 rounded-xl overflow-hidden">
                          <Image
                            src={getURLFromMedia(sub.image)}
                            alt={sub.name}
                            fill
                            className="object-cover rounded-xl"
                            priority={false}
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
