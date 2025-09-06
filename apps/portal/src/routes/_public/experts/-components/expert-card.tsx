import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Filter,
  Star,
  Calendar,
  Video,
  ChevronDown,
  MapPin,
  Clock,
  BadgeCheck,
  Users,
  User,
} from 'lucide-react'
import type { ExpertType, ServiceMode, Prisma } from '@pmc/server/src/generated/prisma/client'
import type { SortBy } from '@pmc/server/src/routes/experts/experts.input'
import { Button } from '@/components/ui/button'
import { honoClient } from '@/lib/hono-client'

type ExpertWithRelations = Prisma.ExpertGetPayload<{
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
      }
    }
    availability: {
      select: {
        dayOfTheWeek: true
        startTime: true
        endTime: true
        isActive: true
      }
    }
  }
}>

type FilterState = {
  search: string
  type?: ExpertType
  serviceMode?: ServiceMode
  minPrice?: number
  maxPrice?: number
  tags?: string
  location?: string
  sortBy?: SortBy
  sortOrder?: 'asc' | 'desc'
}

async function fetchExperts(filters: FilterState) {
  const queryParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, value.toString())
    }
  })

  const response = await honoClient.server.expert.$get({
    query: Object.fromEntries(queryParams.entries()),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch experts')
  }
  return response.json()
}

function formatExpertType(type: ExpertType): string {
  const typeMap = {
    PSYCHOLOGIST: 'Psychologist',
    PSYCHIATRIST: 'Psychiatrist',
    CLINICAL_PSYCHOLOGIST: 'Clinical Psychologist',
  }
  return typeMap[type] || type
}

function formatServiceModes(modes: ServiceMode[]): { icon: any; text: string }[] {
  const modeMap = {
    VIRTUAL: { icon: Video, text: 'Online' },
    IN_PERSON: { icon: MapPin, text: 'In-person' },
  }
  return modes.map((mode) => modeMap[mode]).filter(Boolean)
}

function getNextAvailableSlot(availability: any[]): string {
  if (!availability || availability.length === 0) {
    return 'Schedule upon request'
  }

  const activeSlots = availability.filter((slot) => slot.isActive)
  if (activeSlots.length === 0) {
    return 'No available slots'
  }

  return 'Today, 2:30 PM'
}

function formatCurrency(amount: number, currency: string = 'INR'): string {
  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
  }
  return `${currencySymbols[currency as keyof typeof currencySymbols] || currency}${amount}`
}

function ExpertsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <ExpertCardSkeleton key={index} />
      ))}
    </div>
  )
}

function ExpertCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 bg-gray-200 rounded-2xl flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  )
}

