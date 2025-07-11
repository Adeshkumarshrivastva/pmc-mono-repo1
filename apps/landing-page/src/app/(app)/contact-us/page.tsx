import { RichText } from '@payloadcms/richtext-lexical/react'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { getPayloadClient } from '@/lib/payload'
import { Button } from '@/components/ui/button'

export default async function ContactUsPage() {
  const payload = await getPayloadClient()
  const { contactUs } = await payload.findGlobal({
    slug: 'contact-us',
  })

  return (
    <div className="flex flex-col min-h-screen" style={{ height: `calc(100% - ${NAVBAR_HEIGHT}px)` }}>
      <section className="w-full flex-1 bg-accent">
        <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
              <div className="space-y-6">
                <h2 className="text-3xl font-semibold text-primary sm:text-4xl lg:text-5xl">{contactUs?.title}</h2>
                <div className="lg:text-lg">{contactUs?.subtitle}</div>
                {contactUs?.description ? <RichText data={contactUs.description} className="mt-24" /> : null}
              </div>
              <div className="w-full lg:w-auto lg:min-w-[400px] xl:min-w-[450px]">
                <form className="bg-primary border border-border rounded-xl p-4 sm:p-6 lg:p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="col-span-1">
                      <label htmlFor="name" className="block text-primary-foreground text-xs font-semibold mb-2">
                        Full name
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div className="col-span-1">
                      <label htmlFor="email" className="block text-primary-foreground text-xs font-semibold mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="col-span-full">
                      <label htmlFor="phone" className="block text-primary-foreground text-xs font-semibold mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="Ex. +91 9012 8934 78"
                      />
                    </div>

                    <div className="col-span-full">
                      <label htmlFor="address" className="block text-primary-foreground text-xs font-semibold mb-2">
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="Ex. 12 C Dehradun"
                      />
                    </div>

                    <div className="col-span-full sm:col-span-2">
                      <label htmlFor="message" className="block text-primary-foreground text-xs font-semibold mb-2">
                        Tell us your message
                      </label>
                      <textarea
                        rows={4}
                        id="message"
                        className="w-full bg-primary-foreground rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        placeholder="Write your message here..."
                      />
                    </div>

                    <div className="col-span-full sm:col-span-2 pt-2">
                      <Button
                        type="submit"
                        variant="secondary"
                        className="w-full py-3 text-sm font-semibold transition-colors"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
