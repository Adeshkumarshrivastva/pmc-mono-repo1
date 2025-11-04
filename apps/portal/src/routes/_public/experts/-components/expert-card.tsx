import { useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, Star, Calendar, MapPin, X, UserIcon, Sparkles, TrendingUp } from 'lucide-react'
import type { ExpertType, ServiceMode, DayOfWeek } from '@pmc/server/src/generated/prisma/client'
import type { SortBy } from '@pmc/server/src/routes/experts/experts.input'
import { match } from 'ts-pattern'
import type { InferResponseType } from 'hono'
import { Button } from '@/components/ui/button'
import { honoClient, type HonoClient } from '@/lib/hono-client'
import { Combobox } from '@/components/ui/combo-box'
import { SERVICE_MODE_CONFIG } from '../$expertSlug'
import { CURRENCY_CONFIG } from '@/lib/booking'
import { Marquee } from '@/components/ui/marquee'
import { specializationOptions } from '@/lib/expert'

type FilterState = {
  search: string
  type?: ExpertType
  serviceMode?: ServiceMode
  expertise?: string
  location?: string
  gender?: string
  sortBy?: SortBy
  sortOrder?: 'asc' | 'desc'
}

type ExpertWithRelations = InferResponseType<HonoClient['server']['experts']['$get'], 200>['experts'][number]

