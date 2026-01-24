import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Star, ArrowLeft, UserIcon, Award, User, BookOpenIcon, ClockIcon } from 'lucide-react'
import type { ExpertType } from '@pmc/server/src/generated/prisma/client'
import { match } from 'ts-pattern'
import { Button } from '@/components/ui/button'
import { honoClient } from '@/lib/hono-client'
import { cn, getFileUrl } from '@/lib/utils'
import { CURRENCY_CONFIG, DAY_MAP } from '@/lib/booking'
import Navbar from '../-components/navbar'
import { Marquee } from '@/components/ui/marquee'
import { ServiceCard } from './-components/service-card'

export const Route = createFileRoute('/_public/experts/$expertSlug/')({
  component: ExpertPage,
})

function ExpertPage() {
  const { expertSlug } = Route.useParams()
  const navigate = useNavigate()

  const getExpertQuery = useQuery({
    queryKey: ['expert', expertSlug],
    queryFn: () => fetchExpertDetails(expertSlug),
  })

  return match(getExpertQuery)
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

    .with({ status: 'success' }, ({ data }) => {
      const {
        servicesProvided,
        name,
        type,
        city,
        country,
        bio,
        qualifications,
        avgRating,
        image,
        expertise,
        gender,
        experienceInYears,
        file,
        availability,
      } = data.expert

      const prices =
        servicesProvided.map((service) => service.price).filter((price): price is number => price != null) || []

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0

      return (
        <>
          <Navbar services={[]} />
          <div className="min-h-screen bg-accent">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full opacity-50"></div>
              <div className="absolute top-1/2 -left-40 w-60 h-60 bg-accent-foreground/20 rounded-full opacity-50"></div>
              <div className="absolute bottom-70 right-1/4 w-40 h-40 bg-primary/30 rounded-full opacity-40"></div>
            </div>

            <div className="container mx-auto px-4 py-6 relative">
              <Link
                to="/experts"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium text-sm"
              >
                <span className="flex items-center gap-1">
                  <ArrowLeft className="size-4" /> Back to Experts
                </span>
              </Link>

              <div className="relative overflow-hidden shadow-lg rounded-2xl mb-8 ">
                <div className="absolute inset-0 bg-accent/40 "></div>

                <div className="relative bg-card/90 backdrop-blur-sm rounded-2xl border border-border  p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    <div className="relative flex-shrink-0">
                      {image || file ? (
                        <div className="relative flex-shrink-0">
                          <div className="w-36 h-48">
                            <img
                              src={file ? getFileUrl(file.fileName) : image!}
                              alt={name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          </div>
                        </div>
                      ) : (
                        <UserIcon className="size-6 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="mb-4 ">
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 ">{name}</h1>
                        <div className="flex items-center gap-2">
                          <p className="text-lg text-primary font-semibold">{EXPERT_TYPE_CONFIG[type]?.label}</p>
                          {isExpertOnline(availability) && (
                            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                              <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                              <span className="text-xs font-medium text-primary">Online</span>
                            </div>
                          )}
                        </div>
                        {avgRating && avgRating > 0 ? (
                          <div className="flex items-center gap-2 mt-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    'w-4 h-4',
                                    i < Math.floor(avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300',
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-sm font-semibold text-foreground ml-1">{avgRating.toFixed(1)}</span>
                          </div>
                        ) : null}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                          {experienceInYears ? (
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <ClockIcon className="size-3" />
                                <span className="text-sm">Experience</span>
                              </div>
                              <p className="text-sm font-semibold text-primary">{experienceInYears} years</p>
                            </div>
                          ) : null}

                          {gender && (
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <User className="size-3" />
                                <span className="text-sm">Gender</span>
                              </div>
                              <p className="text-sm font-semibold text-foreground capitalize">{gender.toLowerCase()}</p>
                            </div>
                          )}

                          {minPrice > 0 ? (
                            <div>
                              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                <span className="text-sm">Starting at</span>
                              </div>
                              <p className="text-sm font-semibold text-primary">
                                {`${CURRENCY_CONFIG['INR'].symbol} ${minPrice}`}
                              </p>
                            </div>
                          ) : null}

                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground mb-1">
                              <MapPin className="size-3" />
                              <span className="text-sm">Location</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">
                              {city}, {country}
                            </p>
                          </div>
                        </div>
                        {expertise && Array.isArray(expertise) && expertise.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-1 text-muted-foreground mb-2">
                              <Award className="w-4 h-4" />
                              <h3 className="text-sm">Areas of Expertise</h3>
                            </div>
                            <div className="group/marquee">
                              <Marquee pauseOnHover className="[--duration:30s] [--gap:0.5rem]" repeat={2}>
                                {expertise.map((area, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap"
                                  >
                                    {area}
                                  </span>
                                ))}
                              </Marquee>
                            </div>
                          </div>
                        )}
                        {qualifications ? (
                          <div className="mb-4">
                            <h3 className="text-sm text-muted-foreground">Qualifications</h3>
                            <p className="text-sm">
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
                    </div>
                  </div>
                </div>
              </div>

              {bio ? (
                <div className="bg-card/80 rounded-2xl border border-border shadow-lg p-6 mb-6">
                  <h2 className="text-lg flex font-bold text-foreground mb-3">
                    <BookOpenIcon className="size-5 text-primary mt-1 mr-1 " />
                    About
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm">{bio}</p>
                </div>
              ) : null}

              <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Services</h2>

                {servicesProvided && servicesProvided.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {servicesProvided.map((service, index) => (
                      <ServiceCard
                        key={service.id || index}
                        service={service}
                        onBook={() => {
                          navigate({
                            to: '/experts/$expertSlug/$serviceSlug',
                            params: {
                              expertSlug: expertSlug,
                              serviceSlug: service.slug,
                            },
                          })
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No services available.</p>
                  </div>
                )}

                {servicesProvided && servicesProvided.length > 0 && servicesProvided.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No services available for the selected mode.</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )
    })
    .otherwise(() => null)
}

function isExpertOnline(
  availability?: {
    dayOfTheWeek: string
    endTime: string
    isActive: boolean
  }[],
): boolean {
  if (!availability || availability.length === 0) {
    return false
  }

  const currentDayOfWeek = DAY_MAP[new Date().getDay()]

  const currentMinutes = new Date().getUTCHours() * 60 + new Date().getUTCMinutes()
  return availability.some((slot) => {
    if (!slot.isActive) {
      return false
    }
    if (slot.dayOfTheWeek !== currentDayOfWeek) {
      return false
    }

    const endTime = new Date(slot.endTime)
    const endMinutes = endTime.getUTCHours() * 60 + endTime.getUTCMinutes()

    return endMinutes > currentMinutes
  })
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

async function fetchExpertDetails(expertId: string) {
  const response = await honoClient.server.experts[':expertSlug'].$get({
    param: { expertSlug: expertId },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch expert details')
  }
  return response.json()
}

const EXPERT_TYPE_CONFIG: Record<ExpertType, { label: string; value: ExpertType }> = {
  PSYCHOLOGIST: {
    label: 'Counseling Psychologist',
    value: 'PSYCHOLOGIST',
  },
  PSYCHIATRIST: {
    label: 'Psychiatrist',
    value: 'PSYCHIATRIST',
  },
  CLINICAL_PSYCHOLOGIST: {
    label: 'Clinical Psychologist',
    value: 'CLINICAL_PSYCHOLOGIST',
  },
  CONSULTANT_PHYSICIAN: {
    label: '',
    value: 'PSYCHOLOGIST',
  },
  REHABILITATION_PSYCHOLOGIST: {
    label: '',
    value: 'PSYCHOLOGIST',
  },
  COUNSELLING_PSYCHOLOGIST: {
    label: '',
    value: 'PSYCHOLOGIST',
  },
}
