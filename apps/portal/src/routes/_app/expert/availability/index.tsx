import { createFileRoute, redirect } from '@tanstack/react-router'
import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import dayjs from 'dayjs'
import { toast } from 'sonner'
import { TrashIcon, CirclePlusIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { honoClient } from '@/lib/hono-client'

export const Route = createFileRoute('/_app/expert/availability/')({
  component: ExpertAvailability,
  beforeLoad: ({ context: { user } }) => {
    if (user.role === 'PATIENT') {
      throw redirect({ to: '/patient/dashboard' })
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

const MINUTES_PER_DAY = 24 * 60
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

function minutesToLabel(minutes: number) {
  return dayjs().startOf('day').add(minutes, 'minute').format('hh:mm A')
}

const TIME_OPTIONS: { value: number; label: string }[] = (() => {
  const options: { value: number; label: string }[] = []
  for (let m = 0; m < MINUTES_PER_DAY; m += SLOT_INTERVAL_MINUTES) {
    options.push({ value: m, label: minutesToLabel(m) })
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
    label: z.string(),
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

const formSchema = z.object({
  days: z.array(dayAvailabilitySchema),
})

type FormValues = z.infer<typeof formSchema>

const defaultDays: FormValues['days'] = DAY_LABELS.map((d) => ({
  dayIndex: d.index,
  label: d.label,
  ranges: [],
}))

function ExpertAvailability() {
  const { availabilityData } = Route.useLoaderData()

  const initialDays = React.useMemo(() => {
    if (!availabilityData || !('days' in availabilityData)) return defaultDays

    return defaultDays.map((defaultDay) => {
      const fetchedDay = availabilityData.days.find(
        (d: { dayIndex: number; ranges: { startMinutes: number; endMinutes: number }[] }) =>
          d.dayIndex === defaultDay.dayIndex,
      )
      return {
        ...defaultDay,
        ranges: fetchedDay ? fetchedDay.ranges : [],
      }
    })
  }, [availabilityData])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      days: initialDays,
    },
    mode: 'onSubmit',
  })

  React.useEffect(() => {
    form.reset({ days: initialDays })
  }, [initialDays, form])

  const handleResetAll = () => {
    form.setValue('days', defaultDays, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const handleSaveAvailability = async (values: FormValues) => {
    try {
      const res = await honoClient.server.experts.availability.$post({
        json: {
          days: values.days.map((d) => ({
            dayIndex: d.dayIndex,
            ranges: d.ranges,
          })),
        },
      })

      if (res.ok) {
        toast.success('Availability updated successfully')
        form.reset(values)
      } else {
        toast.error('Failed to update availability')
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while saving availability')
    }
  }

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
          onSubmit={form.handleSubmit(
            handleSaveAvailability,
            () => {
              toast.error('Please fix the errors in your availability before saving')
            },
          )}
          className="space-y-6 max-w-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Weekly schedule</span>
            <div className="flex items-center gap-2">
              <div className="flex justify-end">
                <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      Saving...
                    </>
                  ) : (
                    'Save availability'
                  )}
                </Button>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={handleResetAll}>
                Reset all
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
            {form.watch('days').map((day, dayIndex) => {
              const rangesName = `days.${dayIndex}.ranges` as const
              const ranges = form.watch(rangesName) ?? []

              return (
                <div key={day.dayIndex} className="space-y-2">
                  <div className="grid grid-cols-3 items-center">
                    <div className="text-l font-medium">{day.label}</div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const current = ranges ?? []
                        const next = [
                          ...current,
                          {
                            startMinutes: 9 * 60,
                            endMinutes: 17 * 60,
                          },
                        ]
                        form.setValue(rangesName, next, { shouldValidate: true, shouldDirty: true })
                      }}
                      className="justify-self-center ml-34"
                    >
                      <CirclePlusIcon className="size-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 pl-10">
                    {ranges.map((_, rangeIndex) => (
                      <div
                        key={`${day.dayIndex}-${rangeIndex}`}
                        className="flex flex-wrap items-center gap-2 rounded-md bg-background p-2"
                      >

                        <FormField
                          control={form.control}
                          name={`days.${dayIndex}.ranges.${rangeIndex}.startMinutes`}
                          render={({ field }) => (
                            <FormItem className="w-32">
                              <FormLabel className="text-xs">From</FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value !== undefined ? String(field.value) : ''}
                                  onValueChange={(val) => {
                                    field.onChange(Number(val))
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
                                  value={field.value !== undefined ? String(field.value) : ''}
                                  onValueChange={(val) => {
                                    field.onChange(Number(val))
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

                        <FormField
                          control={form.control}
                          name={`days.${dayIndex}.ranges.${rangeIndex}.startMinutes`}
                          render={({ }) => (
                            <FormItem className="w-32">
                              <FormLabel className="text-xs">ㅤ</FormLabel>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const current = ranges ?? []
                                    const next = current.filter((_, idx) => idx !== rangeIndex)
                                    form.setValue(
                                      `days.${dayIndex}`,
                                      { ...day, ranges: next },
                                      {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                        shouldTouch: true,
                                      },
                                    )
                                  }}
                                  className="mr-1"
                                >
                                  <TrashIcon className="size-4" />
                                </Button>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </form>
      </Form>
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
