import { useMutation } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { TrashIcon, CirclePlusIcon } from 'lucide-react'
import { honoClient } from '@/lib/hono-client'
import { queryClient } from '@/lib/query-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/check-box'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { IN_PERSON_LOCATIONS, inPersonLocationSchema, SERVICE_MODE_CONFIG } from '@/lib/service'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { generateServiceSlug } from '@/lib/service'
import { TIME_OPTIONS } from '@/lib/booking'
import { localMinutesToUtcMinutes, utcMinutesToLocalMinutes } from '@/lib/date'
import dayjs from '@/lib/dayjs'

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
  additionalCharges: z
    .array(
      z
        .object({
          startMinutes: z.number(),
          endMinutes: z.number(),
          price: z.string().min(1, 'Price is required'),
          description: z.string().min(1, 'Charge description is required'),
        })
        .refine((data) => data.endMinutes > data.startMinutes, {
          message: 'End minutes must be after start minutes',
          path: ['endMinutes'],
        }),
    )
    .optional(),
})

type ServiceFormInput = z.infer<typeof serviceFormSchema>

type ServiceDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  expertId: string
  mode: 'create' | 'edit'
  serviceData?: {
    id: string
    name: string
    description?: string
    price: number
    durationInMinutes: number
    city: string
    country: string
    availableModes: ('IN_PERSON' | 'VIRTUAL')[]
    paymentMode: 'ONLINE' | 'OFFLINE'
    inPersonLocation: z.infer<typeof inPersonLocationSchema>
    additionalCharges?: { startTime: Date; endTime: Date; price: number; description: string }[]
  }
}

export function ServiceDialog({ open, onOpenChange, expertId, mode, serviceData }: ServiceDialogProps) {
  const form = useForm<ServiceFormInput>({
    defaultValues: {
      name: serviceData?.name || '',
      description: serviceData?.description || '',
      price: serviceData?.price ? String(serviceData.price) : '',
      durationInMinutes: serviceData?.durationInMinutes ? String(serviceData.durationInMinutes) : '60',
      city: serviceData?.city || 'Gurgoan',
      country: serviceData?.country || 'India',
      availableModes: serviceData?.availableModes || [],
      paymentMode: serviceData?.paymentMode || 'ONLINE',
      inPersonLocation: serviceData?.inPersonLocation || IN_PERSON_LOCATIONS[0],
      additionalCharges:
        serviceData?.additionalCharges?.map((ac) => ({
          startMinutes: dayjs(ac.startTime).utc().hour() * 60 + dayjs(ac.startTime).utc().minute(),
          endMinutes: dayjs(ac.endTime).utc().hour() * 60 + dayjs(ac.endTime).utc().minute(),
          price: String(ac.price),
          description: ac.description,
        })) || [],
    },
    resolver: zodResolver(serviceFormSchema),
  })

  const createMutation = useMutation({
    mutationFn: async (
      data: Omit<ServiceFormInput, 'price' | 'durationInMinutes' | 'additionalCharges'> & {
        slug: string
        price: number
        durationInMinutes: number
        additionalCharges?: { startTime: Date; endTime: Date; price: number; description: string }[]
      },
    ) => {
      const response = await honoClient.server.admin.experts[':expertId'].services.$post({
        param: { expertId },
        json: data,
      })
      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        throw new Error(error.error || 'Failed to create service')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Service created successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-expert-services', expertId] })
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
    mutationFn: async (
      data: Omit<ServiceFormInput, 'price' | 'durationInMinutes' | 'additionalCharges'> & {
        price: number
        durationInMinutes: number
        additionalCharges?: { startTime: Date; endTime: Date; price: number; description: string }[]
      },
    ) => {
      if (!serviceData?.id) {
        throw new Error('Service ID is required for update')
      }
      const response = await honoClient.server.admin.services[':serviceId'].$patch({
        param: { serviceId: serviceData.id },
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
      queryClient.invalidateQueries({ queryKey: ['admin-expert-services', expertId] })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error('Failed to update service', {
        description: error.message,
      })
    },
  })

  const handleSubmit = (data: ServiceFormInput) => {
    const price = Number(data.price)
    const durationInMinutes = Number(data.durationInMinutes)

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
        additionalCharges: data.additionalCharges?.map((ac) => {
          const startTime = dayjs.utc('2025-01-01').startOf('day').add(ac.startMinutes, 'minute').toDate()
          const endTime = dayjs.utc('2025-01-01').startOf('day').add(ac.endMinutes, 'minute').toDate()
          return {
            startTime,
            endTime,
            price: Number(ac.price),
            description: ac.description,
          }
        }),
      }
      createMutation.mutate(dataWithSlug)
    } else {
      const updateData = {
        ...data,
        price,
        durationInMinutes,
        additionalCharges: data.additionalCharges?.map((ac) => {
          const startTime = dayjs.utc('2025-01-01').startOf('day').add(ac.startMinutes, 'minute').toDate()
          const endTime = dayjs.utc('2025-01-01').startOf('day').add(ac.endMinutes, 'minute').toDate()
          return {
            startTime,
            endTime,
            price: Number(ac.price),
            description: ac.description,
          }
        }),
      }
      updateMutation.mutate(updateData)
    }
  }

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'additionalCharges',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Service' : 'Edit Service'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Add a new service for this expert' : 'Update the service details for this expert'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the service..." className="resize-none" rows={3} {...field} />
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
                      <Input placeholder="e.g., Gurgoan" {...field} />
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

            {form.watch('availableModes')?.includes('IN_PERSON') && (
              <>
                <FormField
                  control={form.control}
                  name="inPersonLocation.address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">In-Person Location Address</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 804 (A), Arcadia, South City II, Sector 49, Gurugram"
                          className="resize-none"
                          rows={2}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="inPersonLocation.googleMapLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Google Maps Link</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., https://maps.app.goo.gl/..." {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <FormLabel className="text-foreground">Additional Charges (₹)</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    append({ startMinutes: 630, endMinutes: 750, price: '', description: '' })
                  }}
                >
                  <CirclePlusIcon className="size-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-wrap items-start gap-2 rounded-md border p-4">
                    <FormField
                      control={form.control}
                      name={`additionalCharges.${index}.startMinutes`}
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <FormLabel className="text-xs">From</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value !== undefined ? String(utcMinutesToLocalMinutes(field.value)) : ''}
                              onValueChange={(val) => {
                                field.onChange(localMinutesToUtcMinutes(Number(val)))
                              }}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Start" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={String(opt.value)}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`additionalCharges.${index}.endMinutes`}
                      render={({ field }) => (
                        <FormItem className="w-32">
                          <FormLabel className="text-xs">To</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value !== undefined ? String(utcMinutesToLocalMinutes(field.value)) : ''}
                              onValueChange={(val) => {
                                field.onChange(localMinutesToUtcMinutes(Number(val)))
                              }}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="End" />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((opt) => (
                                  <SelectItem key={opt.value} value={String(opt.value)}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`additionalCharges.${index}.price`}
                      render={({ field }) => (
                        <FormItem className="w-32 pr-4">
                          <FormLabel className="text-xs">Price (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder={form.watch('price') || 'Price'}
                              {...field}
                              className="h-9"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`additionalCharges.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="min-w-32 flex-1">
                          <FormLabel className="text-xs">Charge Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Description" {...field} className="h-9" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6 text-destructive"
                        onClick={() => remove(index)}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {mode === 'create' ? 'Create Service' : 'Update Service'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
