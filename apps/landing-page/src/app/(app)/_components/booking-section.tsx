'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search, Star, Calendar, MapPin, X, UserIcon, Filter } from 'lucide-react'
import { match } from 'ts-pattern'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getFileUrl, fetchPublicExperts, type Expert } from '@/lib/experts'

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
    selectedMode === 'ALL'
      ? services
      : services.filter((service) => service.availableModes?.includes(selectedMode))

  const nextSlot = getNextAvailableSlot(availability as any)

  return (
    <div className="bg-white rounded-3xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group text-left">
      <div className="p-6 pb-4 text-slate-900">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-36 h-48 shrink-0">
            {expert.image ? (
              <div className="relative flex-shrink-0">
                <div className="w-36 h-48">
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

            <div className="text-sm text-slate-500 mb-2">
              Location:{' '}
              <span className="font-semibold text-slate-900">
                {city}, {country}
              </span>
            </div>

            {expertise ? (
              <div className="mb-4">
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

        {availableModes.length > 0 ? (
          <div className="flex gap-2 mb-4 flex-wrap">
            {availableModes.map((mode, i) => {
              const ServiceIcon = mode.icon

              return (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-100 border border-border rounded-md text-sm"
                >
                  <ServiceIcon className="w-3 h-3 text-slate-500" />
                  <span className="text-slate-900">{mode.label}</span>
                </div>
              )
            })}
          </div>
        ) : null}

        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-900">Available Services</div>
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
              <div key={service.id} className="bg-slate-50 rounded-lg p-3 border border-border">
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

        <div className="flex items-center justify-between pt-4 border-t border-border">
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
            className="bg-[#2D463C] hover:bg-[#2D463C]/90 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            onClick={() =>
              router.push(`/experts/${expert.slug}`)
            }
          >
            BOOK
          </Button>
        </div>
      </div>
    </div>
  )
}

function ExpertsGrid({ experts }: { experts: ExpertWithRelations[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
      {experts.map((expert) => (
        <ExpertGrid key={expert.id} expert={expert} />
      ))}
    </div>
  )
}

// --- Main Component ---
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

  const fetchExpertQuery = useQuery({
    queryKey: ['experts', { ...filters, search: undefined }],
    queryFn: () => fetchPublicExperts(),
  })

  const allExpertsQuery = useQuery({
    queryKey: ['all-experts'],
    queryFn: () => fetchPublicExperts(),
  })

  const filteredExperts = useMemo(() => {
    const experts = (fetchExpertQuery.data as any) || []
    
    if (!filters.search || filters.search.trim() === '') {
      return experts
    }

    const searchTerm = filters.search.trim().toLowerCase()
    
    return experts.filter((expert: any) => {
      if (expert.name?.toLowerCase().includes(searchTerm)) return true
      if (expert.gender?.toLowerCase().includes(searchTerm)) return true
      if (expert.city?.toLowerCase().includes(searchTerm)) return true
      if (expert.country?.toLowerCase().includes(searchTerm)) return true
      if (Array.isArray(expert.expertise)) {
        if (expert.expertise.some((e: string) => e.toLowerCase().includes(searchTerm))) return true
      } else if (typeof expert.expertise === 'string') {
        const expertiseStr = expert.expertise as string
        if (expertiseStr.toLowerCase().includes(searchTerm)) return true
      }
      if (expert.servicesProvided) {
        if (expert.servicesProvided.some((service: any) => service.name?.toLowerCase().includes(searchTerm))) return true
      }
      return false
    })
  }, [fetchExpertQuery.data, filters.search])

  const locationOptions = generateLocationOptions(allExpertsQuery.data)

  function updateFilter(
    key: keyof FilterState,
    value: string | number | undefined,
  ) {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-primary py-12">
      <div className="container mx-auto px-4">
        
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">

             <div className="max-w-xl">
                 <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                    {data?.title || "Your Path to Expert Mental Care Starts Here"}
                 </h1>
             </div>

             {/* Tabs */}
             <div className="flex items-center gap-1 border border-white/30 rounded-lg p-1">
                 <button 
                    onClick={() => setActiveTab('book')}
                    className={cn(
                        "px-6 py-2 rounded-md font-medium text-sm transition-all",
                        activeTab === 'book' ? "bg-accent text-primary" : "text-white hover:bg-white/10"
                    )}
                 >
                    Book Session
                 </button>
                 <button 
                    onClick={() => setActiveTab('quick')}
                    className={cn(
                        "px-6 py-2 rounded-md font-medium text-sm transition-all",
                        activeTab === 'quick' ? "bg-accent text-primary" : "text-white hover:bg-white/10"
                    )}
                 >
                    Quick Test
                 </button>
                 <button 
                    onClick={() => setActiveTab('advanced')}
                    className={cn(
                        "px-6 py-2 rounded-md font-medium text-sm transition-all",
                        activeTab === 'advanced' ? "bg-accent text-primary" : "text-white hover:bg-white/10"
                    )}
                 >
                    Advanced Test
                 </button>
             </div>
         </div>

         {/* Search Bar - White Card */}
         <div className="bg-white rounded-xl shadow-lg p-2 mb-8 flex items-center">
            <Search className="w-5 h-5 text-gray-400 ml-4" />
            <input
                type="text"
                placeholder="Start typing to search experts..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-gray-400 h-12 px-4 text-base"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
            />
            {filters.search && (
                <button
                    onClick={() => updateFilter('search', '')}
                    className="p-2 hover:bg-gray-100 rounded-full mr-2"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            )}
         </div>

         {/* Main Content Area */}
         <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Filter Sidebar - White Card */}
            <div className={cn('w-full md:w-80 flex-shrink-0', showFilters ? 'block' : 'hidden md:block')}>
                <div className="bg-white rounded-2xl shadow-lg p-6 text-slate-900">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold">Filter Experts</h3>
                        <Button 
                              size="sm"
                              className="md:hidden"
                              onClick={() => setShowFilters(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Professional Type</label>
                            <Combobox 
                                options={expertTypeOptions} 
                                value={filters.type || ''}
                                onValueChange={(val) => updateFilter('type', val as string)}
                                placeholder="All Types"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Session Type</label>
                            <Combobox 
                                options={serviceModeOptions}
                                value={filters.serviceMode || ''}
                                onValueChange={(val) => updateFilter('serviceMode', val as string)}
                                placeholder="All Modes"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Gender</label>
                            <Combobox 
                                options={genderOptions}
                                value={filters.gender || ''}
                                onValueChange={(val) => updateFilter('gender', val as string)}
                                placeholder="All Genders"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Sort By</label>
                             <div className="flex gap-2">
                                <Combobox options={sortByOptions} value={filters.sortBy} onValueChange={(v) => updateFilter('sortBy', v as string)} placeholder="Rating" className="flex-1"/>
                                <Combobox options={sortOrderOptions} value={filters.sortOrder} onValueChange={(v) => updateFilter('sortOrder', v as string)} placeholder="asc" className="flex-1"/>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-semibold mb-2">Specializations</label>
                            <Combobox 
                                options={specializationOptions}
                                value={filters.expertise || ''}
                                onValueChange={(val) => updateFilter('expertise', val as string)}
                                placeholder="Select..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Location</label>
                            <Combobox
                                    options={locationOptions}
                                    value={filters.location || ''}
                                    onValueChange={(val) => updateFilter('location', val as string)}
                                    placeholder="Select..."
                            />
                        </div>

                        <button
                            onClick={() => setFilters({ search: '', sortBy: 'rating', sortOrder: 'desc' })}
                            className="px-6 py-3 bg-muted text-muted-foreground border border-border hover:bg-accent rounded-lg font-medium transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Area */}
            <div className="flex-1 w-full">
                 <div className="md:hidden mb-4">
                     <Button 
                        onClick={() => setShowFilters(!showFilters)}
                        variant="secondary"
                        className="w-full"
                    >
                        <Filter className="w-4 h-4 mr-2" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                 </div>

                 {match(fetchExpertQuery)
                    .with({ status: 'pending' }, () => <ExpertsGridSkeleton />)
                    .with({ status: 'error' }, ({ error }) => <div className="p-8 rounded-2xl text-red-500 text-center">Error: {error instanceof Error ? error.message : 'Unknown'}</div>)
                    .with({ status: 'success' }, () => {
                        const limitedExperts = filteredExperts.slice(0, 2)
                        return limitedExperts.length === 0 ? (
                            <div className="h-64 flex items-center justify-center rounded-2xl bg-white text-slate-500">
                                No experts found
                            </div>
                        ) : (
                            <ExpertsGrid experts={limitedExperts} />
                        )
                    })
                    .otherwise(() => null)}
            </div>

         </div>
      </div>
    </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <ExpertCardSkeleton key={index} />
      ))}
    </div>
  )
}

