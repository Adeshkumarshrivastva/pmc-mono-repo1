import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Video, MapPin, Clock, Star, type LucideIcon, ArrowLeft } from 'lucide-react'
import type { ExpertType, ServiceMode, Prisma } from '@pmc/server/src/generated/prisma/client'
import { match, P } from 'ts-pattern'
import { Button } from '@/components/ui/button'
import { honoClient } from '@/lib/hono-client'

export const Route = createFileRoute('/_public/experts/$expertId')({
  component: RouteComponent,
})

type ExpertWithDetails = Prisma.ExpertGetPayload<{
  include: {
    servicesProvided: {
      select: {
        id: true
        name: true
        price: true
        currency: true
        durationInMinutes: true
        availableModes: true
        city: true
        country: true
      }
    }
    user: {
      select: {
        id: true
        name: true
        image: true
        email: true
      }
    }
    availability?: {
      select: {
        dayOfTheWeek: true
        startTime: true
        endTime: true
        isActive: true
      }
    }
  }
}>

async function fetchExpertDetails(expertId: string) {
  const response = await honoClient.server.expert[':expertSlug'].$get({
    param: { expertSlug: expertId },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch expert details')
  }
  return response.json()
}

function formatServiceModes(modes: ServiceMode[]): { icon: unknown; text: string }[] {
  const modeMap = {
    VIRTUAL: { icon: Video, text: 'Online' },
    IN_PERSON: { icon: MapPin, text: 'In-person' },
  }
  return modes.map((mode) => modeMap[mode]).filter(Boolean)
}

function formatCurrency(amount: number, currency: string = 'INR'): string {
  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
  }
  return `${currencySymbols[currency as keyof typeof currencySymbols] || currency}${amount}`
}

function getExpertTypeDisplay(type: ExpertType): string {
  return match(type)
    .with('PSYCHOLOGIST', () => 'Psychologist')
    .with('PSYCHIATRIST', () => 'Psychiatrist')
    .with('CLINICAL_PSYCHOLOGIST', () => 'Clinical Psychologist')
    .exhaustive()
}

function formatRating(rating: number): number {
  return rating / 1.0
}
function ServiceCard({
  service,
  onBook,
}: {
  service: ExpertWithDetails['servicesProvided'][number]
  onBook: () => void
}) {
  const availableModes = formatServiceModes(service.availableModes)

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">{service.name}</h3>
        </div>
        <div className="text-right ml-4 flex-shrink-0">
          <div className="text-xl font-bold text-primary">{formatCurrency(service.price, service.currency)}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3" />
            {service.durationInMinutes}min
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {(availableModes as { icon: LucideIcon; text: string }[]).map((mode, i) => (
          <div
            key={i}
            className="flex items-center gap-1 px-2 py-1 bg-muted/50 border border-border rounded-md text-xs"
          >
            <mode.icon className="w-3 h-3 text-muted-foreground" />
            <span className="text-foreground">{mode.text}</span>
          </div>
        ))}
      </div>

      {service.availableModes.includes('IN_PERSON') && service.city ? (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3 h-3" />
          {service.city}, {service.country}
        </div>
      ) : null}

      <Button
        onClick={onBook}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-2 text-sm font-medium transition-colors"
      >
        Book Session
      </Button>
    </div>
  )
}

