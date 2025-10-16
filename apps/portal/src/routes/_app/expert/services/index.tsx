import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { match } from 'ts-pattern'
import { Plus, MapPin, Clock, IndianRupee } from 'lucide-react'
import { toast } from 'sonner'
import type { Service } from '@pmc/server/src/generated/prisma/client'
import { nanoid } from 'nanoid'
import { honoClient } from '@/lib/hono-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/check-box'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
  price: z.number().min(500, 'Price must be above ₹500'),
  durationInMinutes: z.number().min(15, 'Duration must be at least 15 minutes'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  availableModes: z.array(z.enum(['IN_PERSON', 'VIRTUAL'])).min(1, 'Select at least one mode'),
  paymentMode: z.enum(['ONLINE', 'OFFLINE']),
})

type ServiceFormInput = z.infer<typeof serviceFormSchema>

function ExpertService() {
  // const navigate = useNavigate()
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
        <div className="min-h-screen bg-background p-4 md:p-8">
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
                  <Card
                    key={service.id}
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col"
                    // onClick={() => {
                    //   navigate({ to: '/expert/services/$serviceId', params: { serviceId: service.id } })
                    // }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start gap-3">
                        <CardTitle className="text-lg font-semibold flex-1 min-w-0">{service.name}</CardTitle>
                        <div className="flex gap-1 flex-shrink-0">
                          {service.availableModes.map((mode) => (
                            <Badge key={mode} variant="outline" className="text-xs">
                              {mode === 'IN_PERSON' ? 'In Person' : 'Virtual'}
                            </Badge>
                          ))}
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
                ))}
              </div>
            )}

            {isDialogOpen && (
              <ServiceDialog
                open={isDialogOpen}
                onOpenChange={() => {
                  setIsDialogOpen(false)
                }}
                service={null}
                mode="create"
              />
            )}
          </div>
        </div>
      )
    })
    .exhaustive()
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
      city: 'Gurgoan',
      country: 'India',
      availableModes: [],
      paymentMode: 'ONLINE',
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
          <form
            onSubmit={form.handleSubmit((data: ServiceFormInput) => {
              const dataWithUniqueSlug = {
                ...data,
                slug: `${data.slug}-${nanoid(4)}`,
              }

              if (mode === 'create') {
                createMutation.mutate(dataWithUniqueSlug)
              } else {
                updateMutation.mutate(data)
              }
            })}
            className="space-y-4"
          >
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
                      onChange={(e) => {
                        field.onChange(e.target.value)

                        const slug = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9\s]/g, '')
                          .trim()
                          .replace(/\s+/g, '-')

                        form.setValue('slug', slug)
                      }}
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
                      />
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
                  <FormLabel className="text-foreground">Service Location</FormLabel>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="availableModes"
                      render={({ field }) => (
                        <label className="flex items-center space-x-2 cursor-pointer">
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
                          <span className="text-sm font-medium text-foreground">In Person</span>
                        </label>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="availableModes"
                      render={({ field }) => (
                        <label className="flex items-center space-x-2 cursor-pointer">
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
                          <span className="text-sm font-medium text-foreground">Virtual</span>
                        </label>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Payment Mode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="OFFLINE">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary text-primary-foreground hover:opacity-90"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : mode === 'create'
                    ? 'Create Service'
                    : 'Update Service'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
