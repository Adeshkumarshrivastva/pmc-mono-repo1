import { match, P } from 'ts-pattern'
import { FacebookIcon, InstagramIcon } from '@/components/ui/icons'
import { Home } from '@/payload/types'
import { Button } from '@/components/ui/button'

type AppointmentSectionProps = {
  data: Home['appointmentSection']
}

export default function AppointmentSection({ data }: AppointmentSectionProps) {
  const appointmentData = data?.appointmentSection

  return (
    <section className="w-full bg-primary py-8 px-4 sm:py-12 sm:px-6 lg:px-28">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-primary-foreground rounded-xl border border-border p-4 sm:p-8 lg:p-16 min-h-[600px] lg:h-[700px]">
          <div className="flex flex-col h-full lg:flex-row lg:items-start lg:justify-between lg:space-x-12 xl:space-x-20">
            <div className="flex-1 flex flex-col h-full mb-8 lg:mb-0">
              <div className="space-y-4 sm:space-y-6 flex-1">
                <div className="text-primary text-xs sm:text-sm font-bold tracking-wider">APPOINTMENT</div>

                <h2 className="font-semibold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight">
                  {appointmentData?.title}
                </h2>

                <div className="flex flex-col sm:flex-row sm:justify-between gap-6 sm:gap-4 pt-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">Our Contact</h3>
                    <div className="space-y-2">
                      {appointmentData?.contacts?.map((contact, index) => (
                        <div
                          key={index}
                          className="font-secondary text-muted-foreground font-medium text-sm sm:text-base"
                        >
                          <a href={`tel:${contact.phone}`} className="hover:text-primary transition-colors">
                            {contact.phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">Location</h3>
                    <div className="font-secondary text-muted-foreground font-medium text-sm sm:text-base">
                      {appointmentData?.location}
                    </div>
                  </div>
                </div>
              </div>

              {appointmentData?.socialMediaLinks && appointmentData?.socialMediaLinks?.length > 0 && (
                <div className="flex items-center space-x-3 sm:space-x-4 pt-4 lg:pt-0">
                  {appointmentData?.socialMediaLinks.map((platform, index) => (
                    <button key={index}>
                      {match(platform.socialMediaPlatform)
                        .returnType<React.ReactNode>()
                        .with('facebook', () => <FacebookIcon className="text-primary h-8 w-8 " />)
                        .with('instagram', () => <InstagramIcon className="text-primary h-8 w-8 " />)
                        .with('x', () => <FacebookIcon className="text-primary h-8 w-8" />)
                        .with('linkedin', () => <FacebookIcon className="text-primary h-8 w-8" />)
                        .with(P._, () => null)
                        .exhaustive()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full lg:w-auto lg:min-w-[400px] xl:min-w-[450px]">
              <form className="border border-border rounded-xl p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="col-span-1">
                    <label htmlFor="name" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Your Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="email" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="col-span-1">
                    <label htmlFor="phone" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter your phone"
                    />
                  </div>

                  <div className="col-span-1">
                    <label
                      htmlFor="services"
                      className="block text-muted-foreground uppercase text-xs font-semibold mb-2"
                    >
                      Services
                    </label>
                    <select
                      id="services"
                      className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="">Choose one</option>
                      {/* TODO: Add Other options */}
                    </select>
                  </div>

                  <div className="col-span-full sm:col-span-2">
                    <label htmlFor="date" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="col-span-full sm:col-span-2">
                    <label htmlFor="time" className="block text-muted-foreground uppercase text-xs font-semibold mb-2">
                      Time
                    </label>
                    <input
                      id="time"
                      type="time"
                      className="w-full border border-border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="col-span-full sm:col-span-2 pt-2">
                    <Button
                      type="submit"
                      className="w-full py-3 text-sm font-semibold tracking-wider hover:bg-primary/90 transition-colors"
                    >
                      MAKE APPOINTMENT
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
