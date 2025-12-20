import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { TrashIcon, CirclePlusIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { honoClient } from '@/lib/hono-client'
import { localMinutesToUtcMinutes, MINUTES_PER_DAY, minutesToDate, toHHMMA, utcMinutesToLocalMinutes } from '@/lib/date'
import dayjs from '@/lib/dayjs'

interface ExpertAvailabilityFormProps {
  expertId: string
  onSuccess?: () => void
}

const SLOT_INTERVAL_MINUTES = 15

type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

const DAY_LABELS: { index: DayIndex; label: string }[] = [
  { index: 1, label: 'Monday' },
  { index: 2, label: 'Tuesday' },
  { index: 3, label: 'Wednesday' },
  { index: 4, label: 'Thursday' },
  { index: 5, label: 'Friday' },
  { index: 6, label: 'Saturday' },
  { index: 0, label: 'Sunday' },
]

const TIME_OPTIONS: { value: number; label: string }[] = (() => {
  const options: { value: number; label: string }[] = []
  for (let m = 0; m < MINUTES_PER_DAY; m += SLOT_INTERVAL_MINUTES) {
    options.push({ value: m, label: toHHMMA(minutesToDate(m, dayjs().toDate())) })
  }
  return options
})()

const timeRangeSchema = z
  .object({
    startMinutes: z.number(),
    endMinutes: z.number(),
  })
  .refine((val) => val.endMinutes > val.startMinutes, {
    message: 'End time must be after start time',
    path: ['endMinutes'],
  })

const dayAvailabilitySchema = z
  .object({
    dayIndex: z.number(),
    ranges: z.array(timeRangeSchema),
  })
  .refine(
    (val) => {
      const sorted = [...val.ranges].sort((a, b) => a.startMinutes - b.startMinutes)
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].startMinutes < sorted[i - 1].endMinutes) {
          return false
        }
      }
      return true
    },
    {
      message: 'Time ranges must not overlap for a given day',
      path: ['ranges'],
    },
  )

const validationSchema = z.object({
  days: z.array(dayAvailabilitySchema),
})

type FormValues = z.infer<typeof validationSchema>

interface DayAvailabilityFieldProps {
  dayIndex: number
  dayLabel: string
  form: ReturnType<typeof useForm<FormValues>>
}

export default function ExpertAvailabilityForm({ expertId, onSuccess }: ExpertAvailabilityFormProps) {
  const availabilityQuery = useQuery({
    queryKey: ['admin-expert-availability', expertId],
    queryFn: async () => {
      const response = await honoClient.server.admin.experts[':expertId'].availability.$get({
        param: { expertId },
      })
      if (!response.ok) throw new Error('Failed to fetch availability')
      return response.json()
    },
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    values: availabilityQuery.data
      ? {
          days: availabilityQuery.data.days,
        }
      : undefined,
  })

  const daysField = useFieldArray({
    control: form.control,
    name: 'days',
  })

  const saveAvailabilityMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await honoClient.server.admin.experts[':expertId'].availability.$post({
        param: { expertId },
        json: {
          days: values.days.map((d) => ({
            dayIndex: d.dayIndex,
            ranges: d.ranges,
          })),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to save availability')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Availability updated successfully')
      availabilityQuery.refetch()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update availability')
    },
  })

  if (availabilityQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (availabilityQuery.isError) {
    return <div className="text-center py-8 text-muted-foreground">Failed to load availability</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => saveAvailabilityMutation.mutate(values))} className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Weekly schedule</span>
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={!form.formState.isDirty || saveAvailabilityMutation.isPending}
              loading={saveAvailabilityMutation.isPending}
            >
              Save availability
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                form.reset(availabilityQuery.data)
              }}
            >
              Reset all
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
          {daysField.fields.map((dayField, dayFieldIndex) => {
            const label = DAY_LABELS.find((d) => d.index === dayField.dayIndex)?.label

            return <DayAvailabilityField key={dayField.id} dayIndex={dayFieldIndex} dayLabel={label ?? ''} form={form} />
          })}
        </div>
      </form>
    </Form>
  )
}

function DayAvailabilityField({ dayIndex, dayLabel, form }: DayAvailabilityFieldProps) {
  const rangesField = useFieldArray({
    control: form.control,
    name: `days.${dayIndex}.ranges`,
  })

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="text-l font-medium">{dayLabel}</div>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              rangesField.append({ startMinutes: 270, endMinutes: 390 })
            }}
          >
            <CirclePlusIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 pl-10">
        {rangesField.fields.map((range, rangeIndex) => (
          <div key={range.id} className="flex flex-wrap items-center group gap-2 rounded-md bg-background p-2">
            <FormField
              control={form.control}
              name={`days.${dayIndex}.ranges.${rangeIndex}.startMinutes`}
              render={({ field }) => (
                <FormItem className="w-32">
                  <FormLabel className="text-xs">From</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value !== undefined ? String(utcMinutesToLocalMinutes(field.value)) : ''}
                      onValueChange={(val) => {
                        field.onChange(localMinutesToUtcMinutes(Number(val)))
                        void form.trigger(`days.${dayIndex}`)
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Start" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
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
              control={form.control}
              name={`days.${dayIndex}.ranges.${rangeIndex}.endMinutes`}
              render={({ field }) => (
                <FormItem className="w-32">
                  <FormLabel className="text-xs">To</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value !== undefined ? String(utcMinutesToLocalMinutes(field.value)) : ''}
                      onValueChange={(val) => {
                        field.onChange(localMinutesToUtcMinutes(Number(val)))
                        void form.trigger(`days.${dayIndex}`)
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="End" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="w-32">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  rangesField.remove(rangeIndex)
                }}
                className="mr-1 opacity-10 group-hover:opacity-100"
              >
                <TrashIcon className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
