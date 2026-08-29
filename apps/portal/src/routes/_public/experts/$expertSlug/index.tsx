import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  MapPin,
  Star,
  ArrowLeft,
  UserIcon,
  Award,
  User,
  BookOpenIcon,
  ClockIcon,
  CheckCircle2,
  ListChecks,
  ChevronDown,
  BadgeCheck,
  GraduationCap,
  ClipboardList,
} from 'lucide-react'
import { match } from 'ts-pattern'
import { Button } from '@/components/ui/button'
import { honoClient } from '@/lib/hono-client'
import { cn, getFileUrl } from '@/lib/utils'
import { CURRENCY_CONFIG } from '@/lib/booking'
import Navbar from '../-components/navbar'
import { Marquee } from '@/components/ui/marquee'
import { ServiceCard } from './-components/service-card'
import { isExpertOnline, EXPERT_TYPES_CONFIG } from '@/lib/expert'

export const Route = createFileRoute('/_public/experts/$expertSlug/')({
  component: ExpertPage,
})

// Some entries were saved as a single blob with "•" separators instead of
// one array item per point, so split those apart before rendering as a list.
function splitIntoPoints(points: string[]) {
  return points
    .flatMap((point) => point.split('•'))
    .map((point) => point.trim())
    .filter(Boolean)
}

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
        professionalSnapshot,
        education,
        professionalRegistration,
        whyChooseUs,
        whatToExpect,
        faqs,
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
                          <p className="text-lg text-primary font-semibold">{EXPERT_TYPES_CONFIG[type]?.label}</p>
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
                        {professionalRegistration ? (
                          <div className="mb-4 flex items-start gap-1.5">
                            <BadgeCheck className="size-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground">{professionalRegistration}</p>
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

              {professionalSnapshot && professionalSnapshot.length > 0 ? (
                <div className="bg-card/80 rounded-2xl border border-border shadow-lg p-6 mb-6">
                  <h2 className="text-lg flex font-bold text-foreground mb-3">
                    <ClipboardList className="size-5 text-primary mt-1 mr-1" />
                    Professional Snapshot
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {splitIntoPoints(professionalSnapshot).map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
                        <CheckCircle2 className="size-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {education && education.length > 0 ? (
                <div className="bg-card/80 rounded-2xl border border-border shadow-lg p-6 mb-6">
                  <h2 className="text-lg flex font-bold text-foreground mb-3">
                    <GraduationCap className="size-5 text-primary mt-1 mr-1" />
                    Educational Qualifications
                  </h2>
                  <ul className="space-y-3">
                    {education.map((edu, index) => (
                      <li key={index}>
                        <p className="text-sm font-medium text-foreground">{edu.degree}</p>
                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {whyChooseUs && whyChooseUs.length > 0 ? (
                <div className="bg-card/80 rounded-2xl border border-border shadow-lg p-6 mb-6">
                  <h2 className="text-lg flex font-bold text-foreground mb-3">
                    <CheckCircle2 className="size-5 text-primary mt-1 mr-1" />
                    Why Choose {name}?
                  </h2>
                  <ul className="space-y-2">
                    {splitIntoPoints(whyChooseUs).map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
                        <CheckCircle2 className="size-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {whatToExpect && whatToExpect.length > 0 ? (
                <div className="bg-card/80 rounded-2xl border border-border shadow-lg p-6 mb-6">
                  <h2 className="text-lg flex font-bold text-foreground mb-3">
                    <ListChecks className="size-5 text-primary mt-1 mr-1" />
                    What to Expect During Your First Consultation
                  </h2>
                  <ol className="space-y-2">
                    {splitIntoPoints(whatToExpect).map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-muted-foreground text-sm">
                        <span className="flex-shrink-0 size-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {faqs && faqs.length > 0 ? <FaqSection faqs={faqs} /> : null}

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

function FaqSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="bg-card/80 rounded-2xl border border-border shadow-lg p-6 mb-6">
      <h2 className="text-lg font-bold text-foreground mb-3">Frequently Asked Questions</h2>
      <div className="divide-y divide-border">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <div key={index} className="py-3">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-2 text-left"
              >
                <span className="text-sm font-medium text-foreground">{faq.question}</span>
                <ChevronDown
                  className={cn('size-4 text-muted-foreground flex-shrink-0 transition-transform', isOpen ? 'rotate-180' : '')}
                />
              </button>
              {isOpen ? <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p> : null}
            </div>
          )
        })}
      </div>
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

async function fetchExpertDetails(expertId: string) {
  const response = await honoClient.server.experts[':expertSlug'].$get({
    param: { expertSlug: expertId },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch expert details')
  }
  return response.json()
}
