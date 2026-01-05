import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { honoClient } from '@/lib/hono-client'
import { queryClient } from '@/lib/query-client'
import { getFileUrl } from '@/lib/utils'
import PhoneInput from '@/components/ui/phone-input'

export const Route = createFileRoute('/_app/admin/experts/add')({
  component: AddExpertPage,
})

const createExpertSchema = z.object({
  email: z.email('Valid email is required'),
  phoneNumber: z.string(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum([
    'PSYCHOLOGIST',
    'PSYCHIATRIST',
    'CLINICAL_PSYCHOLOGIST',
    'CONSULTANT_PHYSICIAN',
    'REHABILITATION_PSYCHOLOGIST',
  ]),
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

type CreateExpertFormValues = z.infer<typeof createExpertSchema>

function AddExpertPage() {
  const navigate = useNavigate()
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>()

  const form = useForm<CreateExpertFormValues>({
    resolver: zodResolver(createExpertSchema),
    defaultValues: {
      email: '',
      phoneNumber: '',
      name: '',
      type: 'PSYCHOLOGIST',
      qualifications: '',
      bio: '',
      gender: 'MALE',
      city: '',
      country: '',
      timezone: 'Asia/Kolkata',
      expertise: '',
      experienceInYears: undefined,
      photoId: undefined,
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
      setUploadedFileName(file.fileName)
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

  const createMutation = useMutation({
    mutationFn: async (values: CreateExpertFormValues) => {
      const response = await honoClient.server.admin.experts.$post({
        json: {
          ...values,
          expertise: values.expertise
            .split(',')
            .map((e) => e.trim())
            .filter(Boolean),
        },
      })

      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        throw new Error(error.error || 'Failed to create expert')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Expert created successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-experts'] })
      navigate({ to: '/admin/experts' })
    },
    onError: (error: Error) => {
      toast.error('Failed to create expert', {
        description: error.message,
      })
    },
  })

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/experts"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Experts
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Add New Expert</h1>
        <p className="text-muted-foreground mt-1">Create a new expert profile in the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expert Information</CardTitle>
          <CardDescription>Fill in the details to create a new expert profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => createMutation.mutate(values))} className="space-y-6">
              <div className="flex flex-col gap-2">
                <FormLabel>Profile Photo</FormLabel>
                <div className="w-32 h-32 rounded-sm bg-gray-200 overflow-hidden">
                  {uploadedFileName ? (
                    <img src={getFileUrl(uploadedFileName)} alt="Expert photo" className="w-full h-full object-cover" />
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="expert@example.com" {...field} />
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
                        <PhoneInput placeholder="9090909090" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="type"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expert Type</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PSYCHOLOGIST">Psychologist</SelectItem>
                            <SelectItem value="PSYCHIATRIST">Psychiatrist</SelectItem>
                            <SelectItem value="CLINICAL_PSYCHOLOGIST">Clinical Psychologist</SelectItem>
                            <SelectItem value="CONSULTANT_PHYSICIAN">Consultant Physician</SelectItem>
                            <SelectItem value="REHABILITATION_PSYCHOLOGIST">Rehabilitation Psychologist</SelectItem>
                          </SelectContent>
                        </Select>
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
              </div>

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
                        type="number"
                        placeholder="10"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
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
                name="timezone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <FormControl>
                      <Input placeholder="Asia/Kolkata" {...field} />
                    </FormControl>
                    <FormDescription>IANA timezone identifier (e.g., Asia/Kolkata, America/New_York)</FormDescription>
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
                      <Input placeholder="Anxiety, Depression, Stress Management (comma-separated)" {...field} />
                    </FormControl>
                    <FormDescription>Enter expertise areas separated by commas</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate({ to: '/admin/experts' })}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} loading={createMutation.isPending}>
                  Create Expert
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
