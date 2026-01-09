import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Plus, Edit, Trash2, CreditCard, Banknote } from 'lucide-react'
import { toast } from 'sonner'
import { match } from 'ts-pattern'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { honoClient } from '@/lib/hono-client'
import { queryClient } from '@/lib/query-client'
import { ServiceDialog } from './service-dialog'
import type { inPersonLocationSchema } from '@/lib/service'

interface ExpertServicesSectionProps {
  expertId: string
}

type Service = {
  id: string
  name: string
  slug: string
  price: number
  currency: string
  durationInMinutes: number
  availableModes: ('IN_PERSON' | 'VIRTUAL')[]
  city: string
  country: string
  description: string
  paymentMode: 'ONLINE' | 'OFFLINE'
  inPersonLocation: z.infer<typeof inPersonLocationSchema>
}

export function ExpertServicesSection({ expertId }: ExpertServicesSectionProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<{ id: string; name: string } | null>(null)

  const servicesQuery = useQuery({
    queryKey: ['admin-expert-services', expertId],
    queryFn: async () => {
      const response = await honoClient.server.admin.experts[':expertId'].services.$get({
        param: { expertId },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      const data = (await response.json()) as { services: Service[] }
      return data.services
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await honoClient.server.admin.services[':serviceId'].$delete({
        param: { serviceId },
      })

      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        throw new Error(error.error || 'Failed to delete service')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Service deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-expert-services', expertId] })
      setDeleteDialogOpen(false)
      setServiceToDelete(null)
    },
    onError: (error: Error) => {
      toast.error('Failed to delete service', {
        description: error.message,
      })
    },
  })

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete({ id: service.id, name: service.name })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (serviceToDelete) {
      deleteMutation.mutate(serviceToDelete.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Services</h3>
          <p className="text-sm text-muted-foreground">Manage services provided by this expert</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} icon={<Plus className="h-4 w-4" />}>
          Add Service
        </Button>
      </div>

      {match(servicesQuery)
        .with({ status: 'pending' }, () => (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading services...</div>
          </div>
        ))
        .with({ status: 'error' }, () => (
          <div className="flex items-center justify-center py-12">
            <div className="text-destructive">Error loading services. Please try again.</div>
          </div>
        ))
        .with({ status: 'success' }, ({ data }) => {
          if (data.length === 0) {
            return (
              <div className="bg-card rounded-lg border-2 border-border p-12 text-center shadow-sm">
                <p className="text-muted-foreground text-lg mb-4">No services yet</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>Create first service</Button>
              </div>
            )
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.map((service) => (
                <div key={service.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{service.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {service.city}, {service.country}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Edit className="h-4 w-4" />}
                        onClick={() => setEditingService(service)}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => handleDeleteClick(service)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">
                      {service.currency === 'INR' ? '₹' : service.currency} {service.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">• {service.durationInMinutes} min</span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {service.availableModes.map((mode) => (
                      <Badge key={mode} variant="secondary">
                        {mode === 'IN_PERSON' ? 'In Person' : 'Virtual'}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="flex items-center gap-1">
                      {service.paymentMode === 'ONLINE' ? (
                        <CreditCard className="h-3 w-3" />
                      ) : (
                        <Banknote className="h-3 w-3" />
                      )}
                      {service.paymentMode}
                    </Badge>
                  </div>

                  {service.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                  )}
                </div>
              ))}
            </div>
          )
        })
        .exhaustive()}

      <ServiceDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} expertId={expertId} mode="create" />

      {editingService && (
        <ServiceDialog
          open={!!editingService}
          onOpenChange={(open) => !open && setEditingService(null)}
          expertId={expertId}
          mode="edit"
          serviceData={editingService}
        />
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{serviceToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
