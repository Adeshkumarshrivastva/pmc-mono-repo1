import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { Service } from '@pmc/server/src/generated/prisma/client'
import { nanoid } from 'nanoid'
import { honoClient } from '@/lib/hono-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/check-box'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SERVICE_MODE_CONFIG } from '@/lib/location'

const serviceFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  price: z.number().min(500, 'Price must be above ₹500'),
  durationInMinutes: z.number().min(15, 'Duration must be at least 15 minutes'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  availableModes: z.array(z.enum(['IN_PERSON', 'VIRTUAL'])).min(1, 'Select at least one mode'),
  paymentMode: z.enum(['ONLINE', 'OFFLINE']),
})

type ServiceFormInput = z.infer<typeof serviceFormSchema>

interface ServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: Service | null
  mode: 'create' | 'edit'
}

function generateServiceSlug(name: string): string {
  const formattedName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  const id = nanoid(4)

  return `${formattedName}-${id}`
}

export function ServiceDialog({ open, onOpenChange, service, mode }: ServiceDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<ServiceFormInput>({
    defaultValues: service || {
      name: '',
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
    mutationFn: async (data: ServiceFormInput & { slug: string }) => {
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
              if (mode === 'create') {
                const dataWithSlug = {
                  ...data,
                  slug: generateServiceSlug(data.name),
                }
                createMutation.mutate(dataWithSlug)
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
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
                        <FormItem>
                          <FormLabel className="text-foreground">Service Location</FormLabel>
                          <div className="space-y-2">
                            {Object.values(SERVICE_MODE_CONFIG).map((mode) => (
                              <label key={mode.value} className="flex items-center space-x-2 cursor-pointer">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(mode.value)}
                                    onCheckedChange={(checked) => {
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

            <div className="flex gap-4 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-primary text-primary-foreground hover:opacity-90"
                loading={createMutation.isPending}
              >
                {createMutation.isPending ? 'Saving...' : mode === 'create' ? 'Create Service' : 'Update Service'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
