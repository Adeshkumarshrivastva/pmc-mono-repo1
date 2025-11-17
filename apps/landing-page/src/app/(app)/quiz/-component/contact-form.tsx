'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { createQuizLead, quizLeadInput, type QuizLeadFormInput } from '@/payload/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

interface QuizContactFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  title?: string
  description?: string
  quizId?: string
  quizAnswers?: Array<{
    question: string
    answer: string
  }>
}

export default function QuizContactForm({
  open,
  onOpenChange,
  onSuccess,
  title = 'Get Your Results',
  description = 'Please provide your contact information to receive your assessment results',
  quizAnswers = [],
}: QuizContactFormProps) {
  const form = useForm<QuizLeadFormInput>({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      quizAnswers: quizAnswers,
    },
    resolver: zodResolver(quizLeadInput),
  })

  const quizFormMutation = useMutation({
    mutationFn: createQuizLead,
    onSuccess: () => {
      form.reset()
      onOpenChange(false)
      onSuccess()
    },
    onError: () => {
      toast('Failed to submit the form. Please try again later.', {
        description: 'If the problem persists, please contact us directly.',
      })
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              quizFormMutation.mutate({
                ...values,
                quizAnswers: quizAnswers,
              })
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="fullName"
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
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1 (555) 000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 justify-end pt-4">
              <Button type="submit" disabled={quizFormMutation.isPending}>
                {quizFormMutation.isPending ? 'Submitting...' : 'View Results'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
