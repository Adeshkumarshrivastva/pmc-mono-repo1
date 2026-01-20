'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, Star, Calendar, MapPin, X, UserIcon, Filter } from 'lucide-react'
import { match } from 'ts-pattern'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combo-box'
import { Marquee } from '@/components/ui/marquee'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { getFileUrl, specializationOptions, fetchPublicExperts, type Expert } from '@/lib/experts'
import { OouiArrowPreviousLtr, OouiArrowPreviousRtl } from '@/components/ui/icons'

type FilterState = {
  search: string
  type?: string
  serviceMode?: string
  expertise?: string
  location?: string
  gender?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

type ExpertWithRelations = Expert

// Card Component
function ExpertGrid({ expert }: { expert: ExpertWithRelations }) {
  const { servicesProvided, name, slug, city, country, availability, expertise, experienceInYears } = expert
  const [selectedMode] = useState<string | 'ALL'>('ALL')
  const [showAllServices, setShowAllServices] = useState(false)
  const router = useRouter()

  const services = (servicesProvided as any[]) || []

  const allServiceModes = [...new Set(services?.flatMap((s) => s.availableModes) || [])]
  const availableModes = Object.keys(SERVICE_MODE_CONFIG)
    .filter((mode) => allServiceModes.includes(mode))
    .map((mode) => ({
      ...SERVICE_MODE_CONFIG[mode],
      icon: SERVICE_MODE_CONFIG[mode].icon,
    }))

  const filteredServices =
    selectedMode === 'ALL' ? services : services.filter((service) => service.availableModes?.includes(selectedMode))

  const nextSlot = getNextAvailableSlot(availability as any)

  return (
    <div className="bg-white rounded-3xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden text-left">
      <div className="p-6 pb-4 text-slate-900 flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-36 h-40 shrink-0">
            {expert.image ? (
              <div className="relative flex-shrink-0">
                <div className="w-36 h-40">
                  <img
                    src={expert.file ? getFileUrl(expert.file.fileName) : expert.image}
                    alt={name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            ) : (
              <UserIcon className="size-6 text-gray-400" />
            )}
            <Link
              href={`/experts/${slug}`}
              className="absolute bottom-0 left-0 right-0 bg-black text-white text-xs font-medium py-1.5 text-center rounded-b-xl hover:opacity-90 transition"
            >
              VIEW PROFILE
            </Link>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-slate-900 truncate">{name}</h3>
              <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">{expert.avgRating || '—'}</span>
              </div>
            </div>

            {experienceInYears ? (
              <div className="text-sm text-slate-500 mb-2">
                Experience:{' '}
                <span className="font-semibold text-slate-900">
                  {experienceInYears} {experienceInYears === 1 ? 'year' : 'years'}
                </span>
              </div>
            ) : null}

            {expertise ? (
              <div>
                <div className="text-sm text-slate-500 mb-1">Expertise:</div>

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

        <div className="mb-3">
          <div className="flex items-center justify-between">
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
              <div key={service.id} className="bg-card-accent rounded-lg p-3 border border-border">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-slate-900 text-sm">{service.name}</h4>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{`${CURRENCY_CONFIG[service.currency || 'INR']?.symbol || '₹'}${service.price}`}</p>
                    <div className="text-xs text-slate-500">{service.durationInMinutes} mins</div>
                  </div>
                </div>
                {service.city && service.country && selectedMode === 'IN_PERSON' ? (
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />
                    {service.city}, {service.country}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-sm bg-slate-50 rounded-lg">
              No services available for {selectedMode === 'VIRTUAL' ? 'online' : 'in-person'} sessions
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Next available slot:</div>
              <div className="text-sm font-medium text-orange-600 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {nextSlot}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => {
              router.push(`/portal/experts/${expert.slug}`)
            }}
          >
            BOOK
          </Button>
        </div>
      </div>
    </div>
  )
}

function ExpertsGrid({ experts }: { experts: ExpertWithRelations[] }) {
  const router = useRouter()
  const [startIdx, setStartIdx] = useState(0)
  const cardsPerPage = 2

  useEffect(() => {
    setStartIdx(0)
  }, [experts])

  const handlePrev = () => setStartIdx((prev) => Math.max(prev - cardsPerPage, 0))
  const handleNext = () =>
    setStartIdx((prev) => Math.min(prev + cardsPerPage, Math.max(experts.length - cardsPerPage, 0)))

  const visibleExperts = experts.slice(startIdx, startIdx + cardsPerPage)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {visibleExperts.map((expert) => (
          <ExpertGrid key={expert.id} expert={expert} />
        ))}
      </div>

      {experts.length > cardsPerPage && (
        <div className="flex gap-8 justify-center">
          <Button
            icon={<OouiArrowPreviousLtr className="h-5 w-5" />}
            variant="secondary"
            size="icon"
            className="border rounded-full h-10 w-10"
            onClick={handlePrev}
            disabled={startIdx === 0}
          />
          <Button
            icon={<OouiArrowPreviousRtl className="h-5 w-5" />}
            variant="secondary"
            size="icon"
            className="border rounded-full h-10 w-10"
            onClick={handleNext}
            disabled={startIdx + cardsPerPage >= experts.length}
          />
        </div>
      )}

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => {
            router.push(`/portal/experts/`)
          }}
          className="min-w-[200px] text-lg bg-white text-muted-foreground"
        >
          Show All
        </Button>
      </div>
    </div>
  )
}

// Main Component
export type BookingSectionProps = {
  data?: {
    title?: string | null
    description?: string | null
  }
}

export default function BookingSection({ data }: BookingSectionProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    sortBy: 'rating',
    sortOrder: 'asc',
  })
  const [activeTab, setActiveTab] = useState<'book' | 'quick' | 'advanced'>('book')
  const [showFilters, setShowFilters] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const router = useRouter()

  const expertsQuery = useQuery({
    queryKey: ['experts'],
    queryFn: () => fetchPublicExperts(),
  })

  const filteredExperts = useMemo(() => {
    const experts = (expertsQuery.data as any) || []

    let filtered = experts.filter((expert: any) => {
      if (filters.search && filters.search.trim() !== '') {
        const searchTerm = filters.search.trim().toLowerCase()
        const matchesSearch =
          expert.name?.toLowerCase().includes(searchTerm) ||
          expert.gender?.toLowerCase().includes(searchTerm) ||
          expert.city?.toLowerCase().includes(searchTerm) ||
          expert.country?.toLowerCase().includes(searchTerm) ||
          (Array.isArray(expert.expertise) &&
            expert.expertise.some((e: string) => e.toLowerCase().includes(searchTerm))) ||
          (typeof expert.expertise === 'string' && expert.expertise.toLowerCase().includes(searchTerm)) ||
          (expert.servicesProvided &&
            expert.servicesProvided.some((service: any) => service.name?.toLowerCase().includes(searchTerm)))

        if (!matchesSearch) return false
      }

      if (filters.type && filters.type !== '' && expert.type !== filters.type) {
        return false
      }

      if (filters.gender && filters.gender !== '' && expert.gender !== filters.gender) {
        return false
      }

      if (filters.location && filters.location !== '' && expert.city !== filters.location) {
        return false
      }

      if (filters.serviceMode && filters.serviceMode !== '') {
        const hasMode = expert.servicesProvided?.some((s: any) => s.availableModes?.includes(filters.serviceMode))
        if (!hasMode) return false
      }

      if (filters.expertise && filters.expertise !== '') {
        const requiredTags = filters.expertise
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
        if (requiredTags.length > 0) {
          const expertTags = Array.isArray(expert.expertise)
            ? expert.expertise
            : expert.expertise
              ? [expert.expertise]
              : []
          const hasMatch = requiredTags.some((tag) => expertTags.includes(tag))
          if (!hasMatch) return false
        }
      }

      return true
    })

    if (filters.sortBy) {
      filtered = filtered.sort((a: any, b: any) => {
        let valA, valB

        switch (filters.sortBy) {
          case 'rating':
            valA = a.avgRating || 0
            valB = b.avgRating || 0
            break
          case 'price':
            valA = Math.min(...(a.servicesProvided?.map((s: any) => s.price) || [0]))
            valB = Math.min(...(b.servicesProvided?.map((s: any) => s.price) || [0]))
            break
          case 'name':
            valA = a.name || ''
            valB = b.name || ''
            break
          default:
            return 0
        }

        if (valA < valB) return filters.sortOrder === 'desc' ? 1 : -1
        if (valA > valB) return filters.sortOrder === 'desc' ? -1 : 1
        return 0
      })
    }

    return filtered
  }, [expertsQuery.data, filters])

  const locationOptions = generateLocationOptions(expertsQuery.data)

  function updateFilter(key: keyof FilterState, value: string | number | undefined) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <section className="w-full bg-primary px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-semibold text-accent leading-tight">
              {data?.title || ''}
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-lg p-1 overflow-x-auto">
            <Tabs
              value={activeTab}
              onValueChange={(v) => {
                setActiveTab(v as 'book' | 'quick' | 'advanced')
              }}
            >
              <TabsList className="border border-accent w-full py-6 px-1">
                <TabsTrigger
                  value="book"
                  className="cursor-pointer p-5 font-normal sm:text-sm lg:text-lg data-[state=active]:bg-accent data-[state=active]:text-primary data-[state=inactive]:text-accent"
                >
                  Book Session
                </TabsTrigger>
                <TabsTrigger
                  onClick={() => router.push('/quiz')}
                  value="quick"
                  className="cursor-pointer p-5 font-normal sm:text-sm lg:text-lg data-[state=active]:bg-accent data-[state=active]:text-primary data-[state=inactive]:text-accent"
                >
                  Quick Test
                </TabsTrigger>
                <TabsTrigger
                  value="advanced"
                  className="cursor-pointer p-5 font-normal sm:text-sm lg:text-lg data-[state=active]:bg-accent data-[state=active]:text-primary data-[state=inactive]:text-accent"
                >
                  Advanced Test
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Main */}
        <div className="flex flex-col md:flex-row gap-10 items-start mb-4">
          {/* Left Column */}
          <div className="w-full md:w-72 lg:w-80 flex flex-col gap-8 flex-shrink-0">
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-2 flex items-center">
              <Search
                className={cn(
                  `h-7 w-7 transition-colors duration-300 ${searchFocused ? 'text-primary' : 'text-card-accent'}`,
                )}
              />
              <input
                type="text"
                placeholder="Start typing to search experts..."
                className="flex-1 h-10 px-4 bg-transparent focus-visible:outline-none placeholder:text-gray-400 text-base"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className="p-1 hover:bg-card-accent rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Filter Sidebar */}
            <div className={cn('w-full', showFilters ? 'block' : 'hidden md:block')}>
              <div className="bg-white border border-border rounded-2xl shadow-xl overflow-hidden p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Filter Experts</h3>
                  <button
                    onClick={() => {
                      setShowFilters(false)
                    }}
                    className="p-2 hover:bg-card-accent rounded-lg transition-colors md:hidden"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Professional Type</label>
                    <Combobox
                      placeholder="All Types"
                      options={expertTypeOptions}
                      value={filters.type || ''}
                      onValueChange={(value) => {
                        updateFilter('type', (value as Expert['type']) || undefined)
                      }}
                      className="w-full border-border focus:ring-ring focus:border-ring text-foreground hover:bg-card-accent"
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
                      className="w-full border-border focus:ring-ring focus:border-ring text-foreground hover:bg-card-accent"
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
                      className="w-full border-border focus:ring-ring focus:border-ring text-foreground hover:bg-card-accent"
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
                        className="flex-1 border-border focus:ring-ring focus:border-ring text-foreground hover:bg-card-accent"
                      />
                      <Combobox
                        placeholder="asc/desc"
                        options={sortOrderOptions}
                        value={filters.sortOrder || 'asc'}
                        onValueChange={(value) => {
                          updateFilter('sortOrder', value as 'asc' | 'desc')
                        }}
                        className="flex-1 border-border focus:ring-ring focus:border-ring text-foreground hover:bg-card-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Specializations</label>
                    <Combobox
                      placeholder="Select"
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
                      className="w-full border-border focus:ring-ring focus:border-ring text-foreground hover:bg-card-accent"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => {
                      setFilters({
                        search: '',
                        sortBy: 'rating',
                        sortOrder: 'asc',
                      })
                    }}
                    className="px-6 py-3 bg-grey text-muted-foreground border border-border hover:bg-card-accent rounded-lg font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1 w-full">
            {match(expertsQuery)
              .with({ status: 'pending' }, () => <ExpertsGridSkeleton />)
              .with({ status: 'error' }, ({ error }) => (
                <div className="p-8 rounded-2xl text-red-500 text-center">
                  Error: {error instanceof Error ? error.message : 'Unknown'}
                </div>
              ))
              .with({ status: 'success' }, () => {
                const expertList = filteredExperts || []
                return expertList.length === 0 ? (
                  <div className="h-64 flex items-center justify-center rounded-2xl bg-white text-slate-500">
                    No experts found
                  </div>
                ) : (
                  <ExpertsGrid experts={expertList} />
                )
              })
              .otherwise(() => null)}
          </div>
        </div>
      </div>
    </section>
  )
}