function ExpertPage({ expert }: { expert: ExpertWithRelations }) {
  const { servicesProvided, name, slug, city, country, availability, expertise, experienceInYears } = expert
  const [selectedMode] = useState<ServiceMode | 'ALL'>('ALL')
  const [showAllServices, setShowAllServices] = useState(false)
  const navigate = useNavigate()

  const allServiceModes = [...new Set(servicesProvided?.flatMap((s) => s.availableModes) || [])]
  const availableModes = Object.keys(SERVICE_MODE_CONFIG)
    .filter((mode) => allServiceModes.includes(mode as ServiceMode))
    .map((mode) => ({
      ...SERVICE_MODE_CONFIG[mode as ServiceMode],
      icon: SERVICE_MODE_CONFIG[mode as ServiceMode].icon,
    }))

  const filteredServices =
    selectedMode === 'ALL'
      ? servicesProvided || []
      : (servicesProvided || []).filter((service) => service.availableModes?.includes(selectedMode))

  const nextSlot = getNextAvailableSlot(availability)

  return (
    <div className="bg-card rounded-3xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-36 h-48 shrink-0">
            {expert.image ? (
              <div className="relative flex-shrink-0">
                <div className="w-36 h-48">
                  <img src={expert.image} alt={name} className="w-full h-full object-cover rounded-xl" />
                </div>
              </div>
            ) : (
              <UserIcon className="size-6 text-gray-400" />
            )}
            <Link
              to="/experts/$expertSlug"
              params={{ expertSlug: slug }}
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

            {experienceInYears ? (
              <div className="text-sm text-muted-foreground mb-2">
                Experience:{' '}
                <span className="font-semibold text-foreground">
                  {experienceInYears} {experienceInYears === 1 ? 'year' : 'years'}
                </span>
              </div>
            ) : null}

            <div className="text-sm text-muted-foreground mb-2">
              Location:{' '}
              <span className="font-semibold text-foreground">
                {city}, {country}
              </span>
            </div>

            {expertise ? (
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-1">Expertise:</div>

                <div className="group/marquee">
                  <Marquee pauseOnHover className="[--duration:30s] [--gap:0.5rem]" repeat={2}>
                    {(typeof expertise === 'string'
                      ? (expertise as string).split(',').map((q: string) => q.trim())
                      : Array.isArray(expertise)
                        ? (expertise as string[])
                        : []
                    ).map((qual: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap"
                      >
                        {qual}
                      </span>
                    ))}
                  </Marquee>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {availableModes.length > 0 ? (
          <div className="flex gap-2 mb-4 flex-wrap">
            {availableModes.map((mode, i) => {
              const ServiceIcon = mode.icon

              return (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 bg-muted/50 border border-border rounded-md text-sm"
                >
                  <ServiceIcon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-foreground">{mode.label}</span>
                </div>
              )
            })}
          </div>
        ) : null}

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-foreground">Available Services</div>
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
            onClick={() =>
              navigate({
                to: '/experts/$expertSlug',
                params: {
                  expertSlug: expert.slug,
                },
              })
            }
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
    sortOrder: 'asc',
  })

  const [showFilters, setShowFilters] = useState(true)
  const [searchFocused, setSearchFocused] = useState(false)

  const fetchExpertQuery = useQuery({
    queryKey: ['experts', { ...filters, search: undefined }],
    queryFn: () => fetchExperts({ ...filters, search: '' }),
  })

  const allExpertsQuery = useQuery({
    queryKey: ['all-experts'],
    queryFn: () =>
      fetchExperts({
        search: '',
        sortBy: 'rating',
        sortOrder: 'asc',
      }),
  })

  const filteredExperts = useMemo(() => {
    const experts = fetchExpertQuery.data?.experts || []

    if (!filters.search || filters.search.trim() === '') {
      return experts
    }

    const searchTerm = filters.search.trim().toLowerCase()

    const searchAsNumber = parseInt(searchTerm, 10)
    const isNumericSearch = !isNaN(searchAsNumber) && searchTerm === searchAsNumber.toString()

    return experts.filter((expert) => {
      if (expert.name?.toLowerCase().includes(searchTerm)) {
        return true
      }

      if (expert.user?.name?.toLowerCase().includes(searchTerm)) {
        return true
      }

      if (expert.gender?.toLowerCase().includes(searchTerm)) {
        return true
      }

      if (expert.type?.toLowerCase().includes(searchTerm)) {
        return true
      }

      if (expert.city?.toLowerCase().includes(searchTerm)) {
        return true
      }

      if (expert.country?.toLowerCase().includes(searchTerm)) {
        return true
      }

      if (Array.isArray(expert.expertise)) {
        if (expert.expertise.some((e) => e.toLowerCase().includes(searchTerm))) {
          return true
        }
      } else if (typeof expert.expertise === 'string') {
        const expertiseStr = expert.expertise as string
        if (expertiseStr.toLowerCase().includes(searchTerm)) {
          return true
        }
      }

      if (expert.servicesProvided) {
        if (expert.servicesProvided.some((service) => service.name?.toLowerCase().includes(searchTerm))) {
          return true
        }
      }

      if (expert.experienceInYears !== null && expert.experienceInYears !== undefined) {
        if (isNumericSearch) {
          const yearsDiff = Math.abs(expert.experienceInYears - searchAsNumber)
          if (yearsDiff <= 1) {
            return true
          }
        } else {
          if (expert.experienceInYears.toString().includes(searchTerm)) {
            return true
          }
        }
      }

      return false
    })
  }, [fetchExpertQuery.data?.experts, filters.search])

  const locationOptions = generateLocationOptions(allExpertsQuery.data?.experts)

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
        <div className="mb-10">
          <div
            className={`bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 rounded-3xl border-2 p-10 shadow-xl transition-all duration-300 ${
              searchFocused ? 'border-primary shadow-2xl shadow-primary/20 scale-[1.01]' : 'border-primary/30 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-center gap-3 mb-5">
              <Sparkles
                className={`w-6 h-6 transition-all duration-300 ${searchFocused ? 'text-primary animate-pulse' : 'text-primary/70'}`}
              />
              <h2 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                Find Your Perfect Expert
              </h2>
              <Sparkles
                className={`w-6 h-6 transition-all duration-300 ${searchFocused ? 'text-primary animate-pulse' : 'text-primary/70'}`}
              />
            </div>

            <p className="text-center text-muted-foreground mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
              Search by <span className="font-semibold text-foreground">name</span>,{' '}
              <span className="font-semibold text-foreground">specialization</span>,{' '}
              <span className="font-semibold text-foreground">location</span>,{' '}
              <span className="font-semibold text-foreground">experience</span>, or any keyword to discover the right
              professional for you
            </p>

            <div className="max-w-5xl mx-auto mb-6">
              <div className="relative group">
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300 ${searchFocused ? 'opacity-40' : ''}`}
                ></div>

                <div className="relative">
                  <div className="absolute left-5 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Search
                      className={`w-7 h-7 transition-all duration-300 ${searchFocused ? 'text-primary scale-110' : 'text-primary/70'}`}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Start typing to search experts..."
                    className={`w-full h-16 pl-16 pr-14 border-2 rounded-2xl text-base font-medium shadow-lg transition-all duration-300 bg-background text-foreground placeholder-muted-foreground/60 ${
                      searchFocused
                        ? 'border-primary ring-4 ring-primary/20 shadow-xl'
                        : 'border-primary/40 hover:border-primary/60'
                    }`}
                    value={filters.search}
                    onChange={(e) => {
                      updateFilter('search', e.target.value)
                    }}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                  {filters.search && (
                    <button
                      onClick={() => updateFilter('search', '')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2.5 hover:bg-primary/10 rounded-full transition-all duration-200 group/clear"
                      aria-label="Clear search"
                    >
                      <X className="w-5 h-5 text-muted-foreground group-hover/clear:text-foreground transition-colors" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {filters.search && (
              <div className="flex justify-center animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary/15 border-2 border-primary/30 rounded-full shadow-md">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Searching: <span className="text-primary font-bold text-base ml-1">"{filters.search}"</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-background border border-border rounded-full shadow-sm">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <p className="text-muted-foreground font-medium">
              {match(fetchExpertQuery)
                .with(
                  { status: 'success' },
                  () =>
                    `${filteredExperts.length || 0} expert${filteredExperts.length !== 1 ? 's' : ''} ${filters.search ? 'found' : 'ready to help'}`,
                )
                .with({ status: 'pending' }, () => 'Loading experts...')
                .with({ status: 'error' }, ({ error }) => `Error loading experts: ${error}`)
                .otherwise(() => 'Loading...')}
            </p>
          </div>
          <Button
            onClick={() => {
              setShowFilters(!showFilters)
            }}
            className={`flex items-center justify-center gap-3 h-12 px-8 rounded-xl border-2 font-bold transition-all duration-300 shadow-md ${
              showFilters
                ? 'bg-primary border-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 scale-105'
                : 'bg-background border-primary/40 text-foreground hover:bg-primary/5 hover:border-primary/60 hover:scale-105'
            }`}
            icon={
              <Filter
                className={`w-5 h-5 transition-all duration-300 ${showFilters ? 'rotate-180 scale-110' : 'rotate-0'}`}
              />
            }
          >
            <span>Advanced Filters</span>
          </Button>
        </div>

        {showFilters ? (
          <div className="bg-background border border-border rounded-2xl shadow-xl mb-8 overflow-hidden animate-in slide-in-from-top-4 duration-300">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
                  <Combobox
                    placeholder="All Genders"
                    options={genderOptions}
                    value={filters.gender || ''}
                    onValueChange={(value) => {
                      const genderValue = Array.isArray(value) ? value[0] : value
                      updateFilter('gender', genderValue || undefined)
                    }}
                    className="w-full h-12 rounded-lg border-border focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                  />
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
                      value={filters.sortOrder || 'asc'}
                      onValueChange={(value) => {
                        updateFilter('sortOrder', value as 'asc' | 'desc')
                      }}
                      className="flex-1 h-12 rounded-lg border-border focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Specializations</label>
                  <Combobox
                    placeholder="Select specializations..."
                    options={specializationOptions}
                    multiple={true}
                    value={
                      filters.expertise
                        ? String(filters.expertise)
                            .split(',')
                            .map((tag) => tag.trim())
                        : []
                    }
                    onValueChange={(value) => {
                      const expertiseString = Array.isArray(value) ? value.join(', ') : ''
                      updateFilter('expertise', expertiseString || undefined)
                    }}
                    className="w-full h-12 rounded-lg border-border focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                  <Combobox
                    placeholder="Select location..."
                    options={locationOptions}
                    value={filters.location || ''}
                    onValueChange={(value) => {
                      const locationValue = Array.isArray(value) ? value[0] : value
                      updateFilter('location', locationValue || undefined)
                    }}
                    className="w-full h-12 rounded-lg border-border focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground"
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
          .with({ status: 'success' }, () => {
            return filteredExperts.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-background border border-border rounded-2xl p-12 max-w-md mx-auto">
                  <div className="text-foreground text-xl mb-3 font-semibold">No experts found</div>
                  <p className="text-muted-foreground">
                    {filters.search
                      ? `No experts match your search "${filters.search}". Try different keywords.`
                      : 'Try adjusting your filters or search criteria to find the right professional for you.'}
                  </p>
                  {filters.search && (
                    <Button
                      onClick={() => updateFilter('search', '')}
                      className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-2"
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <ExpertsGrid experts={filteredExperts} />
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
        <ExpertPage key={expert.id} expert={expert} />
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

function generateLocationOptions(experts?: ExpertWithRelations[]) {
  if (!experts) {
    return []
  }

  const locations = new Set<string>()

  experts.forEach((expert) => {
    if (expert.city) {
      locations.add(expert.city)
    }
  })

  return Array.from(locations)
    .map((location) => ({
      value: location,
      label: location,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

const expertTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'PSYCHIATRIST', label: 'Psychiatrist' },
  { value: 'PSYCHOLOGIST', label: 'Counseling Psychologist' },
  { value: 'CLINICAL_PSYCHOLOGIST', label: 'Clinical Psychologist' },
]

const serviceModeOptions = [
  { value: '', label: 'All Modes' },
  { value: 'VIRTUAL', label: 'Virtual' },
  { value: 'IN_PERSON', label: 'In-Person' },
]

const sortByOptions = [
  { value: 'rating', label: 'Rating' },
  { value: 'price', label: 'Price' },
  { value: 'name', label: 'Name' },
]

const genderOptions = [
  { value: '', label: 'All Genders' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
]

const sortOrderOptions = [
  { value: 'asc', label: 'ascending' },
  { value: 'desc', label: 'descending' },
]
