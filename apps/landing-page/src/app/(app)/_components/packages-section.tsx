import { Button } from '@/components/ui/button'
import { ChatIcon, CheckIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import type { Home } from '@/payload/types'
import Image from 'next/image'
import { getURLFromMedia } from '@/payload/utils'

type PackagesSectionProps = {
  data: Home['packagesSection']
}

export default function PackagesSection({ data }: PackagesSectionProps) {
  return (
    <section className="w-full bg-accent">
      <div className="px-4 py-6 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="max-w-7xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          <div className="flex flex-col md:flex-row justify-between mb-10 gap-6">
            <div className="space-y-2 text-primary">
              <h2 className="text-3xl font-bold tracking-tight">{data?.title?.toUpperCase()}</h2>
              <p className="text-xl font-semibold">{data?.subTitle}</p>
            </div>

            <div className="gap-5 flex lg:flex-row flex-col">
              {data?.button?.map((btn, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="truncate text-primary border-primary hover:bg-card hover:text-accent"
                >
                  <span className="flex items-center gap-3">
                    {btn?.icon && <Image src={getURLFromMedia(btn?.icon)} alt="" width={21} height={21} />}
                    {btn?.title?.toUpperCase()}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {data?.availablePackages && data?.availablePackages.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
              {data.availablePackages.map((pkg, index) => (
                <div
                  key={index}
                  className={cn(
                    'relative rounded-2xl border border-border space-y-2 p-0.75',
                    index === 1 ? 'bg-primary' : 'bg-border',
                  )}
                >
                  {/* TODO: Fetch this from CMS */}
                  {index === 1 ? (
                    <div className="absolute top-10 right-6 rounded-2xl bg-yellow-300 text-sm px-5 py-1">Popular</div>
                  ) : null}
                  <div
                    className={cn(
                      'border rounded-xl p-8 space-y-2',
                      index === 1 ? 'border-card bg-card text-primary-foreground' : 'border-accent bg-accent',
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
                        ₹ {pkg?.price}
                      </div>
                    </div>

                    <div className="space-y-5 mt-8">
                      {pkg?.features && pkg.features.length > 0
                        ? pkg.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center">
                              <CheckIcon className="size-6 text-card bg-card rounded-full" />
                              <span
                                className={cn(
                                  'ml-2 text-sm',
                                  index === 1 ? 'text-primary-foreground' : 'text-muted-foreground',
                                )}
                              >
                                {feature.title}
                              </span>
                            </div>
                          ))
                        : null}
                    </div>

                    <Button
                      icon={<ChatIcon />}
                      variant="secondary"
                      className={cn('w-full mt-10 border', index === 1 ? 'border-border' : 'border-card')}
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
    </section>
  )
}
