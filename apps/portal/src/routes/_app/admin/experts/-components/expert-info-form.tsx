import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import type { InferResponseType } from 'hono'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { honoClient } from '@/lib/hono-client'
import type { HonoClient } from '@/lib/hono-client'

const expertInfoSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  expertise: z.string(),
})

type ExpertInfoFormValues = z.infer<typeof expertInfoSchema>
type ExpertData = InferResponseType<HonoClient['server']['admin']['experts'][':expertId']['$get'], 200>

interface ExpertInfoFormProps {
  expertId: string
  initialData?: ExpertData
  onSuccess?: () => void
}

export default function ExpertInfoForm({ expertId, initialData, onSuccess }: ExpertInfoFormProps) {
  const form = useForm<ExpertInfoFormValues>({
    resolver: zodResolver(expertInfoSchema),
    defaultValues: {
      name: initialData?.name || '',
      qualifications: initialData?.qualifications || '',
      bio: initialData?.bio || '',
      gender: initialData?.gender || 'MALE',
      city: initialData?.city || '',
      country: initialData?.country || '',
      timezone: initialData?.timezone || '',
      expertise: initialData?.expertise?.join(', ') || '',
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (values: ExpertInfoFormValues) => {
      const response = await honoClient.server.admin.experts[':expertId'].$patch({
        param: { expertId },
        json: {
          name: values.name,
          qualifications: values.qualifications,
          bio: values.bio,
          gender: values.gender,
          city: values.city,
          country: values.country,
          timezone: values.timezone,
          expertise: values.expertise
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to update expert')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Expert information updated successfully')
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update expert')
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))} className="space-y-6">
        {initialData?.image && (
          <div className="flex flex-col gap-2">
            <FormLabel>Profile Photo</FormLabel>
            <div className="w-32 h-32 rounded-sm bg-gray-200 overflow-hidden">
              <img src={initialData.image} alt={initialData?.name} className="w-full h-full object-cover" />
            </div>
          </div>
        )}

        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Dr. John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="gender"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="qualifications"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualifications</FormLabel>
              <FormControl>
                <Textarea placeholder="MBBS, MD Psychiatry" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="bio"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea placeholder="Brief description about the expert..." {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="city"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Mumbai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="country"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="India" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="expertise"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expertise</FormLabel>
              <FormControl>
                <Input placeholder="Anxiety, Depression, Stress Management (comma-separated)" {...field} />
              </FormControl>
              <FormDescription>Enter expertise areas separated by commas</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={updateMutation.isPending || !form.formState.isDirty}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
