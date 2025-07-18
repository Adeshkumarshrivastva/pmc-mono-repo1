import { Button } from '@/components/ui/button'
import SquareArrowRightIcon from '@/components/ui/icons'
import { getService } from '@/payload/actions'
import { Service } from '@/payload/types'
import { getURLFromMedia } from '@/payload/utils'

type MainServicePageProps = {
  params: Promise<{ serviceSlug: string }>
}

export default async function MainServicePage({ params }: MainServicePageProps) {
  const { serviceSlug } = await params
  const service = await getService({ serviceSlug })
  const subServices = service.subservices?.docs as Service[]

  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20">
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16 space-y-20">
          <div className="grid gap-6 md:gap-8 lg:gap-12">
            <div className="space-y-4 mx-auto">
              <h2 className="text-primary text-2xl font-semibold leading-tight sm:text-3xl md:text-5xl">
                {service.name}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3 md:gap-8 lg:gap-12">
              {subServices.map((subService) => (
                <div key={subService.id} className="space-y-2">
                  <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={service.name}
                      src={getURLFromMedia(subService.image ?? '')}
                      className="rounded-3xl w-full h-64 sm:h-80 lg:h-96 lg:w-96 object-cover mx-auto"
                    />
                  </div>
                  <Button
                    className="w-full rounded-2xl justify-between h-16 text-left"
                    icon={<SquareArrowRightIcon className="size-12" />}
                    iconPosition="right"
                  >
                    {subService.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
