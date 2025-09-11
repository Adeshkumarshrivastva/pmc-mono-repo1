import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, Star, Calendar, MapPin, X, UserIcon } from 'lucide-react'
import type { ExpertType, ServiceMode, DayOfWeek } from '@pmc/server/src/generated/prisma/client'
import type { SortBy } from '@pmc/server/src/routes/experts/experts.input'
import { match } from 'ts-pattern'
import type { InferResponseType } from 'hono'
import { Button } from '@/components/ui/button'
import { honoClient, type HonoClient } from '@/lib/hono-client'
import { Combobox } from '@/components/ui/combo-box'
import { CURRENCY_CONFIG, SERVICE_MODE_CONFIG } from '../$expertId'

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

type ExpertWithRelations = InferResponseType<HonoClient['server']['experts']['$get'], 200>['experts'][number]

function ExpertCard({ expert }: { expert: ExpertWithRelations }) {
  const { servicesProvided, user, name, slug, city, country, qualifications, availability } = expert
  const [selectedMode, setSelectedMode] = useState<ServiceMode>('VIRTUAL')
  const [showAllServices, setShowAllServices] = useState(false)
  const navigate = useNavigate()

  const allServiceModes = [...new Set(servicesProvided?.flatMap((s) => s.availableModes) || [])]
  const availableModes = Object.keys(SERVICE_MODE_CONFIG)
    .filter((mode) => allServiceModes.includes(mode as ServiceMode))
    .map((mode) => ({
      ...SERVICE_MODE_CONFIG[mode as ServiceMode],
      icon: SERVICE_MODE_CONFIG[mode as ServiceMode].icon,
    }))

  const filteredServices = servicesProvided?.filter((service) => service.availableModes.includes(selectedMode)) || []
  const prices =
    servicesProvided?.map((service) => service.price).filter((price): price is number => price != null) || []
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0

  const nextSlot = getNextAvailableSlot(availability)

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-36 h-48 shrink-0">
            {user.image ? (
              <div className="relative flex-shrink-0">
                <div className="w-36 h-48">
                  <img src={user.image} alt={name} className="w-full h-full object-cover rounded-xl" />
                </div>
              </div>
            ) : (
              <UserIcon className="size-6 text-gray-400" />
            )}
            <Link
              to="/experts/$expertId"
              params={{ expertId: slug || expert.id }}
              className="absolute bottom-0 left-0 right-0 bg-foreground text-background text-xs font-medium py-1.5 text-center rounded-b-xl hover:opacity-90 transition"
            >
              VIEW PROFILE
            </Link>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-foreground truncate">{name}</h3>
              <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">{expert.avgRating || '—'}</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground mb-2">
              Price Range:{' '}
              <span className="font-semibold text-foreground">
                {minPrice > 0 ? `${CURRENCY_CONFIG['INR'].symbol}${minPrice}` : 'Contact for pricing'}
              </span>
            </div>

            <div className="text-sm text-muted-foreground mb-2">
              Location:{' '}
              <span className="font-semibold text-foreground">
                {city}, {country}
              </span>
            </div>

            {qualifications ? (
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-1">Qualifications:</div>
                <div className="flex flex-wrap gap-1">
                  {(typeof qualifications === 'string'
                    ? qualifications.split(',').map((q) => q.trim())
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
            ) : null}
          </div>
        </div>

        {availableModes.length > 0 ? (
          <div className="flex gap-2 mb-4">
            {availableModes.map((mode, i) => {
              const isActive = selectedMode === mode.value

              return (
                <Button
                  key={i}
                  onClick={() => setSelectedMode(mode.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-100 text-orange-700 border border-orange-300'
                      : 'bg-muted text-muted-foreground border border-border hover:bg-accent'
                  }`}
                  icon={<mode.icon className="w-4 h-4" />}
                >
                  {mode.label}
                </Button>
              )
            })}
          </div>
        ) : null}

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-foreground">
              Available Services ({selectedMode === 'VIRTUAL' ? 'Online' : 'In-person'})
            </div>
            {filteredServices.length > 2 ? (
              <button
                onClick={() => setShowAllServices(!showAllServices)}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {showAllServices ? 'Show Less' : `Show All (${filteredServices.length})`}
              </button>
            ) : null}
          </div>

          <div className="space-y-2">
            {(showAllServices ? filteredServices : filteredServices.slice(0, 2)).map((service) => (
              <div key={service.id} className="bg-accent rounded-lg p-3 border border-border">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-foreground text-sm">{service.name}</h4>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{`${CURRENCY_CONFIG[service.currency || 'INR'].symbol}${service.price}`}</p>
                    <div className="text-xs text-muted-foreground">{service.durationInMinutes} mins</div>
                  </div>
                </div>
                {service.city && service.country && selectedMode === 'IN_PERSON' ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {service.city}, {service.country}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm bg-accent rounded-lg">
              No services available for {selectedMode === 'VIRTUAL' ? 'online' : 'in-person'} sessions
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Next available slot:</div>
              <div className="text-sm font-medium text-orange-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {nextSlot}
              </div>
            </div>
          </div>

          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium transition-colors"
            onClick={() => navigate({ to: `/experts/${slug}` })}
          >
            BOOK
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OurExperts() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'rating',
    sortOrder: 'desc',
  })

  const [showFilters, setShowFilters] = useState(false)

  const fetchExpertQuery = useQuery({
    queryKey: ['experts', filters],
    queryFn: () => fetchExperts(filters),
  })

  function updateFilter(
    key: keyof FilterState,
    value: string | number | ExpertType | ServiceMode | SortBy | 'asc' | 'desc' | undefined,
  ) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-accent">
      <div className="bg-accent border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-3">Our Distinguished Experts</h1>
            <div className="w-24 h-1 bg-primary/50 mx-auto mb-4 rounded-full"></div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect with our qualified mental health professionals who are here to support your journey to wellness.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {match(fetchExpertQuery)
          .with({ status: 'pending' }, () => <ExpertsGridSkeleton />)
          .with({ status: 'error' }, ({ error }) => (
            <div className="text-center py-16">
              <div className="bg-background border border-destructive/20 rounded-2xl p-8 max-w-md mx-auto">
                <div className="text-destructive mb-4 font-medium">
                  Error loading experts: {error instanceof Error ? error.message : 'Unknown error'}
                </div>
                <Button
                  onClick={() => {
                    window.location.reload()
                  }}
                  className="bg-destructive hover:bg-destructive/90 text-primary-foreground rounded-xl px-6 py-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ))
          .with({ status: 'success' }, ({ data }) => {
            const experts = data?.experts || []

            return (
              <>
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-1">Available Experts</h2>
                    <p className="text-muted-foreground">
                      Showing {experts.length} expert{experts.length !== 1 ? 's' : ''} ready to help
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative lg:w-96">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search by name, specialization..."
                        className="w-full h-12 pl-12 pr-4 border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder-muted-foreground"
                        value={filters.search}
                        onChange={(e) => {
                          updateFilter('search', e.target.value)
                        }}
                      />
                    </div>

                    <Button
                      onClick={() => {
                        setShowFilters(!showFilters)
                      }}
                      className={`flex items-center justify-center gap-2 h-12 px-6 rounded-xl border-2 font-medium transition-all duration-200 min-w-[120px] ${
                        showFilters
                          ? 'bg-primary/25 border-primary text-primary hover:bg-primary/10'
                          : 'bg-background border-border text-foreground hover:bg-accent hover:border-border'
                      }`}
                      icon={<Filter className="w-4 h-4 flex-shrink-0" />}
                    >
                      <span>Filters</span>
                    </Button>
                  </div>
                </div>

                {showFilters ? (
                  <div className="sticky top-25 z-20 bg-background border border-border rounded-xl shadow-lg mb-8 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-foreground">Filter Experts</h3>
                        <button
                          onClick={() => {
                            setShowFilters(false)
                          }}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Professional Type</label>
                          <Combobox
                            placeholder="All Types"
                            options={expertTypeOptions}
                            value={filters.type || ''}
                            onValueChange={(value) => {
                              updateFilter('type', (value as ExpertType) || undefined)
                            }}
                            className="w-full h-12 rounded-lg border-border focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Session Type</label>
                          <Combobox
                            placeholder="All Modes"
                            options={serviceModeOptions}
                            value={filters.serviceMode || ''}
                            onValueChange={(value) => {
                              updateFilter('serviceMode', (value as ServiceMode) || undefined)
                            }}
                            className="w-full h-12 rounded-lg border-border focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Price Range (₹)</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="Min"
                              className="w-full h-12 px-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                              value={filters.minPrice || ''}
                              onChange={(e) =>
                                updateFilter('minPrice', e.target.value ? parseInt(e.target.value) : undefined)
                              }
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              className="w-full h-12 px-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                              value={filters.maxPrice || ''}
                              onChange={(e) =>
                                updateFilter('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                          <div className="flex gap-1">
                            <Combobox
                              placeholder="Rating"
                              options={sortByOptions}
                              value={filters.sortBy || 'rating'}
                              onValueChange={(value) => {
                                updateFilter('sortBy', value as SortBy)
                              }}
                              className="flex-1 h-12 rounded-lg border-border focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                            />
                            <Combobox
                              placeholder="asc/desc"
                              options={sortOrderOptions}
                              value={filters.sortOrder || 'desc'}
                              onValueChange={(value) => {
                                updateFilter('sortOrder', value as 'asc' | 'desc')
                              }}
                              className="w-32 h-12 rounded-lg border-border focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Specializations (comma-separated)
                          </label>
                          <input
                            type="text"
                            placeholder="anxiety, depression, trauma..."
                            className="w-full h-12 px-4 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                            value={filters.tags || ''}
                            onChange={(e) => {
                              updateFilter('tags', e.target.value)
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                          <input
                            type="text"
                            placeholder="City name..."
                            className="w-full h-12 px-4 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                            value={filters.location || ''}
                            onChange={(e) => {
                              updateFilter('location', e.target.value)
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end mt-6">
                        <button
                          onClick={() => {
                            setFilters({
                              search: '',
                              sortBy: 'rating',
                              sortOrder: 'desc',
                            })
                          }}
                          className="px-6 py-3 bg-muted text-muted-foreground border border-border hover:bg-accent rounded-lg font-medium transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {experts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-background border border-border rounded-2xl p-12 max-w-md mx-auto">
                      <div className="text-foreground text-xl mb-3 font-semibold">No experts found</div>
                      <p className="text-muted-foreground">
                        Try adjusting your filters or search criteria to find the right professional for you.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ExpertsGrid experts={experts} />
                )}
              </>
            )
          })
          .otherwise(() => null)}
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

async function fetchExperts(filters: FilterState) {
  const queryParams = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      queryParams.append(key, value.toString())
    }
  })

  const response = await honoClient.server.experts.$get({
    query: Object.fromEntries(queryParams.entries()),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch experts')
  }
  return response.json()
}

function getNextAvailableSlot(
  availability?: {
    isActive: boolean
    startTime: string
    endTime: string
    dayOfTheWeek: DayOfWeek
  }[],
): string {
  if (!availability || availability.length === 0) {
    return 'Schedule upon request'
  }

  const activeSlots = availability.filter((slot) => slot.isActive)
  if (activeSlots.length === 0) {
    return 'No available slots'
  }

  const nextSlot = activeSlots[0]
  const timeStr = new Date(nextSlot.startTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `Available ${timeStr}`
}

function ExpertsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
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
        <div className="w-36 h-48 bg-muted rounded-xl flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-5 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-12 bg-muted rounded-xl"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded w-16"></div>
          <div className="h-6 bg-muted rounded w-20"></div>
          <div className="h-6 bg-muted rounded w-14"></div>
        </div>
      </div>
    </div>
  )
}

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
  { value: 'asc', label: 'ascending' },
]
