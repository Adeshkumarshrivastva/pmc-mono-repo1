import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { match } from 'ts-pattern'
import { Plus } from 'lucide-react'
import { honoClient } from '@/lib/hono-client'
import { Button } from '@/components/ui/button'

import { ServiceDialog } from './-components/service-dialog'
import { ServiceCard } from './-components/service-card'

export const Route = createFileRoute('/_app/expert/services/')({
  component: ExpertService,
})

function ExpertService() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const serviceQuery = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await honoClient.server.service.$get()
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      return response.json()
    },
  })

  return match(serviceQuery)
    .with({ status: 'pending' }, () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-foreground">Loading services...</div>
      </div>
    ))
    .with({ status: 'error' }, () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-destructive">Error loading services. Please try again.</div>
      </div>
    ))
    .with({ status: 'success' }, ({ data }) => {
      const services = data?.services || []

      return (
        <div className="min-h-screen bg-background ">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-foreground">Services</h1>
              <Button onClick={() => setIsDialogOpen(true)} variant="default" icon={<Plus className="size-4" />}>
                Add New
              </Button>
            </div>

            {services.length === 0 ? (
              <div className="bg-card rounded-lg border-2 border-border p-12 text-center shadow-sm">
                <p className="text-muted-foreground text-lg mb-4">No services yet</p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-primary text-primary-foreground hover:opacity-90"
                >
                  Create your first service
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}

            <ServiceDialog
              open={isDialogOpen}
              onOpenChange={() => {
                setIsDialogOpen(false)
              }}
              service={null}
              mode="create"
            />
          </div>
        </div>
      )
    })
    .exhaustive()
}
