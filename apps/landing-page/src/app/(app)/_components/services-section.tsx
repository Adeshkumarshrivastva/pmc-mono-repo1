import { Button } from '@/components/ui/button'
import { Home } from '@/payload/types'

type ServicesSectionProps = {
  data: Home['servicesSection']
}

export default function ServicesSection({ data }: ServicesSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6 sm:space-y-9">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
              <h2 className="text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl max-w-md">{data?.title}</h2>
              {data?.action ? <Button className="w-full sm:w-auto">{data.action}</Button> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
