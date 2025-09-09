import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type PrebookingFormProps = {
  onNext: () => void
}

const prebookingFormSchema = z.object({
  patientName: z.string().min(3).max(100),
  patientEmail: z.email().optional(),
})

export default function PrebookingForm({}: PrebookingFormProps) {
  const form = useForm({
    resolver: zodResolver(prebookingFormSchema),
  })

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          name="patientName"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Patient Name*</FormLabel>
                <FormControl>
                  <Input autoFocus placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          name="patientEmail"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Patient Email</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
              </FormItem>
            )
          }}
        />
        {/* TODO: Render Custom Fields */}
        <Button>Confirm & Pay</Button>
      </form>
    </Form>
  )
}
