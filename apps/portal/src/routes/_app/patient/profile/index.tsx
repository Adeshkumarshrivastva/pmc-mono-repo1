import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { honoClient } from '@/lib/hono-client'

const profileFormSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().optional().or(z.literal('')),
  phoneNumber: z.string().min(10),
  timezone: z.string(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const getPatientDetails = async () => {
  const patientResponse = await honoClient.server.patient['patient-details'].$get()

  if (!patientResponse.ok) {
    throw new Error('Failed to load data')
  }

  return await patientResponse.json()
}

export const Route = createFileRoute('/_app/patient/profile/')({
  loader: async ({ context: { queryClient } }) => {
    const patient = await queryClient.ensureQueryData({
      queryKey: ['patient-details'],
      queryFn: getPatientDetails,
    })
    return { patient }
  },
  component: PatientProfile,
})

function PatientProfile() {
  const { patient } = Route.useLoaderData()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    values: {
      name: patient?.name ?? '',
      email: patient?.email ?? '',
      phoneNumber: patient?.phoneNumber ?? '',
      timezone: patient?.timezone ?? 'Asia/Kolkata',
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await honoClient.server.patient['patient-details'].$patch({ json: values })
      if (!res.ok) {
        throw new Error('Failed to update profile')
      }
      return await res.json()
    },
    onSuccess: () => {
      toast.success('Profile updated successfully')
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update profile')
    },
  })

  return (
    <Form {...form}>
      <form
        className="w-full max-w-4xl space-y-6"
        onSubmit={form.handleSubmit((values) => {
          updateProfileMutation.mutate(values)
        })}
      >
        <h1 className="text-2xl font-semibold mb-8">Profile</h1>

        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="phoneNumber"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input disabled placeholder="+91 98765 43210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="timezone"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Timezone</FormLabel>
              <FormControl>
                <Select value={field.value} disabled>
                  <SelectTrigger className="w-full pointer-events-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={field.value}>{field.value}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex space-x-4 pt-4">
          <Button type="submit" disabled={updateProfileMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}
