import { createFileRoute } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combo-box'
import { honoClient } from '@/lib/hono-client'
import { genderOptions, generateSpecializationOptions } from '@/lib/expert'

const profileFormSchema = z.object({
  name: z.string().min(3),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']),
  city: z.string(),
  country: z.string(),
  timezone: z.string(),
  expertise: z.array(z.string()),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export const Route = createFileRoute('/_app/expert/profile/')({
  beforeLoad: async () => {
    const expertResponse = await honoClient.server.experts.expert.$get()
    const allExpertsResponse = await honoClient.server.experts.$get({ query: {} })

    if (!expertResponse.ok || !allExpertsResponse.ok) {
      throw new Error('Failed to load data')
    }

    const expert = await expertResponse.json()
    const allExperts = await allExpertsResponse.json()
    return { expert, allExperts }
  },
  loader: ({ context }) => context,
  component: ExpertProfile,
})

function ExpertProfile() {
  const { expert, allExperts } = Route.useLoaderData()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: expert.name,
      qualifications: expert.qualifications ?? '',
      bio: expert.bio ?? '',
      gender: expert.gender,
      city: expert.city,
      country: expert.country,
      timezone: expert.timezone,
      expertise: expert.expertise,
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await honoClient.server.experts.expert.$patch({ json: values })
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

        <div className="flex items-center space-x-4 mb-8">
          <div className="w-24 h-24 rounded-sm bg-gray-200 overflow-hidden">
            {expert.image ? (
              <img src={expert.image} alt={expert.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500">No Image</div>
            )}
          </div>

          <Button disabled variant="outline" size="sm">
            Upload Photo
          </Button>
        </div>

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
          name="qualifications"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Qualifications</FormLabel>
              <FormControl>
                <Input placeholder="MBBS, MD" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="expertise"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expertise</FormLabel>
              <FormControl>
                <Combobox
                  multiple
                  placeholder="Select Expertise"
                  options={generateSpecializationOptions(allExperts.experts)}
                  value={field.value}
                  onValueChange={(val) => field.onChange(val)}
                  className="w-full"
                />
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
                <Textarea placeholder="Write something about yourself..." rows={5} className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="gender"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
            name="city"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="New Delhi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="flex space-x-4 pt-4">
          <Button type="submit" disabled={updateProfileMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}
