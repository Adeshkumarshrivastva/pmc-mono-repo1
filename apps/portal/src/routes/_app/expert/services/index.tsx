import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { honoClient } from '@/lib/hono-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/text-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/check-box'

export const Route = createFileRoute('/_app/expert/services/')({
  component: ExpertService,
})

const serviceFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  durationInMinutes: z.number().min(15, 'Duration must be at least 15 minutes'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  availableModes: z.array(z.enum(['IN_PERSON', 'VIRTUAL'])).min(1, 'Select at least one mode'),
})

type ServiceFormInput = z.infer<typeof serviceFormSchema>

interface Service extends ServiceFormInput {
  id: string
  isDeleted: boolean
}

function ExpertService() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [viewingService, setViewingService] = useState<Service | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await honoClient.server.service.$get()
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      return response.json()
    },
  })

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
    },
    onError: (error: Error) => {
      toast.error('Failed to delete service', {
        description: error.message,
      })
    },
  })

  const services = data?.services || []

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setIsDialogOpen(true)
  }

  const handleDelete = async (serviceId: string) => {
    if (confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      await deleteMutation.mutateAsync(serviceId)
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingService(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-foreground">Loading services...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-destructive">Error loading services. Please try again.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <Button
            onClick={() => setIsDialogOpen(true)}
            variant="outline"
            className="flex items-center gap-2 border-2 border-primary text-primary hover:bg-accent hover:text-accent-foreground font-medium"
            icon={<Plus className="size-4" />}
          >
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-card rounded-lg border-2 border-border p-6 hover:border-primary transition-colors shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-foreground">{service.name}</h2>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setViewingService(service)}
                      className="text-accent-foreground hover:bg-accent"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(service)}
                      className="text-primary hover:bg-accent"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(service.id)}
                      className="text-destructive hover:bg-accent"
                      title="Delete"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-primary font-bold text-lg mb-3">₹{service.price}</p>

                {service.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{service.description}</p>
                )}

                <div className="flex gap-2 flex-wrap mb-3">
                  {service.availableModes.map((mode) => (
                    <span
                      key={mode}
                      className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full font-medium"
                    >
                      {mode === 'IN_PERSON' ? 'In Person' : 'Virtual'}
                    </span>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Duration: {service.durationInMinutes} mins</p>
                  <p>
                    Location: {service.city}, {service.country}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {isDialogOpen && (
          <ServiceDialog
            open={isDialogOpen}
            onOpenChange={handleCloseDialog}
            service={editingService}
            mode={editingService ? 'edit' : 'create'}
          />
        )}

        {viewingService && <ViewServiceDialog service={viewingService} onClose={() => setViewingService(null)} />}
      </div>
    </div>
  )
}

function ServiceDialog({
  open,
  onOpenChange,
  service,
  mode,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
  mode: 'create' | 'edit'
}) {
  const queryClient = useQueryClient()

  const form = useForm<ServiceFormInput>({
    defaultValues: service || {
      name: '',
      slug: '',
      description: '',
      price: 0,
      durationInMinutes: 60,
      city: '',
      country: 'India',
      availableModes: [],
    },
    resolver: zodResolver(serviceFormSchema),
  })

  const createMutation = useMutation({
    mutationFn: async (data: ServiceFormInput) => {
      const response = await honoClient.server.service.$post({ json: data })
      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        throw new Error(error.error || 'Failed to create service')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Service created successfully')
      queryClient.invalidateQueries({ queryKey: ['services'] })
      form.reset()
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error('Failed to create service', {
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (data: ServiceFormInput) => {
      if (!service?.id) throw new Error('Service ID is required')
      const response = await honoClient.server.service[':serviceId'].$patch({
        param: { serviceId: service.id },
        json: data,
      })
      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        throw new Error(error.error || 'Failed to update service')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Service updated successfully')
      queryClient.invalidateQueries({ queryKey: ['services'] })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error('Failed to update service', {
        description: error.message,
      })
    },
  })

  const onSubmit = (data: ServiceFormInput) => {
    if (mode === 'create') {
      createMutation.mutate(data)
    } else {
      updateMutation.mutate(data)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {mode === 'create' ? 'Create New Service' : 'Edit Service'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'create' ? 'Add a new service to your profile' : 'Update the details of your service'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Service Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., One-on-One Consultation"
                      {...field}
                      className="bg-input border-border text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., one-on-one-consultation"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/\s+/g, '-')
                        field.onChange(value)
                      }}
                      className="bg-input border-border text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your service..."
                      rows={3}
                      {...field}
                      className="bg-input border-border text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Price (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-input border-border text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationInMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-input border-border text-foreground"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">City</FormLabel>
                    <FormControl>
                      <Input placeholder="Mumbai" {...field} className="bg-input border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Country</FormLabel>
                    <FormControl>
                      <Input placeholder="India" {...field} className="bg-input border-border text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="availableModes"
              render={() => (
                <FormItem>
                  <FormLabel className="text-foreground">Available Modes</FormLabel>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="availableModes"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes('IN_PERSON')}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              if (checked) {
                                field.onChange([...current, 'IN_PERSON'])
                              } else {
                                field.onChange(current.filter((m) => m !== 'IN_PERSON'))
                              }
                            }}
                          />
                          <label className="text-sm font-medium text-foreground">In Person</label>
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="availableModes"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value?.includes('VIRTUAL')}
                            onCheckedChange={(checked) => {
                              const current = field.value || []
                              if (checked) {
                                field.onChange([...current, 'VIRTUAL'])
                              } else {
                                field.onChange(current.filter((m) => m !== 'VIRTUAL'))
                              }
                            }}
                          />
                          <label className="text-sm font-medium text-foreground">Virtual</label>
                        </div>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                {isPending ? 'Saving...' : mode === 'create' ? 'Create Service' : 'Update Service'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function ViewServiceDialog({ service, onClose }: { service: Service; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{service.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Price</p>
            <p className="text-2xl font-bold text-primary">₹{service.price}</p>
          </div>

          {service.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-foreground">{service.description}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-1">Duration</p>
            <p className="text-foreground">{service.durationInMinutes} minutes</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Location</p>
            <p className="text-foreground">
              {service.city}, {service.country}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Available Modes</p>
            <div className="flex gap-2 mt-2">
              {service.availableModes.map((mode) => (
                <span
                  key={mode}
                  className="px-3 py-1 bg-accent text-accent-foreground text-sm rounded-full font-medium"
                >
                  {mode === 'IN_PERSON' ? 'In Person' : 'Virtual'}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Slug</p>
            <p className="text-foreground font-mono text-sm">{service.slug}</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline" className="border-border">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
