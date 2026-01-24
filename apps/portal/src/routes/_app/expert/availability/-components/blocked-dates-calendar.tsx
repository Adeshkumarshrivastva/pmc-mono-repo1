import { useState } from 'react'
import { toast } from 'sonner'
import { TrashIcon } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/check-box'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { honoClient } from '@/lib/hono-client'
import { MINUTES_PER_DAY } from '@/lib/date'
import { TIME_OPTIONS } from '@/lib/booking'
import dayjs from '@/lib/dayjs'

interface BlockedDatesCalendarProps {
  blockedDates: { id: string; startDate: string; endDate: string }[]
  availabilityDays: { dayIndex: number; ranges: { startMinutes: number; endMinutes: number }[] }[]
}

interface BlockDateFormProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  blockedDates: { id: string; startDate: string; endDate: string }[]
  availabilityDays: { dayIndex: number; ranges: { startMinutes: number; endMinutes: number }[] }[]
}

export function BlockedDatesCalendar({ blockedDates, availabilityDays }: BlockedDatesCalendarProps) {
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const visibleBlockedDates = blockedDates.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )

  const deleteBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await honoClient.server.experts.availability['block-dates'][':blockedDateId'].$delete({
        param: { blockedDateId: id },
      })
      if (!res.ok) throw new Error('Failed to delete block')
      return res.json()
    },
    onSuccess: async () => {
      toast.success('Block removed successfully')
      await queryClient.invalidateQueries({ queryKey: ['expert-availability'] })
    },
    onError: () => {
      toast.error('Failed to remove block')
    },
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Blocked Dates</h2>
          <p className="text-muted-foreground text-sm">Manage your unavailable dates.</p>
        </div>
        <div>
          <Button onClick={() => setIsDialogOpen(true)}>Block Dates</Button>
        </div>
      </div>
      <div className="border rounded-md bg-card">
        {visibleBlockedDates.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No blocked dates found.</div>
        ) : (
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {visibleBlockedDates.map((block) => (
              <div key={block.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm">{dayjs(block.startDate).format('MMMM D, YYYY')}</span>
                  <span className="text-xs text-muted-foreground">
                    {dayjs(block.startDate).format('hh:mm A')} - {dayjs(block.endDate).format('hh:mm A')}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => deleteBlockMutation.mutate(block.id)}
                  disabled={deleteBlockMutation.isPending}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <BlockDateForm
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          setIsDialogOpen(false)
        }}
        blockedDates={blockedDates}
        availabilityDays={availabilityDays}
      />
    </div>
  )
}

const blockDateFormSchema = z
  .object({
    selectedDates: z.array(z.date()).min(1, 'Please select at least one date'),
    isAllDay: z.boolean(),
    startMinutes: z
      .number()
      .min(0)
      .max(MINUTES_PER_DAY - 1),
    endMinutes: z
      .number()
      .min(0)
      .max(MINUTES_PER_DAY - 1),
  })
  .refine(
    (data) => {
      if (data.isAllDay) return true
      return data.endMinutes > data.startMinutes
    },
    {
      message: 'End time must be after start time',
      path: ['endMinutes'],
    },
  )

type BlockDateFormValues = z.infer<typeof blockDateFormSchema>

function BlockDateForm({ isOpen, onOpenChange, onSuccess, blockedDates, availabilityDays }: BlockDateFormProps) {
  const queryClient = useQueryClient()

  const form = useForm<BlockDateFormValues>({
    resolver: zodResolver(blockDateFormSchema),
    defaultValues: {
      selectedDates: [],
      isAllDay: true,
      startMinutes: 720, // 12:00 PM
      endMinutes: 960, // 4:00 PM
    },
  })

  const bulkCreateMutation = useMutation({
    mutationFn: async (dates: { startDate: string; endDate: string }[]) => {
      const res = await honoClient.server.experts.availability['block-dates']['bulk-create'].$post({
        json: { dates },
      })
      if (!res.ok) throw new Error('Failed to create blocked dates')
      return res.json()
    },
    onSuccess: async (data) => {
      const count = data.count || 0
      toast.success(`Successfully blocked ${count} date${count !== 1 ? 's' : ''}`)
      form.reset()
      onSuccess()
      await queryClient.invalidateQueries({ queryKey: ['expert-availability'] })
    },
    onError: () => {
      toast.error('Failed to block dates')
    },
  })

  const workingDayIndices = new Set(availabilityDays.filter((d) => d.ranges.length > 0).map((d) => d.dayIndex))

  const isDateDisabled = (date: Date) => {
    if (dayjs(date).isBefore(dayjs().startOf('day'))) {
      return true
    }
    if (!workingDayIndices.has(date.getDay())) {
      return true
    }

    const isBlocked = blockedDates.some(
      (block) =>
        dayjs(date).isSame(block.startDate, 'day') ||
        dayjs(date).isSame(block.endDate, 'day') ||
        (dayjs(date).isAfter(block.startDate, 'day') && dayjs(date).isBefore(block.endDate, 'day')),
    )

    if (isBlocked) {
      return true
    }

    return false
  }

  const handleSubmit = form.handleSubmit((data) => {
    const payload = data.selectedDates.map((date) => {
      const baseDate = dayjs(date)

      if (data.isAllDay) {
        return {
          startDate: baseDate.startOf('day').toISOString(),
          endDate: baseDate.endOf('day').toISOString(),
        }
      }

      return {
        startDate: baseDate.startOf('day').add(data.startMinutes, 'minutes').toISOString(),
        endDate: baseDate.startOf('day').add(data.endMinutes, 'minutes').toISOString(),
      }
    })

    bulkCreateMutation.mutate(payload)
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
    }
    onOpenChange(open)
  }

  const isAllDay = form.watch('isAllDay')

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Block Dates</DialogTitle>
          <DialogDescription>Select one or more dates to block.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-6 py-4">
              <div className="border rounded-md self-center p-2">
                <FormField
                  control={form.control}
                  name="selectedDates"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Calendar
                          mode="multiple"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={isDateDisabled}
                          showOutsideDays={false}
                          className="rounded-md border-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-4 px-2 flex-1">
                <FormField
                  control={form.control}
                  name="isAllDay"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox id="all-day" checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel htmlFor="all-day" className="!mt-0 cursor-pointer">
                          All Day Unavailable
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {!isAllDay && (
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="startMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Time</FormLabel>
                          <FormControl>
                            <Select value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))}>
                              <SelectTrigger id="start-time">
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
                      name="endMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Time</FormLabel>
                          <FormControl>
                            <Select value={String(field.value)} onValueChange={(val) => field.onChange(Number(val))}>
                              <SelectTrigger id="end-time">
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
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={bulkCreateMutation.isPending}>
                {bulkCreateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
