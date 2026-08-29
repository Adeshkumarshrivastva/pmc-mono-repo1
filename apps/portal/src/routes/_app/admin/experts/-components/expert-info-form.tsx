import { useMutation } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useState } from 'react'
import type { InferResponseType } from 'hono'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { honoClient } from '@/lib/hono-client'
import type { HonoClient } from '@/lib/hono-client'
import { EXPERT_TYPES, EXPERT_TYPES_CONFIG, type ExpertType } from '@/lib/expert'
import { getFileUrl } from '@/lib/utils'
import PhoneInput from '@/components/ui/phone-input'

const expertInfoSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.email('Valid email is required'),
  phoneNumber: z.string(),
  type: z.custom<ExpertType>(),
  qualifications: z.string().optional(),
  bio: z.string().optional(),
  professionalSnapshot: z.array(z.string()),
  education: z.array(z.object({ degree: z.string(), institution: z.string() })),
  professionalRegistration: z.string().optional(),
  whyChooseUs: z.array(z.string()),
  whatToExpect: z.array(z.string()),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })),
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
      email: initialData?.user?.email || '',
      phoneNumber: initialData?.user?.phoneNumber || '',
      type: initialData?.type || 'PSYCHOLOGIST',
      qualifications: initialData?.qualifications || '',
      bio: initialData?.bio || '',
      professionalSnapshot: initialData?.professionalSnapshot?.length ? initialData.professionalSnapshot : [],
      education: initialData?.education?.length ? initialData.education : [],
      professionalRegistration: initialData?.professionalRegistration || '',
      whyChooseUs: initialData?.whyChooseUs?.length ? initialData.whyChooseUs : [],
      whatToExpect: initialData?.whatToExpect?.length ? initialData.whatToExpect : [],
      faqs: initialData?.faqs?.length ? initialData.faqs : [],
      gender: initialData?.gender || 'MALE',
      city: initialData?.city || '',
      country: initialData?.country || '',
      timezone: initialData?.timezone || '',
      expertise: initialData?.expertise?.join(', ') || '',
      experienceInYears: initialData?.experienceInYears || undefined,
      photoId: initialData?.file?.id,
    },
  })

  const {
    fields: faqFields,
    append: addFaq,
    remove: removeFaq,
  } = useFieldArray({
    control: form.control,
    name: 'faqs',
  })

  const {
    fields: educationFields,
    append: addEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: 'education',
  })

  const whyChooseUs = form.watch('whyChooseUs')
  const whatToExpect = form.watch('whatToExpect')
  const professionalSnapshot = form.watch('professionalSnapshot')

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
          email: values.email,
          phoneNumber: values.phoneNumber,
          type: values.type,
          qualifications: values.qualifications,
          bio: values.bio,
          professionalSnapshot: values.professionalSnapshot.filter(Boolean),
          education: values.education.filter((edu) => edu.degree.trim() && edu.institution.trim()),
          professionalRegistration: values.professionalRegistration,
          whyChooseUs: values.whyChooseUs.filter(Boolean),
          whatToExpect: values.whatToExpect.filter(Boolean),
          faqs: values.faqs.filter((faq) => faq.question.trim() && faq.answer.trim()),
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="email"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="expert@example.com" {...field} />
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
                  <PhoneInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                      <SelectValue placeholder="Select Expert Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERT_TYPES.map((option) => (
                        <SelectItem key={EXPERT_TYPES_CONFIG[option].value} value={EXPERT_TYPES_CONFIG[option].value}>
                          {EXPERT_TYPES_CONFIG[option].label}
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Educational Qualifications</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<PlusIcon className="size-4" />}
              onClick={() => addEducation({ degree: '', institution: '' })}
            >
              Add Qualification
            </Button>
          </div>
          {educationFields.map((field, index) => (
            <Card key={field.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-sm">Qualification {index + 1}</h5>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<TrashIcon className="size-4" />}
                  onClick={() => removeEducation(index)}
                >
                  Remove
                </Button>
              </div>
              <FormField
                name={`education.${index}.degree`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree</FormLabel>
                    <FormControl>
                      <Input placeholder="M.Phil. in Clinical Psychology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={`education.${index}.institution`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution</FormLabel>
                    <FormControl>
                      <Input placeholder="Amity University" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          ))}
        </div>

        <FormField
          name="professionalRegistration"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Registration</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. Rehabilitation Council of India (RCI) - CRR-A112506" {...field} rows={2} />
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Professional Snapshot</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<PlusIcon className="size-4" />}
              onClick={() => form.setValue('professionalSnapshot', [...professionalSnapshot, ''])}
            >
              Add Point
            </Button>
          </div>
          <FormDescription>Click "Add Point" for each line separately — don't paste all points into one box.</FormDescription>
          {professionalSnapshot.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="e.g. 3+ Years of Clinical Experience"
                value={professionalSnapshot[index]}
                onChange={(e) => {
                  const next = [...professionalSnapshot]
                  next[index] = e.target.value
                  form.setValue('professionalSnapshot', next)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<TrashIcon className="size-4" />}
                onClick={() => form.setValue('professionalSnapshot', professionalSnapshot.filter((_, i) => i !== index))}
              />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>Why Choose Us</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<PlusIcon className="size-4" />}
              onClick={() => form.setValue('whyChooseUs', [...whyChooseUs, ''])}
            >
              Add Point
            </Button>
          </div>
          <FormDescription>Click "Add Point" for each line separately — don't paste all points into one box.</FormDescription>
          {whyChooseUs.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="e.g. RCI-Registered Clinical Psychologist"
                value={whyChooseUs[index]}
                onChange={(e) => {
                  const next = [...whyChooseUs]
                  next[index] = e.target.value
                  form.setValue('whyChooseUs', next)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<TrashIcon className="size-4" />}
                onClick={() => form.setValue('whyChooseUs', whyChooseUs.filter((_, i) => i !== index))}
              />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>What to Expect</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<PlusIcon className="size-4" />}
              onClick={() => form.setValue('whatToExpect', [...whatToExpect, ''])}
            >
              Add Point
            </Button>
          </div>
          <FormDescription>Click "Add Point" for each line separately — don't paste all points into one box.</FormDescription>
          {whatToExpect.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="e.g. Understanding your symptoms and challenges"
                value={whatToExpect[index]}
                onChange={(e) => {
                  const next = [...whatToExpect]
                  next[index] = e.target.value
                  form.setValue('whatToExpect', next)
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<TrashIcon className="size-4" />}
                onClick={() => form.setValue('whatToExpect', whatToExpect.filter((_, i) => i !== index))}
              />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel>FAQs</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<PlusIcon className="size-4" />}
              onClick={() => addFaq({ question: '', answer: '' })}
            >
              Add FAQ
            </Button>
          </div>
          {faqFields.map((field, index) => (
            <Card key={field.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-sm">FAQ {index + 1}</h5>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<TrashIcon className="size-4" />}
                  onClick={() => removeFaq(index)}
                >
                  Remove
                </Button>
              </div>
              <FormField
                name={`faqs.${index}.question`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question</FormLabel>
                    <FormControl>
                      <Input placeholder="How is a Clinical Psychologist different from a Psychiatrist?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name={`faqs.${index}.answer`}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={updateMutation.isPending} loading={updateMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  )
}