function ExpertsGrid({ experts }: { experts: ExpertWithRelations[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
      {experts.map((expert) => (
        <ExpertCard key={expert.id} expert={expert} />
      ))}
    </div>
  )
}

function ExpertCard({ expert }: { expert: ExpertWithRelations }) {
  const { servicesProvided, user, name, slug, type, avgRating, city, country, bio, qualifications, availability } =
    expert
  const [selectedMode, setSelectedMode] = useState<ServiceMode>('VIRTUAL')

  const allServiceModes = [...new Set(servicesProvided?.flatMap((s) => s.availableModes) || [])]
  const availableModes = formatServiceModes(allServiceModes)

  const prices = servicesProvided?.map((s) => s.price) || []
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
  const priceRange =
    minPrice === maxPrice ? formatCurrency(minPrice) : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`

  const durations = servicesProvided?.map((s) => s.durationInMinutes) || []
  const minDuration = durations.length > 0 ? Math.min(...durations) : 60
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 60
  const durationText = minDuration === maxDuration ? `${minDuration} mins` : `${minDuration}-${maxDuration} mins`

  const allTags = [...new Set(servicesProvided?.flatMap((s) => s.tags) || [])]
  const topTags = allTags.slice(0, 3)

  const defaultImageUrl = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face'
  const imageUrl = user?.image || defaultImageUrl

  const nextSlot = getNextAvailableSlot(availability || [])

  return (
    <div className="bg-card text-card-foreground rounded-3xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-36 h-48 shrink-0">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-xl" />
            <Link
              to={`/expert/${slug}`}
              className="absolute bottom-0 left-0 right-0 bg-foreground text-background text-xs font-medium py-1.5 text-center rounded-b-xl hover:opacity-90 transition"
            >
              VIEW PROFILE
            </Link>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-semibold text-foreground truncate font-display">{name}</h3>
              <div className="flex items-center gap-1 bg-accent px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-accent-foreground">{avgRating || '—'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">{formatExpertType(type)}</span>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                {city}, {country}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{bio}</p>}

        {/* Tags */}
        {topTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {topTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground"
              >
                {tag}
              </span>
            ))}
            {allTags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                +{allTags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Modes */}
        {availableModes.length > 0 && (
          <div className="flex gap-2 mb-4">
            {availableModes.map((mode, i) => {
              const isActive =
                (selectedMode === 'VIRTUAL' && mode.text === 'Online') ||
                (selectedMode === 'IN_PERSON' && mode.text === 'In-person')
              return (
                <button
                  key={i}
                  onClick={() => setSelectedMode(mode.text === 'Online' ? 'VIRTUAL' : 'IN_PERSON')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent text-accent-foreground hover:opacity-90'
                  }`}
                >
                  <mode.icon className="w-4 h-4" />
                  {mode.text}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Pricing + Availability */}
      <div className="px-6 pb-4">
        <div className="bg-accent rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Session fee</div>
              <div className="text-lg font-semibold text-foreground">{priceRange}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Duration</div>
              <div className="text-sm font-medium text-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {durationText}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Next available</div>
              <div className="text-sm font-medium text-primary flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {nextSlot}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Services</div>
              <div className="text-sm font-medium text-foreground flex items-center gap-1">
                <Users className="w-4 h-4" />
                {servicesProvided?.length || 0} available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <div className="flex gap-3">
          <Link to={`/expert/${slug}`} className="flex-1">
            <Button className="w-full bg-primary text-primary-foreground hover:opacity-90 rounded-xl py-3 font-medium transition-colors">
              Book Appointment
            </Button>
          </Link>
          <Button variant="outline" className="px-4 rounded-xl border-border text-foreground hover:bg-accent">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ExpertCardsWithFilters() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'rating',
    sortOrder: 'desc',
  })

  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['experts', filters],
    queryFn: () => fetchExperts(filters),
  })

  function updateFilter(key: keyof FilterState, value: any) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function clearFilters() {
    setFilters({
      search: '',
      sortBy: 'rating',
      sortOrder: 'desc',
    })
  }

  function handleReload() {
    window.location.reload()
  }

  const experts = data?.experts || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2 font-display">Our Distinguished Experts</h1>
            <div className="w-20 h-0.5 bg-primary mx-auto mb-3"></div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with our qualified mental health professionals who are here to support your journey to wellness.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, specialization, or location..."
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
              icon={<Filter className="w-5 h-5 shrink-0" />}
            >
              <span className="truncate">Filters </span>
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 p-6 bg-white rounded-2xl border border-gray-100 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Expert Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Professional Type</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    value={filters.type || ''}
                    onChange={(e) => updateFilter('type', e.target.value || undefined)}
                  >
                    <option value="">All Types</option>
                    <option value="PSYCHOLOGIST">Psychologist</option>
                    <option value="PSYCHIATRIST">Psychiatrist</option>
                    <option value="CLINICAL_PSYCHOLOGIST">Clinical Psychologist</option>
                  </select>
                </div>

                {/* Service Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    value={filters.serviceMode || ''}
                    onChange={(e) => updateFilter('serviceMode', e.target.value || undefined)}
                  >
                    <option value="">All Modes</option>
                    <option value="VIRTUAL">Online Only</option>
                    <option value="IN_PERSON">In-Person Only</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      value={filters.minPrice || ''}
                      onChange={(e) => updateFilter('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      value={filters.maxPrice || ''}
                      onChange={(e) => updateFilter('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      value={filters.sortBy || 'rating'}
                      onChange={(e) => updateFilter('sortBy', e.target.value)}
                    >
                      <option value="rating">Rating</option>
                      <option value="price">Price</option>
                      <option value="name">Name</option>
                    </select>
                    <select
                      className="px-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      value={filters.sortOrder || 'desc'}
                      onChange={(e) => updateFilter('sortOrder', e.target.value)}
                    >
                      <option value="desc">↓</option>
                      <option value="asc">↑</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tags and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specializations (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="anxiety, depression, trauma..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    value={filters.tags || ''}
                    onChange={(e) => updateFilter('tags', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="City name..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                    value={filters.location || ''}
                    onChange={(e) => updateFilter('location', e.target.value)}
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="px-6 py-3 bg-white text-gray-700 border-gray-200 hover:bg-gray-50 rounded-xl"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {isLoading && <ExpertsGridSkeleton />}

        {isError && (
          <div className="text-center py-16">
            <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-red-600 mb-4 font-medium">
                Error loading experts: {error instanceof Error ? error.message : 'Unknown error'}
              </div>
              <Button onClick={handleReload} className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-2">
                Try Again
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !isError && experts.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-md mx-auto">
              <div className="text-gray-900 text-xl mb-3 font-semibold">No experts found</div>
              <p className="text-gray-600">
                Try adjusting your filters or search criteria to find the right professional for you.
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && experts.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Available Experts</h2>
                <p className="text-gray-600">
                  Showing {experts.length} expert{experts.length !== 1 ? 's' : ''} ready to help
                </p>
              </div>
            </div>
            <ExpertsGrid experts={experts} />
          </>
        )}
      </div>
    </div>
  )
}
