import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { honoClient } from '@/lib/hono-client'
import { ServiceForm } from './-components/service-form'

export const Route = createFileRoute('/_app/expert/services/$serviceId')({
  component: EditServicePage,
  loader: async ({ params }) => {
    const { serviceId } = params

    const response = await honoClient.server.service[':serviceId'].$get({ param: { serviceId } })

    if (!response.ok) {
      throw new Error('Failed to fetch service details')
    }

    const data = await response.json()

    return {
      service: data.service,
    }
  },
  pendingComponent: () => (
    <div className="flex h-screen w-full items-center justify-center gap-2">
      <Spinner />
      <div className="text-muted-foreground text-xs font-medium">Loading service details...</div>
    </div>
  ),
})

function EditServicePage() {
  const { serviceId } = Route.useParams()
  const { service } = Route.useLoaderData()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await honoClient.server.service[':serviceId'].$delete({
        param: { serviceId },
      })
      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        console.error('Delete service failed:', {
          status: response.status,
          statusText: response.statusText,
          error: error.error,
          serviceId,
        })
        throw new Error(error.error || 'Failed to delete service')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Service deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['services'] })
      navigate({ to: '/expert/services' })
    },
    onError: (error: Error) => {
      console.error('Delete mutation error:', error)
      toast.error('Failed to delete service', {
        description: error.message,
      })
    },
  })

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          to="/expert/services"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Services
        </Link>

        <Button
          variant="destructive"
          size="sm"
          icon={<Trash2 className="size-4" />}
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          Delete Service
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Edit Service</h1>
        <p className="text-muted-foreground mt-1">Update your service details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
          <CardDescription>Modify the details of your service offering</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm
            mode="edit"
            serviceId={serviceId}
            initialData={service}
            onSuccess={() => {
              navigate({ to: '/expert/services' })
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{service.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMutation.mutate()
                setIsDeleteDialogOpen(false)
              }}
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
