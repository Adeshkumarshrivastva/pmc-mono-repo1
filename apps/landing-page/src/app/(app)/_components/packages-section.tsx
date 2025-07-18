import { Button } from '@/components/ui/button'
import { ChatIcon, CheckIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
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
                  <div key={index} className="relative rounded-2xl border border-border space-y-2 p-2 bg-card">
                    {/* TODO: Fetch this from CMS */}
                    {index === 1 ? (
                      <div className="absolute top-4 right-4 rounded-2xl bg-accent text-sm px-5 py-1.5">Best Value</div>
                    ) : null}
                    <div
                      className={cn(
                        'border rounded-xl p-8 space-y-2',
                        index === 1
                          ? 'border-accent bg-primary text-primary-foreground'
                          : 'border-border bg-primary-foreground',
                      )}
                    >
                      <h3
                        className={cn(
                          'text-2xl font-semibold',
                          index === 1 ? 'text-primary-foreground' : 'text-foreground',
                        )}
                      >
                        {pkg?.name}
                      </h3>
                      <div className="flex items-center">
                        <div
                          className={cn(
                            'font-semibold text-5xl',
                            index === 1 ? 'text-primary-foreground' : 'text-foreground',
                          )}
                        >
                          {pkg?.price?.price}
                        </div>
                        <span
                          className={cn(
                            'ml-2 text-xs',
                            index === 1 ? 'text-primary-foreground' : 'text-muted-foreground',
                          )}
                        >
                          {'/'}
                          {pkg?.price?.unitText}
                        </span>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'border rounded-xl p-8 space-y-5',
                        index === 1
                          ? 'border-accent bg-primary text-primary-foreground'
                          : 'border-border bg-primary-foreground',
                      )}
                    >
                      <p
                        className={cn('font-medium', index === 1 ? 'text-primary-foreground' : 'text-muted-foreground')}
                      >
                        {pkg?.description}
                      </p>
                      <div>
                        <div
                          className={cn(
                            'font-semibold text-xl text-foreground',
                            index === 1 ? 'text-primary-foreground' : 'text-foreground',
                          )}
                        >
                          {pkg?.featureHeadline}
                        </div>
                        <div className="space-y-6 mt-8">
                          {pkg?.features && pkg.features.length > 0
                            ? pkg.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-center">
                                  <CheckIcon className="h-7 w-7 text-card bg-card rounded-full" />
                                  <span
                                    className={cn(
                                      'text-sm ml-2',
                                      index === 1 ? 'text-primary-foreground' : 'text-muted-foreground',
                                    )}
                                  >
                                    {feature.title}
                                  </span>
                                </div>
                              ))
                            : null}
                        </div>
                      </div>

                      <Button
                        icon={<ChatIcon />}
                        className="w-full mt-10"
                        variant={index === 1 ? 'secondary' : 'default'}
                      >
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