function ExpertCardSkeleton() {
  return (
    <div className="bg-[#FFFFF5] rounded-3xl border border-border shadow-sm p-6 animate-pulse">
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
  return Array.from(locations).map((location) => ({
      value: location,
      label: location,
    })).sort((a, b) => a.label.localeCompare(b.label))
}

function Marquee({ children, className, pauseOnHover, repeat }: { children: React.ReactNode; className?: string; pauseOnHover?: boolean; repeat?: number }) {
  return (
    <div className={cn("flex overflow-x-auto gap-2 no-scrollbar", className)} style={{ scrollbarWidth: 'none' }}>
      {children}
      {children} 
    </div>
  )
}

function Combobox({
    options,
    value,
    onValueChange,
    placeholder,
    className
}: {
    options: { value: string; label: string }[];
    value?: string | string[];
    onValueChange: (value: string | string[]) => void;
    placeholder?: string;
    className?: string;
    multiple?: boolean
}) {
    return (
        <div className={cn("relative", className)}>
            <select
                className="w-full h-full bg-background border border-input rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                value={Array.isArray(value) ? value[0] : value}
                onChange={(e) => onValueChange(e.target.value)}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <Filter className="w-4 h-4 opacity-50" />
            </div>
        </div>
    )
}

const CURRENCY_CONFIG: Record<string, { symbol: string }> = {
  INR: { symbol: '₹' },
  USD: { symbol: '$' },
  EUR: { symbol: '€' },
  GBP: { symbol: '£' },
}

const SERVICE_MODE_CONFIG: Record<string, { icon: any; label: string }> = {
  VIRTUAL: { icon: UserIcon, label: 'Virtual' },
  IN_PERSON: { icon: MapPin, label: 'In-Person' },
}

const specializationOptions = [
  'Anxiety', 'Depression', 'Stress', 'Relationships'
].map(s => ({ value: s, label: s }))

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