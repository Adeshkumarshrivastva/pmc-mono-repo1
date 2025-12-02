'use client'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { internshipsFormInput, type InternshipsFormInput } from '@/payload/actions/internships/internships.input'
import { createInternship } from '@/payload/actions/internships/internships.actions'

export default function InternshipPage() {
  const form = useForm<InternshipsFormInput>({
    resolver: zodResolver(internshipsFormInput),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      schoolOrUniversity: '',
      degreeOrProgram: '',
      interestedIn: '',
      message: '',
    },
  })

  const internshipMutation = useMutation({
    mutationFn: createInternship,
    onSuccess: (data) => {
      toast.success(data.message || 'Application submitted successfully!')
      form.reset()
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to submit. Please try again.')
    },
  })

  return (
    <div className="w-full bg-accent">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12 md:px-8 lg:px-12 lg:py-20">
        <div className="bg-white rounded-xl shadow-md border p-8 sm:p-10">
          <h1 className="text-4xl sm:text-5xl font-semibold mb-6 text-primary">Apply for Internship</h1>
          <p className="text-lg sm:text-xl mb-10">
            Fill out the form below to submit your internship application. We will get back to you soon.
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => internshipMutation.mutate(values))}
              className="grid grid-cols-1 gap-6 sm:gap-8"
            >
              <FormField
                name="fullName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
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
                      <Input placeholder="john@example.com" type="email" {...field} />
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
                      <Input placeholder="+1 234 567 890" {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="schoolOrUniversity"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School / University</FormLabel>
                    <FormControl>
                      <Input placeholder="XYZ University" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="degreeOrProgram"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree / Program</FormLabel>
                    <FormControl>
                      <Input placeholder="BSc Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="interestedIn"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position / Role Interested In</FormLabel>
                    <FormControl>
                      <Input placeholder="Frontend Developer Intern" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="message"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us a bit about yourself..." rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full py-3 mt-2" disabled={internshipMutation.isPending}>
                Submit Application
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
