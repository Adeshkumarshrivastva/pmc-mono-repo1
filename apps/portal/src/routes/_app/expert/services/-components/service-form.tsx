import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { InferResponseType } from 'hono'
import { generateServiceSlug, IN_PERSON_LOCATIONS, inPersonLocationSchema } from '@/lib/service'
import { honoClient, type HonoClient } from '@/lib/hono-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/check-box'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SERVICE_MODE_CONFIG } from '@/lib/service'

const serviceFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  durationInMinutes: z.string().min(1, 'Duration is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  availableModes: z.array(z.enum(['IN_PERSON', 'VIRTUAL'])).min(1, 'Select at least one mode'),
  paymentMode: z.enum(['ONLINE', 'OFFLINE']),
  inPersonLocation: inPersonLocationSchema,
})

type ServiceFormInput = z.infer<typeof serviceFormSchema>

type ServiceFormProps = {
  mode: 'create' | 'edit'
  serviceId?: string
  initialData?: InferResponseType<HonoClient['server']['service'][':serviceId']['$get'], 200>['service']
  onSuccess?: () => void
}

export function ServiceForm({ mode, serviceId, initialData, onSuccess }: ServiceFormProps) {
  const queryClient = useQueryClient()

  const form = useForm<ServiceFormInput>({
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price ? String(initialData.price) : '',
      durationInMinutes: initialData?.durationInMinutes ? String(initialData.durationInMinutes) : '60',
      city: initialData?.city || 'Gurgoan',
      country: initialData?.country || 'India',
      availableModes: initialData?.availableModes || [],
      paymentMode: initialData?.paymentMode || 'ONLINE',
      inPersonLocation: initialData?.inPersonLocation
        ? inPersonLocationSchema.parse(initialData.inPersonLocation)
        : IN_PERSON_LOCATIONS[0],
    },
    resolver: zodResolver(serviceFormSchema),
  })

  const createMutation = useMutation({
    mutationFn: async (
      data: Omit<ServiceFormInput, 'price' | 'durationInMinutes'> & {
        slug: string
        price: number
        durationInMinutes: number
      },
    ) => {
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
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to create service', {
        description: error.message,
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (
      data: Omit<ServiceFormInput, 'price' | 'durationInMinutes'> & {
        price: number
        durationInMinutes: number
      },
    ) => {
      if (!serviceId) {
        throw new Error('Service ID is required for update')
      }
      const response = await honoClient.server.service[':serviceId'].$patch({
        param: { serviceId },
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
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to update service', {
        description: error.message,
      })
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data: ServiceFormInput) => {
          const price = Number(data.price)
          const durationInMinutes = Number(data.durationInMinutes)

          if (price < 500) {
            form.setError('price', { message: 'Price must be above ₹500' })
            return
          }
          if (durationInMinutes < 15) {
            form.setError('durationInMinutes', { message: 'Duration must be at least 15 minutes' })
            return
          }

          if (mode === 'create') {
            const dataWithSlug = {
              ...data,
              price,
              durationInMinutes,
              slug: generateServiceSlug(data.name),
            }
            createMutation.mutate(dataWithSlug)
          } else {
            const updateData = {
              ...data,
              price,
              durationInMinutes,
            }
            updateMutation.mutate(updateData)
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
                <Input placeholder="e.g., One-on-One Consultation" {...field} />
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
                  <Input type="number" placeholder="1000" {...field} />
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
                  <Input type="number" placeholder="60" {...field} />
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
                  <Input placeholder="e.g., Gurugram" {...field} />
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
                  <Input placeholder="e.g., India" {...field} />
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
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="availableModes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Service Location</FormLabel>
                      <div className="space-y-2">
                        {Object.values(SERVICE_MODE_CONFIG).map((mode) => (
                          <label key={mode.value} className="flex items-center space-x-2 cursor-pointer">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(mode.value)}
                                onCheckedChange={(checked: unknown) => {
                                  const current = field.value || []
                                  field.onChange(
                                    checked ? [...current, mode.value] : current.filter((m) => m !== mode.value),
                                  )
                                }}
                              />
                            </FormControl>
                            <span className="text-sm font-medium text-foreground">{mode.label}</span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
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

        <FormField
          control={form.control}
          name="inPersonLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">In-Person Location</FormLabel>
              <Select
                onValueChange={(value) => {
                  const location = IN_PERSON_LOCATIONS.find((loc) => loc.address === value)
                  field.onChange(location || null)
                }}
                value={field.value?.address || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select in-person location" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {IN_PERSON_LOCATIONS.map((location) => (
                    <SelectItem key={location.address} value={location.address}>
                      {location.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-primary text-primary-foreground hover:opacity-90"
            loading={createMutation.isPending || updateMutation.isPending}
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
  )
}
