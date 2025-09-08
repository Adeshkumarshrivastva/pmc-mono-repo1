import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, Star, Calendar, Video, MapPin, X } from 'lucide-react'
import type { ExpertType, ServiceMode, Prisma } from '@pmc/server/src/generated/prisma/client'
import type { SortBy } from '@pmc/server/src/routes/experts/experts.input'
import { match } from 'ts-pattern'
import { Button } from '@/components/ui/button'
import { honoClient } from '@/lib/hono-client'
import { Combobox } from '@/components/ui/combo-box'

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
    <div className="bg-background rounded-3xl border border-border shadow-sm p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-36 h-48 bg-gray-200 rounded-xl flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-14"></div>
        </div>
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
  const [showAllServices, setShowAllServices] = useState(false)

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

  const allTags = [...new Set(servicesProvided?.flatMap((s) => s.tags) || [])]
  const topTags = allTags.slice(0, 3)

  const defaultImageUrl = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face'
  const imageUrl = user?.image || defaultImageUrl

  const nextSlot = getNextAvailableSlot(availability || [])

  return (
    <div className="bg-card rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-36 h-48 shrink-0">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-xl" />
            <Link
              to={`/experts/${slug}`}
              className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white text-xs font-medium py-1.5 text-center rounded-b-xl hover:opacity-90 transition"
            >
              VIEW PROFILE
            </Link>
          </div>

          {/* Expert Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 truncate">{name}</h3>
              <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">{avgRating || '—'}</span>
              </div>
            </div>

            {/* Pricing Range */}
            <div className="text-sm text-gray-600 mb-2">
              Price Range: <span className="font-semibold text-gray-900">{priceRange}</span>
            </div>

            {/* Expertise Tags */}
            {topTags.length > 0 && (
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">Expertise:</div>
                <div className="flex flex-wrap gap-1">
                  {(topTags as string[]).slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Qualifications */}
            {qualifications && qualifications.length > 0 && (
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Qualifications:</div>
                <div className="flex flex-wrap gap-1">
                  {(typeof qualifications === 'string'
                    ? [qualifications]
                    : Array.isArray(qualifications)
                      ? qualifications
                      : []
                  )
                    .slice(0, 2)
                    .map((qual: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        {qual}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Service Mode Selection */}
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-100 text-orange-700 border border-orange-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  <mode.icon className="w-4 h-4" />
                  {mode.text}
                </button>
              )
            })}
          </div>
        )}

        {/* Services Available for Selected Mode */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-700">
              Available Services ({selectedMode === 'VIRTUAL' ? 'Online' : 'In-person'})
            </div>
            {filteredServices.length > 2 && (
              <button
                onClick={() => setShowAllServices(!showAllServices)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAllServices ? 'Show Less' : `Show All (${filteredServices.length})`}
              </button>
            )}
          </div>

          <div className="space-y-2">
            {(showAllServices ? filteredServices : filteredServices.slice(0, 2)).map((service) => (
              <div key={service.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">{service.name}</h4>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatCurrency(service.price, service.currency)}</div>
                    <div className="text-xs text-gray-500">{service.durationInMinutes} mins</div>
                  </div>
                </div>
                {service.description && (
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{service.description}</p>
                )}
                {service.city && service.country && selectedMode === 'IN_PERSON' && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    {service.city}, {service.country}
                  </div>
                )}
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {service.tags.slice(0, 3).map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600 border border-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                    {service.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{service.tags.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg">
              No services available for {selectedMode === 'VIRTUAL' ? 'online' : 'in-person'} sessions
            </div>
          )}
        </div>

        {/* Bottom Info Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Next online slot:</div>
              <div className="text-sm font-medium text-orange-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {nextSlot}
              </div>
            </div>
          </div>
          <Link to={`/expert/${slug}`}>
            <Button className="bg-primary hover:bg-primary/70 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors">
              BOOK
            </Button>
          </Link>
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

  // Options for the comboboxes
  const expertTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'PSYCHOLOGIST', label: 'Psychologist' },
    { value: 'PSYCHIATRIST', label: 'Psychiatrist' },
    { value: 'CLINICAL_PSYCHOLOGIST', label: 'Clinical Psychologist' },
  ]

  const serviceModeOptions = [
    { value: '', label: 'All Modes' },
    { value: 'VIRTUAL', label: 'Online Only' },
    { value: 'IN_PERSON', label: 'In-Person Only' },
  ]

  const sortByOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'price', label: 'Price' },
    { value: 'name', label: 'Name' },
  ]

  const sortOrderOptions = [
    { value: 'desc', label: 'descending' },
    { value: 'asc', label: 'accending' },
  ]

  function updateFilter(
    key: keyof FilterState,
    value: string | number | ExpertType | ServiceMode | SortBy | 'asc' | 'desc' | undefined,
  ) {
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
    <div className="min-h-screen bg-accent">
      {/* Header */}
      <div className="bg-accent border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Our Distinguished Experts</h1>
            <div className="w-24 h-1 bg-primary/50 mx-auto mb-4 rounded-full"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Connect with our qualified mental health professionals who are here to support your journey to wellness.
            </p>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        {match({ isLoading, isError })
          .with({ isLoading: false, isError: false }, () => (
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">Available Experts</h2>
                <p className="text-gray-600">
                  Showing {experts.length} expert{experts.length !== 1 ? 's' : ''} ready to help
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                {/* Search Bar */}
                <div className="relative lg:w-96">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, specialization..."
                    className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                  />
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center justify-center gap-2 h-12 px-6 rounded-xl border-2 font-medium transition-all duration-200 min-w-[120px] ${
                    showFilters
                      ? 'bg-primary/25 border-primary text-primary hover:bg-primary/10'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <Filter className="w-4 h-4 flex-shrink-0" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          ))
          .otherwise(() => null)}

        {/* Expanded Filters - Sticky when open */}
        {match(showFilters)
          .with(true, () => (
            <div className="sticky top-25 z-20 bg-white border border-gray-200 rounded-xl shadow-lg mb-8 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Filter Experts</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Expert Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Professional Type</label>
                    <Combobox
                      placeholder="All Types"
                      options={expertTypeOptions}
                      value={filters.type || ''}
                      onValueChange={(value) => updateFilter('type', (value as string) || undefined)}
                      className="w-full h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>

                  {/* Service Mode */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Session Type</label>
                    <Combobox
                      placeholder="All Modes"
                      options={serviceModeOptions}
                      value={filters.serviceMode || ''}
                      onValueChange={(value) => updateFilter('serviceMode', (value as string) || undefined)}
                      className="w-full h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    />
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₹)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        value={filters.minPrice || ''}
                        onChange={(e) =>
                          updateFilter('minPrice', e.target.value ? parseInt(e.target.value) : undefined)
                        }
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        className="w-full h-12 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        value={filters.maxPrice || ''}
                        onChange={(e) =>
                          updateFilter('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)
                        }
                      />
                    </div>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <div className="flex gap-1">
                      <Combobox
                        placeholder="Rating"
                        options={sortByOptions}
                        value={filters.sortBy || 'rating'}
                        onValueChange={(value) => updateFilter('sortBy', value as string)}
                        className="flex-1 h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      />
                      <Combobox
                        placeholder="asc/desc"
                        options={sortOrderOptions}
                        value={filters.sortOrder || 'desc'}
                        onValueChange={(value) => updateFilter('sortOrder', value as string)}
                        className="w- h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Tags and Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specializations (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="anxiety, depression, trauma..."
                      className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      value={filters.tags || ''}
                      onChange={(e) => updateFilter('tags', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="City name..."
                      className="w-full h-12 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      value={filters.location || ''}
                      onChange={(e) => updateFilter('location', e.target.value)}
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex justify-end mt-6">
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          ))
          .otherwise(() => null)}

        {/* Loading, Error, and Results */}
        {match({ isLoading, isError, expertsCount: experts.length })
          .with({ isLoading: true }, () => <ExpertsGridSkeleton />)
          .with({ isError: true }, () => (
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
          ))
          .with({ isLoading: false, isError: false, expertsCount: 0 }, () => (
            <div className="text-center py-16">
              <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-md mx-auto">
                <div className="text-gray-900 text-xl mb-3 font-semibold">No experts found</div>
                <p className="text-gray-600">
                  Try adjusting your filters or search criteria to find the right professional for you.
                </p>
              </div>
            </div>
          ))
          .with({ isLoading: false, isError: false }, () => <ExpertsGrid experts={experts} />)
          .otherwise(() => null)}
      </div>
    </div>
  )
}
