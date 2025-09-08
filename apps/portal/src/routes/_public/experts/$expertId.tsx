import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Calendar, Video, MapPin, Clock, ChevronLeft, Share2 } from 'lucide-react'
import type { ExpertType, ServiceMode, Prisma } from '@pmc/server/src/generated/prisma/client'
import { match } from 'ts-pattern'
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
        slug: true
        price: true
        currency: true
        durationInMinutes: true
        description: true
        availableModes: true
        tags: true
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

function formatServiceModes(modes: ServiceMode[]): { icon: any; text: string }[] {
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

function ServiceCard({ service, onBook }: { service: any; onBook: () => void }) {
  const availableModes = formatServiceModes(service.availableModes)

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-accent">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">{service.name}</h3>
          <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{service.description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-primary">{formatCurrency(service.price, service.currency)}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
            <Clock className="w-4 h-4" />
            {service.durationInMinutes} mins
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {availableModes.map((mode, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-full text-sm">
            <mode.icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{mode.text}</span>
          </div>
        ))}
      </div>

      {service.availableModes.includes('IN_PERSON') && service.city && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          {service.city}, {service.country}
        </div>
      )}

      {service.tags && service.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {service.tags.slice(0, 4).map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-accent text-accent-foreground border border-border"
            >
              {tag}
            </span>
          ))}
          {service.tags.length > 4 && (
            <span className="text-xs text-muted-foreground px-2 py-1">+{service.tags.length - 4} more</span>
          )}
        </div>
      )}

      <Button
        onClick={onBook}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-3 font-medium transition-colors"
      >
        Book This Service
      </Button>
    </div>
  )
}

function ExpertDetailSkeleton() {
  return (
    <div className="min-h-screen bg-accent">
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-32 mb-8"></div>

          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-accent opacity-30"></div>
            <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl border border-border shadow-xl p-8 mb-8">
              <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                <div className="w-64 h-64 bg-muted rounded-full"></div>
                <div className="flex-1 text-center lg:text-left">
                  <div className="h-12 bg-muted rounded mb-4 w-3/4 mx-auto lg:mx-0"></div>
                  <div className="h-6 bg-muted rounded mb-2 w-1/2 mx-auto lg:mx-0"></div>
                  <div className="h-4 bg-muted rounded mb-4 w-1/3 mx-auto lg:mx-0"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                    <div className="h-4 bg-muted rounded w-4/6"></div>
                  </div>
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
  const [selectedMode, setSelectedMode] = useState<ServiceMode>('VIRTUAL')

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['expert', expertId],
    queryFn: () => fetchExpertDetails(expertId),
  })

  if (isLoading) return <ExpertDetailSkeleton />

  if (isError) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent via-background to-accent/50"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="text-center py-16">
            <div className="bg-card/80 backdrop-blur-xl border border-destructive/20 rounded-3xl p-8 max-w-md mx-auto shadow-2xl">
              <div className="text-destructive mb-4 font-medium text-lg">
                Error loading expert details: {error instanceof Error ? error.message : 'Unknown error'}
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="bg-destructive hover:bg-destructive/90 text-primary-foreground rounded-2xl px-6 py-3"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Safely cast the expert data with proper null checks
  const expert = data?.expert as ExpertWithDetails | undefined
  if (!expert) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Expert not found</h1>
          <p className="text-muted-foreground">The expert you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const { servicesProvided, user, name, type, avgRating, city, country, bio, qualifications, availability } = expert

  const allServiceModes = [...new Set(servicesProvided?.flatMap((s) => s.availableModes) || [])]
  const availableModes = formatServiceModes(allServiceModes)
  const filteredServices = servicesProvided?.filter((service) => service.availableModes.includes(selectedMode)) || []

  const prices = servicesProvided?.map((s) => s.price) || []
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

  const handleBookService = (serviceSlug: string) => {
    console.log('Booking service:', serviceSlug)
  }

  return (
    <div className="min-h-screen bg-accent">
      {/* Decorative background elements using CSS variables */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full opacity-50"></div>
        <div className="absolute top-1/2 -left-40 w-60 h-60 bg-accent-foreground/20 rounded-full opacity-50"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-primary/30 rounded-full opacity-40"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        <Link
          to="/experts"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Experts</span>
        </Link>

        {/* Hero Section */}
        <div className="relative overflow-hidden mb-12">
          <div className="absolute inset-0 bg-accent/40"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23385246' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>

          <div className="relative bg-card/90 backdrop-blur-sm rounded-3xl border border-border shadow-2xl p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-card bg-accent p-1">
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = defaultImageUrl
                    }}
                  />
                </div>
              </div>

              {/* Expert Details */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-3">{name}</h1>
                <p className="text-xl text-primary font-semibold mb-2">{getExpertTypeDisplay(type)}</p>

                {/* Qualifications */}
                {qualifications && (
                  <div className="mb-3">
                    <p className="text-lg text-foreground font-medium">
                      {(typeof qualifications === 'string'
                        ? [qualifications]
                        : Array.isArray(qualifications)
                          ? qualifications
                          : []
                      ).join(', ')}
                    </p>
                  </div>
                )}

                {/* Experience and Location */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-muted-foreground justify-center lg:justify-start">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {city}, {country}
                    </span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mb-6">
                  <p className="text-2xl font-bold text-foreground">
                    Starts at <span className="text-primary">{formatCurrency(minPrice)}</span> for{' '}
                    {servicesProvided?.[0]?.durationInMinutes || 50} mins
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-semibold text-lg shadow-lg">
                    <Calendar className="w-5 h-5 mr-2" />
                    BOOK SESSION
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-foreground hover:bg-accent px-6 py-3 rounded-full font-semibold"
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {bio && (
          <div className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border shadow-lg p-8 mb-8">
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">About {name}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{bio}</p>
              <button className="text-primary font-medium mt-2 hover:text-primary/80 transition-colors">
                Read more
              </button>
            </div>
          </div>
        )}

        {/* Services/Expertise Section */}
        <div className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Expertise & Services</h2>

          {/* Service Mode Tabs */}
          {availableModes.length > 1 && (
            <div className="flex gap-2 mb-8 p-1 bg-muted rounded-full w-fit">
              {availableModes.map((mode, i) => {
                const isActive =
                  (selectedMode === 'VIRTUAL' && mode.text === 'Online') ||
                  (selectedMode === 'IN_PERSON' && mode.text === 'In-person')
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedMode(mode.text === 'Online' ? 'VIRTUAL' : 'IN_PERSON')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <mode.icon className="w-5 h-5" />
                    {mode.text} Sessions
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
