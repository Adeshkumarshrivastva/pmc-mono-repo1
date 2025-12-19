import { createFileRoute, redirect } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import { TrashIcon, CirclePlusIcon } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { honoClient } from '@/lib/hono-client'
import { localMinutesToUtcMinutes, MINUTES_PER_DAY, minutesToDate, toHHMMA, utcMinutesToLocalMinutes } from '@/lib/date'
import dayjs from '@/lib/dayjs'

export const Route = createFileRoute('/_app/expert/availability/')({
  component: ExpertAvailability,
  beforeLoad: ({ context: { user } }) => {
    if (user.role !== 'EXPERT') {
      throw redirect({ to: '/' })
    }
  },
  loader: async ({ context: { queryClient, user } }) => {
    const availabilityData = await queryClient.ensureQueryData({
      queryKey: ['expert-availability', user.id],
      queryFn: fetchExpertAvailability,
    })
    return { user, availabilityData }
  },
  pendingComponent: () => {
    return (
      <div className="flex h-screen w-full items-center justify-center gap-2">
        <Spinner />
        <div className="text-muted-foreground text-xs font-medium">Loading...</div>
      </div>
    )
  },
})

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

function ExpertAvailability() {
  const { availabilityData } = Route.useLoaderData()

  const form = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      days: availabilityData.days,
    },
  })

  const daysField = useFieldArray({
    control: form.control,
    name: 'days',
  })

  const saveAvaialbilityMutation = useMutation({
    mutationFn: saveAvailability,
    onSuccess: () => {
      toast.success('Availability updated successfully')
    },
    onError: () => {
      toast.error('Failed to update availability')
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Set your weekly availability</h1>
        <p className="text-muted-foreground text-sm">
          Choose the times when patients can book sessions with you. Availability is based on 15-minute slots and is
          applied every week.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => {
            saveAvaialbilityMutation.mutate(values)
          })}
          className="space-y-6 max-w-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Weekly schedule</span>
            <div className="flex items-center gap-2">
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={!form.formState.isDirty || saveAvaialbilityMutation.isPending}
                  loading={saveAvaialbilityMutation.isPending}
                >
                  Save availability
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  form.reset(availabilityData)
                }}
              >
                Reset all
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
            {daysField.fields.map((dayField, dayFieldIndex) => {
              const label = DAY_LABELS.find((d) => d.index === dayField.dayIndex)?.label

              return (
                <DayAvailabilityField key={dayField.id} dayIndex={dayFieldIndex} dayLabel={label ?? ''} form={form} />
              )
            })}
          </div>
        </form>
      </Form>
    </div>
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

async function fetchExpertAvailability() {
  const res = await honoClient.server.experts.availability.$get()
  if (!res.ok) {
    throw new Error('Failed to fetch availability')
  }
  return res.json()
}

async function saveAvailability(values: FormValues) {
  const res = await honoClient.server.experts.availability.$post({
    json: {
      days: values.days.map((d) => ({
        dayIndex: d.dayIndex,
        ranges: d.ranges,
      })),
    },
  })

  if (!res.ok) {
    throw new Error('Failed to save availability')
  }
  const data = await res.json()
  return data
}
