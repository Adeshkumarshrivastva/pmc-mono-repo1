import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, MapPin, Clock, IndianRupee, Plus, Edit } from 'lucide-react'
import { match } from 'ts-pattern'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { honoClient } from '@/lib/hono-client'
import Navbar from '../-components/navbar'
// import ServiceDialog from '@/components/ServiceDialog'

export const Route = createFileRoute('/_public/experts/services/$expertService')({
  component: Services,
})

function Services() {
  const navigate = useNavigate()
  const { service: serviceParam } = Route.useParams()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)

  const servicesQuery = useQuery({
    queryKey: ['services', serviceParam],
    queryFn: () => fetchServices(serviceParam),
  })

  const handleCreateClick = () => {
    setEditingService(null)
    setDialogOpen(true)
  }

  const handleEditClick = (service: any) => {
    setEditingService(service)
    setDialogOpen(true)
  }

  return (
    <>
      <Navbar services={[]} />
      <div className="min-h-screen bg-accent">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full opacity-50"></div>
          <div className="absolute top-1/2 -left-40 w-60 h-60 bg-accent-foreground/20 rounded-full opacity-50"></div>
          <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-primary/30 rounded-full opacity-40"></div>
        </div>

        <div className="container mx-auto px-4 py-6 relative z-10">
          {/* Back Link */}
          <Link
            to="/experts"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="size-4" /> Back to Experts
          </Link>

          {/* Header with Action Buttons */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Browse Services</h1>
              <p className="text-muted-foreground">Find the perfect service for your needs</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateClick} className="gap-2">
                <Plus className="size-4" />
                Create Service
              </Button>
            </div>
          </div>

          {/* Services List */}
          {match(servicesQuery)
            .with({ status: 'pending' }, () => <ServicesListSkeleton />)
            .with({ status: 'error' }, ({ error }: { error: Error }) => (
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-destructive/20 p-6 text-center">
                <p className="text-destructive mb-4">Error loading services: {error.message}</p>
                <Button onClick={() => servicesQuery.refetch()} variant="destructive">
                  Try Again
                </Button>
              </div>
            ))
            .with({ status: 'success' }, ({ data }) => {
              const { services } = data

              if (!services || services.length === 0) {
                return (
                  <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-12 text-center">
                    <p className="text-muted-foreground mb-4">No services available at the moment.</p>
                    <Button onClick={handleCreateClick} className="gap-2">
                      <Plus className="size-4" />
                      Create Your First Service
                    </Button>
                  </div>
                )
              }

              return (
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-sm text-muted-foreground">
                      Showing {services.length} {services.length === 1 ? 'service' : 'services'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <ServiceCard key={service.id} service={service} navigate={navigate} onEdit={handleEditClick} />
                    ))}
                  </div>
                </div>
              )
            })
            .otherwise(() => null)}
        </div>
      </div>

      {/* <ServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editingService}
        mode={editingService ? 'edit' : 'create'}
      /> */}
    </>
  )
}

function ServiceCard({ service, navigate, onEdit }: { service: any; navigate: any; onEdit: (service: any) => void }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{service.name}</h3>
          <div className="flex items-center gap-1 text-primary font-bold">
            <IndianRupee className="size-4" />
            <span>{service.price}</span>
          </div>
        </div>
        <Link
          to="/experts/$expertSlug"
          params={{ expertSlug: service.expert.slug }}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          by {service.expert.name}
        </Link>
      </CardHeader>

      <CardContent>
        {service.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{service.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">{service.durationInMinutes} mins</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {service.city}, {service.country}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          {service.availableModes.map((mode: string) => (
            <Badge key={mode} variant="secondary" className="text-xs">
              {mode === 'IN_PERSON' ? 'In Person' : 'Virtual'}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => onEdit(service)}>
          <Edit className="size-4" />
          Edit
        </Button>
        <Button
          className="flex-1"
          size="sm"
          onClick={() => {
            navigate({
              to: '/experts/$expertSlug/$serviceSlug',
              params: {
                expertSlug: service.expert.slug,
                serviceSlug: service.slug,
              },
            })
          }}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  )
}

function ServicesListSkeleton() {
  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-muted rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-muted rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

interface Service {
  id: string
  name: string
  slug: string
  price: number
  description?: string
  durationInMinutes: number
  city: string
  country: string
  availableModes: string[]
  expert: {
    name: string
    slug: string
  }
}

async function fetchServices(serviceParam?: string): Promise<{ services: Service[] }> {
  const response = await honoClient.server.services.$get({
    query: serviceParam ? { expertSlug: serviceParam } : {},
  })

  if (!response.ok) {
    throw new Error('Failed to fetch services')
  }

  const data = await response.json()
  const servicesWithExperts = data.services.map((service: any) => ({
    ...service,
    expert: {
      name: service.expertName,
      slug: service.expertSlug,
    },
  }))
  return { services: servicesWithExperts }
}