function ExpertDetailSkeleton() {
  return (
    <div className="min-h-screen bg-accent">
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-32 mb-6"></div>
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
              <div className="w-32 h-32 bg-muted rounded-full flex-shrink-0"></div>
              <div className="flex-1 text-center lg:text-left space-y-3">
                <div className="h-8 bg-muted rounded mb-2 w-3/4 mx-auto lg:mx-0"></div>
                <div className="h-5 bg-muted rounded mb-2 w-1/2 mx-auto lg:mx-0"></div>
                <div className="h-4 bg-muted rounded mb-2 w-1/3 mx-auto lg:mx-0"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RouteComponent() {
  const { expertId } = useParams({ from: '/_public/experts/$expertId' })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedMode, setSelectedMode] = useState<ServiceMode>('VIRTUAL')

  const query = useQuery({
    queryKey: ['expert', expertId],
    queryFn: () => fetchExpertDetails(expertId),
  })

  return match(query)
    .with({ status: 'pending' }, () => <ExpertDetailSkeleton />)
    .with({ status: 'error' }, ({ error }: { error: Error }) => {
      return (
        <div className="min-h-screen relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-accent/50"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 py-8 relative z-10">
            <div className="text-center py-16">
              <div className="bg-card/80 backdrop-blur-xl border border-destructive/20 rounded-2xl p-6 max-w-md mx-auto shadow-lg">
                <div className="text-destructive mb-4 font-medium text-base">
                  Error loading expert details: {error.message}
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-destructive hover:bg-destructive/90 text-primary-foreground rounded-lg px-4 py-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    })

    .with({ status: 'success', data: { expert: P.nullish } }, () => {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground mb-2">Expert not found</h1>
            <p className="text-muted-foreground">The expert you're looking for doesn't exist.</p>
          </div>
        </div>
      )
    })
    .with({ status: 'success' }, ({ data }) => {
      const expert = data?.expert
      const { servicesProvided, user, name, type, city, country, bio, qualifications, avgRating } = expert

      const allServiceModes = [
        ...new Set(
          servicesProvided?.flatMap(
            (serviceItem: ExpertWithDetails['servicesProvided'][number]) => serviceItem.availableModes,
          ) || [],
        ),
      ]

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const availableModes = formatServiceModes(allServiceModes)
      const filteredServices: ExpertWithDetails['servicesProvided'] =
        servicesProvided?.filter((service: ExpertWithDetails['servicesProvided'][number]) =>
          service.availableModes.includes(selectedMode),
        ) || []

      const prices =
        servicesProvided?.map((service: ExpertWithDetails['servicesProvided'][number]) => service.price) || []
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { minPrice, maxPrice, priceRange } = match(prices)
        .with([], () => ({ minPrice: 0, maxPrice: 0, priceRange: 'N/A' }))
        .otherwise((priceList) => {
          const min = Math.min(...priceList)
          const max = Math.max(...priceList)
          return {
            minPrice: min,
            maxPrice: max,
            priceRange: min === max ? formatCurrency(min) : `${formatCurrency(min)} - ${formatCurrency(max)}`,
          }
        })

      const defaultImageUrl = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face'
      const imageUrl = user?.image || defaultImageUrl

      return (
        <div className="min-h-screen bg-accent">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full opacity-50"></div>
            <div className="absolute top-1/2 -left-40 w-60 h-60 bg-accent-foreground/20 rounded-full opacity-50"></div>
            <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-primary/30 rounded-full opacity-40"></div>
          </div>

          <div className="container mx-auto px-4 py-6 relative">
            <Link
              to="/experts/page"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium text-sm"
            >
              <span className="flex items-center gap-1">
                <ArrowLeft className="size-4" /> Back to Experts
              </span>
            </Link>

            <div className="relative overflow-hidden mb-8">
              <div className="absolute inset-0 bg-accent/40"></div>

              <div className="relative bg-card/90 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  <div className="relative flex-shrink-0">
                    <div className="w-36 h-48">
                      <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = defaultImageUrl
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-4">
                      <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{name}</h1>
                      <p className="text-lg text-primary font-semibold mb-2">{getExpertTypeDisplay(type)}</p>

                      {avgRating && avgRating > 0 ? (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(formatRating(avgRating)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-foreground ml-1">
                            {formatRating(avgRating).toFixed(1)}
                          </span>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                        <div className="text-center lg:text-left">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <MapPin className="w-4 h-4" />
                            <span className="text-xs">Location</span>
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {city}, {country}
                          </p>
                        </div>

                        {minPrice > 0 ? (
                          <div className="text-center lg:text-left">
                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                              <span className="text-xs">Starting at</span>
                            </div>
                            <p className="text-sm font-semibold text-primary">{formatCurrency(minPrice)}</p>
                          </div>
                        ) : null}
                      </div>

                      {qualifications ? (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-foreground mb-1">Qualifications</h3>
                          <p className="text-sm text-muted-foreground">
                            {(typeof qualifications === 'string'
                              ? [qualifications]
                              : Array.isArray(qualifications)
                                ? qualifications
                                : []
                            ).join(', ')}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex  justiy-end sm:flex-row gap-3">
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium text-sm shadow-md"
                        icon={<Calendar className="w-4 h-4 mr-2" />}
                      >
                        Book Session
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {bio ? (
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6 mb-6">
                <h2 className="text-lg font-bold text-foreground mb-3">About {name}</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{bio}</p>
              </div>
            ) : null}

            <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Services & Expertise</h2>

              {servicesProvided && servicesProvided.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredServices.map((service, index) => (
                    <ServiceCard key={service.id || index} service={service} onBook={() => {}} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No services available.</p>
                </div>
              )}

              {servicesProvided && servicesProvided.length > 0 && filteredServices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No services available for the selected mode.</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )
    })
    .otherwise(() => null)
}
