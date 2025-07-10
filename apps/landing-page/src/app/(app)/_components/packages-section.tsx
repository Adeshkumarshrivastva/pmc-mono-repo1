import { Button } from '@/components/ui/button'
import { ChatIcon, CheckIcon } from '@/components/ui/icons'
import { Home } from '@/payload/types'

type PackagesSectionProps = {
  data: Home['packagesSection']
}

export default function PackagesSection({ data }: PackagesSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 xl:px-16 xl:py-25">
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          <div className="space-y-10">
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl max-w-2xl">{data?.title}</h2>
            {data?.availablePackages && data?.availablePackages.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
                {data.availablePackages.map((pkg, index) => (
                  <div key={index} className="rounded-2xl border border-border space-y-2 p-2 bg-primary-foreground">
                    <div className="border border-border rounded-xl p-8 space-y-2">
                      <h3 className="text-2xl font-semibold text-foreground">{pkg?.name}</h3>
                      <div className="flex items-center">
                        <div className="text-foreground font-semibold text-5xl">{pkg?.price?.price}</div>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {'/'}
                          {pkg?.price?.unitText}
                        </span>
                      </div>
                    </div>

                    <div className="border border-border rounded-xl p-8 space-y-5">
                      <p className="font-medium text-muted-foreground">{pkg?.description}</p>
                      <div>
                        <div className="font-semibold text-xl text-foreground">{pkg?.featureHeadline}</div>
                        <div className="space-y-6 mt-8">
                          {pkg?.features && pkg.features.length > 0
                            ? pkg.features.map((feature, index) => (
                                <div key={index} className="flex items-center">
                                  <CheckIcon className="h-8 w-8 text-primary" />
                                  <span className="text-muted-foreground text-sm ml-2">{feature.title}</span>
                                </div>
                              ))
                            : null}
                        </div>
                      </div>

                      <Button icon={<ChatIcon />} className="w-full mt-10">
                        {pkg?.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
