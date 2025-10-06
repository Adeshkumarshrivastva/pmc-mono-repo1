import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import z from 'zod'
import { PlusIcon, TrashIcon } from 'lucide-react'
import { honoClient } from '@/lib/hono-client'
import { getErrorMessage } from '@/lib/utils'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { prescriptionConfig } from '@/lib/prescription'

type PrescriptionFormData = z.infer<typeof prescriptionConfig>

export default function CreatePrescriptionForm({ bookingId, onSuccess }: { bookingId: string; onSuccess: () => void }) {
  const queryClient = useQueryClient()

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionConfig),
    defaultValues: {
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      notes: '',
    },
  })

  const {
    fields: medicineFields,
    append: addMedicine,
    remove: removeMedicine,
  } = useFieldArray({
    control: form.control,
    name: 'medicines',
  })

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: PrescriptionFormData) => {
      const response = await honoClient.server.experts.bookings.prescription.$post({
        json: {
          bookingId,
          medicines: data?.medicines ?? [],
          notes: data.notes,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error((error as { error?: string }).error || 'Failed to create prescription')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Prescription created successfully')
      onSuccess()
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['get-expert-bookings'] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          createPrescriptionMutation.mutate(values)
        })}
        className="space-y-6 p-6"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Medicines</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<PlusIcon className="size-4" />}
              onClick={() => {
                addMedicine({
                  name: '',
                  dosage: '',
                  frequency: '',
                  duration: '',
                  instructions: '',
                })
              }}
            >
              Add Medicine
            </Button>
          </div>

          {medicineFields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium">Medicine {index + 1}</h5>
                  {medicineFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={<TrashIcon className="size-4" />}
                      onClick={() => {
                        removeMedicine(index)
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`medicines.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medicine Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Paracetamol" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`medicines.${index}.dosage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dosage</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 500mg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`medicines.${index}.frequency`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 3 times a day" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`medicines.${index}.duration`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 7 days" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`medicines.${index}.instructions`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Take after meals" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          ))}
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Additional notes or instructions" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={createPrescriptionMutation.isPending}
            loading={createPrescriptionMutation.isPending}
          >
            Create Prescription
          </Button>
        </div>
      </form>
    </Form>
  )
}