function getNextAvailableSlot(
  availability?: {
    isActive: boolean
    startTime: string
    endTime: string
    dayOfTheWeek: string
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
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <ExpertCardSkeleton key={index} />
      ))}
    </div>
  )
}

function ExpertCardSkeleton() {
  return (
    <div className="bg-[#FFFFF5] rounded-3xl border border-border shadow-sm p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-36 h-40 bg-gray-200 rounded-xl flex-shrink-0"></div>
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
      </div>
    </div>
  )
}

function generateLocationOptions(experts?: ExpertWithRelations[]) {
  if (!experts) return []
  const locations = new Set<string>()
  experts.forEach((expert) => {
    if (expert.city) locations.add(expert.city)
  })
  return Array.from(locations)
    .map((location) => ({
      value: location,
      label: location,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

const CURRENCY_CONFIG: Record<string, { symbol: string }> = {
  INR: { symbol: '₹' },
  USD: { symbol: '$' },
  EUR: { symbol: '€' },
  GBP: { symbol: '£' },
}

const SERVICE_MODE_CONFIG: Record<string, { icon: any; label: string }> = {
  VIRTUAL: { icon: UserIcon, label: 'Virtual' },
  IN_PERSON: { icon: MapPin, label: 'In-Clinic' },
}

const serviceModeOptions = [
  { value: '', label: 'All Modes' },
  { value: 'VIRTUAL', label: 'Virtual' },
  { value: 'IN_PERSON', label: 'In-Clinic' },
]

type ServiceMode = 'VIRTUAL' | 'IN_PERSON'

const expertTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'PSYCHIATRIST', label: 'Psychiatrist' },
  { value: 'PSYCHOLOGIST', label: 'Psychologist' },
  { value: 'CLINICAL_PSYCHOLOGIST', label: 'Clinical Psychologist' },
  { value: 'CONSULTANT_PHYSICIAN', label: 'Consultant Physician' },
  { value: 'REHABILITATION_PSYCHOLOGIST', label: 'Rehabilitation Psychologist' },
  { value: 'COUNSELLING_PSYCHOLOGIST', label: 'Counselling Psychologist' },
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

type SortBy = 'rating' | 'price' | 'name'
