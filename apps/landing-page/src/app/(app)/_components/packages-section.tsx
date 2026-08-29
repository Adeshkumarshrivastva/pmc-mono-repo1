'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChatIcon, CheckIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import type { Home } from '@/payload/types'
import Image from 'next/image'
import Link from 'next/link'
import { getURLFromMedia } from '@/payload/utils'

type PackagesSectionProps = {
  data: Home['packagesSection']
}

export default function PackagesSection({ data }: PackagesSectionProps) {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({})

  const toggleFlip = (index: number) => {
    setFlippedCards((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Calculate discounted price (50% of original price from CMS)
  const calculateDiscountedPrice = (originalPrice: string | null | undefined) => {
    if (!originalPrice) return null
    const price = parseInt(originalPrice)
    if (isNaN(price)) return null
    return Math.round(price / 2) // 50% discount
  }

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
                  className="relative h-[650px]"
                  style={{ perspective: '1000px' }}
                >
                  <div
                    className={cn(
                      'relative w-full h-full transition-transform duration-700',
                      flippedCards[index] && 'rotate-y-180'
                    )}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: flippedCards[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* Front Side */}
                    <div
                      className={cn(
                        'absolute inset-0 rounded-2xl border border-border p-0.75',
                        index === 1 ? 'bg-primary' : 'bg-border',
                      )}
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                    >
                      {index === 1 && (
                        <div className="absolute top-10 right-6 rounded-2xl bg-yellow-300 text-sm px-5 py-1 z-10">
                          Popular
                        </div>
                      )}
                      <div
                        className={cn(
                          'border rounded-xl p-8 h-full flex flex-col',
                          index === 1 ? 'border-card bg-card text-primary-foreground' : 'border-accent bg-accent',
                        )}
                      >
                        <h3
                          className={cn(
                            'text-2xl font-semibold mb-4',
                            index === 1 ? 'text-primary-foreground' : 'text-foreground',
                          )}
                        >
                          {pkg?.name}
                        </h3>
                        
                        {/* Price with Discount */}
                        <div className="mb-6">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={cn(
                                'font-semibold text-5xl',
                                index === 1 ? 'text-primary-foreground' : 'text-foreground',
                              )}
                            >
                              ₹ {calculateDiscountedPrice(pkg?.price)}
                            </div>
                            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                              50% OFF
                            </div>
                          </div>
                          {pkg?.price && (
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'text-lg line-through opacity-60',
                                  index === 1 ? 'text-primary-foreground' : 'text-muted-foreground',
                                )}
                              >
                                ₹ {pkg?.price}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4 flex-grow mb-6 overflow-y-auto">
                          {pkg?.features && pkg.features.length > 0
                            ? pkg.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-start gap-2">
                                  <CheckIcon className="size-6 text-card bg-card rounded-full flex-shrink-0 mt-0.5" />
                                  <span
                                    className={cn(
                                      'text-sm leading-relaxed',
                                      index === 1 ? 'text-primary-foreground' : 'text-muted-foreground',
                                    )}
                                  >
                                    {feature.title}
                                  </span>
                                </div>
                              ))
                            : null}
                        </div>

                        <button
                          onClick={() => toggleFlip(index)}
                          className={cn(
                            'w-full py-3 px-4 rounded-lg font-medium transition-colors border flex items-center justify-center gap-2',
                            index === 1
                              ? 'bg-card text-card-foreground hover:bg-card/90 border-border'
                              : 'bg-card text-card-foreground hover:bg-card/90 border-card'
                          )}
                        >
                          <ChatIcon className="size-5" />
                          {pkg?.action || 'Explore Package'}
                        </button>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div
                      className={cn(
                        'absolute inset-0 rounded-2xl border border-border p-0.75',
                        index === 1 ? 'bg-primary' : 'bg-border',
                      )}
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <div
                        className={cn(
                          'border rounded-xl p-8 h-full flex flex-col',
                          index === 1 ? 'border-card bg-card text-primary-foreground' : 'border-accent bg-accent',
                        )}
                      >
                        <h3
                          className={cn(
                            'text-2xl font-semibold mb-4',
                            index === 1 ? 'text-primary-foreground' : 'text-foreground',
                          )}
                        >
                          {pkg?.name}
                        </h3>

                        <div className="space-y-3 flex-grow mb-6 overflow-y-auto">
                          <p className={cn('text-sm font-semibold mb-3', index === 1 ? 'text-primary-foreground' : 'text-foreground')}>
                            All Features:
                          </p>
                          {pkg?.features && pkg.features.length > 0
                            ? pkg.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-start gap-2">
                                  <CheckIcon className="size-5 text-card bg-card rounded-full flex-shrink-0 mt-0.5" />
                                  <span
                                    className={cn(
                                      'text-sm leading-relaxed',
                                      index === 1 ? 'text-primary-foreground' : 'text-muted-foreground',
                                    )}
                                  >
                                    {feature.title}
                                  </span>
                                </div>
                              ))
                            : null}
                        </div>

                        <div className="space-y-3">
                          <Link
                            href={`/packages/${pkg?.slug}/book`}
                            className={cn(
                              'w-full py-3 px-4 rounded-lg font-medium transition-colors border flex items-center justify-center gap-2',
                              index === 1
                                ? 'bg-card text-card-foreground hover:bg-card/90 border-border'
                                : 'bg-card text-card-foreground hover:bg-card/90 border-card'
                            )}
                          >
                            Book Now - ₹{calculateDiscountedPrice(pkg?.price)}
                          </Link>
                          
                          <button
                            onClick={() => toggleFlip(index)}
                            className={cn(
                              'w-full py-2 px-4 rounded-lg font-medium transition-colors',
                              index === 1
                                ? 'text-primary-foreground hover:bg-primary-foreground/10'
                                : 'text-foreground hover:bg-foreground/10'
                            )}
                          >
                            ← Back
                          </button>
                        </div>
                      </div>
                    </div>
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
