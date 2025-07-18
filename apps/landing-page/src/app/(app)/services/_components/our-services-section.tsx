import { Button } from '@/components/ui/button'
import { Service } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

type OurServicesSectionProps = {
  services: Service[]
}

export default function OurServicesSection({ services }: OurServicesSectionProps) {
  return (
    <section className="w-full bg-primary">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16 space-y-10">
          <div className="grid gap-6 md:gap-8 lg:gap-12">
            <div className="space-y-4 mx-auto">
              <h2 className="text-primary-foreground text-2xl font-semibold leading-tight sm:text-3xl md:text-5xl">
                {/* TODO: Take data from CMS */}
                Our Services
              </h2>
            </div>
            <div className="space-y-10">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const ServiceCard = ({ service }: { service: Service }) => {
  return (
    <div className="p-8 bg-accent grid grid-cols-3 rounded-3xl">
      <div className="flex flex-col col-span-2 space-y-14">
        <div className="space-y-6 flex-1">
          <h3 className="text-primary text-4xl font-semibold">{service.name}</h3>
          <ul className="text-primary grid grid-cols-2 list-disc list-inside">
            {service.subservices?.docs?.map((subService) => {
              const service = subService as Service
              return <li key={service.id}>{service.name}</li>
            })}
          </ul>
        </div>
        <div>
          <Button>View all Services</Button>
        </div>
      </div>
      <div className="col-span-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={service.name} src={getURLFromMedia(service.image ?? '')} className="rounded-3xl w-96 h-96" />
      </div>
    </div>
  )
}
