import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MapPin, Clock, IndianRupee, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { honoClient } from '@/lib/hono-client'

interface ServiceCardProps {
  service: {
    id: string
    name: string
    price: number
    durationInMinutes: number
    city: string
    country: string
    availableModes: ('IN_PERSON' | 'VIRTUAL')[]
  }
}

export function ServiceCard({ service }: ServiceCardProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await honoClient.server.service[':serviceId'].$delete({
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
      queryClient.invalidateQueries({ queryKey: ['services'] })
      setShowDeleteDialog(false)
    },
    onError: (error: Error) => {
      toast.error('Failed to delete service', {
        description: error.message,
      })
    },
  })

  return (
    <>
      <Card key={service.id} className="hover:shadow-lg transition-all duration-200 h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start gap-3">
            <CardTitle className="text-lg font-semibold flex-1 min-w-0">{service.name}</CardTitle>
            <div className="flex gap-2 flex-shrink-0 items-center">
              <div className="flex gap-1">
                {service.availableModes.map((mode) => (
                  <Badge key={mode} variant="outline" className="text-xs">
                    {mode === 'IN_PERSON' ? 'In Person' : 'Virtual'}
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  navigate({ to: '/expert/services/$serviceId', params: { serviceId: service.id } })
                }}
                className="h-8 w-8 hover:bg-accent"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <IndianRupee className="size-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground font-bold">₹{service.price}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="size-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground font-bold">{service.durationInMinutes} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="size-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground font-bold">
              {service.city}, {service.country}
            </span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{service.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate(service.id)}
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
