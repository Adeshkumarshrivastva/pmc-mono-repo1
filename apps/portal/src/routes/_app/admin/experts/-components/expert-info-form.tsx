import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useState } from 'react'
import type { InferResponseType } from 'hono'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { honoClient } from '@/lib/hono-client'
import type { HonoClient } from '@/lib/hono-client'
import { getFileUrl } from '@/lib/utils'

const expertInfoSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE']),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  expertise: z.string(),
  experienceInYears: z.number().int().min(0, 'Experience must be 0 or greater').optional(),
  photoId: z.string().optional(),
})

type ExpertInfoFormValues = z.infer<typeof expertInfoSchema>
type ExpertData = InferResponseType<HonoClient['server']['admin']['experts'][':expertId']['$get'], 200>

interface ExpertInfoFormProps {
  expertId: string
  initialData?: ExpertData
  onSuccess?: () => void
}

export default function ExpertInfoForm({ expertId, initialData, onSuccess }: ExpertInfoFormProps) {
  const [currentFileName, setCurrentFileName] = useState<string | undefined>(initialData?.file?.fileName)

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
      experienceInYears: initialData?.experienceInYears || undefined,
      photoId: initialData?.file?.id,
    },
  })

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const res = await honoClient.server.file.upload.$post({ form: { file } })
      const data = await res.json()
      if (!('file' in data)) {
        throw new Error(data.error || 'File upload failed')
      }
      return data.file
    },
    onSuccess: (file) => {
      setCurrentFileName(file.fileName)
      form.setValue('photoId', file.id)
      toast.success('Photo uploaded successfully')
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to upload photo')
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }
    uploadFileMutation.mutate(file)
  }

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
          experienceInYears: values.experienceInYears,
          photoId: values.photoId,
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
        <div className="flex flex-col gap-2">
          <FormLabel>Profile Photo</FormLabel>
          <div className="w-32 h-32 rounded-sm bg-gray-200 overflow-hidden">
            {currentFileName ? (
              <img src={getFileUrl(currentFileName)} alt={initialData?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-500">No Image</div>
            )}
          </div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploadFileMutation.isPending}
            className="w-60"
          />
          {uploadFileMutation.isPending && <p className="text-sm text-muted-foreground">Uploading...</p>}
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
          name="experienceInYears"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience (Years)</FormLabel>
              <FormControl>
                <Input
                  placeholder="10"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value ? Number(e.target.value) : '')
                  }}
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
          <Button type="submit" disabled={updateMutation.isPending} loading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}
