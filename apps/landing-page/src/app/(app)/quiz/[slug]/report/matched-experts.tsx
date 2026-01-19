'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Calendar, MapPin, UserIcon, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Marquee } from '@/components/ui/marquee'
import { getFileUrl, fetchPublicExperts, type Expert } from '@/lib/experts'
import { OouiArrowPreviousLtr, OouiArrowPreviousRtl } from '@/components/ui/icons'

const CURRENCY_CONFIG: Record<string, { symbol: string }> = {
  INR: { symbol: '₹' },
  USD: { symbol: '$' },
  EUR: { symbol: '€' },
  GBP: { symbol: '£' },
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

function ExpertGrid({ expert }: { expert: Expert }) {
  const { servicesProvided, name, slug, availability, expertise, experienceInYears } = expert
  const [selectedMode] = useState<string | 'ALL'>('ALL')
  const [showAllServices, setShowAllServices] = useState(false)
  const router = useRouter()

  const services = (servicesProvided as any[]) || []

  const filteredServices =
    selectedMode === 'ALL' ? services : services.filter((service) => service.availableModes?.includes(selectedMode))

  const nextSlot = getNextAvailableSlot(availability as any)

  return (
    <div className="bg-white rounded-3xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group text-left">
      <div className="p-6 pb-4 text-slate-900">
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

function ExpertsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-[#FFFFF5] rounded-3xl border border-border shadow-sm p-6 animate-pulse">
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
      ))}
    </div>
  )
}

export default function MatchedExperts({ quizTitle }: { quizTitle: string }) {
  const router = useRouter()
  const [startIdx, setStartIdx] = useState(0)
  const cardsPerPage = 2

  const expertsQuery = useQuery({
    queryKey: ['experts'],
    queryFn: () => fetchPublicExperts(),
  })

  const matchedExperts = (expertsQuery.data || []).filter((expert) => {
    const expertise = expert.expertise
    if (!expertise) return false

    const titleLower = quizTitle.toLowerCase()

    if (Array.isArray(expertise)) {
      return expertise.some((e) => e.toLowerCase().includes(titleLower))
    }

    if (typeof expertise === 'string') {
      return (expertise as string).toLowerCase().includes(titleLower)
    }

    return false
  })

  const handlePrev = () => setStartIdx((prev) => Math.max(prev - cardsPerPage, 0))
  const handleNext = () =>
    setStartIdx((prev) => Math.min(prev + cardsPerPage, Math.max(matchedExperts.length - cardsPerPage, 0)))

  const visibleExperts = matchedExperts.slice(startIdx, startIdx + cardsPerPage)

  if (expertsQuery.isLoading) {
    return <ExpertsGridSkeleton />
  }

  if (matchedExperts.length === 0) {
    return null
  }

  return (
    <>
    {matchedExperts ? (
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Our recommended experts...</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visibleExperts.map((expert) => (
              <ExpertGrid key={expert.id} expert={expert} />
            ))}
          </div>

          {matchedExperts.length > cardsPerPage && (
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
                disabled={startIdx + cardsPerPage >= matchedExperts.length}
              />
            </div>
          )}
        </div>

        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={() => {
              router.push(`/portal/experts/`)
            }}
            className="min-w-[200px] text-lg bg-white hover:bg-card-accent text-muted-foreground mb-6"
          >
            Show All
          </Button>
        </div>
      </div>
    ) : null}
    </>
  )
}
