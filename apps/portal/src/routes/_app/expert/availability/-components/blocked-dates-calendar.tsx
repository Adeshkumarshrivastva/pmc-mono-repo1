import { useState } from 'react'
import { toast } from 'sonner'
import { TrashIcon } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/check-box'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { honoClient } from '@/lib/hono-client'
import { localMinutesToUtcMinutes, MINUTES_PER_DAY, minutesToDate, toHHMMA, utcMinutesToLocalMinutes } from '@/lib/date'
import dayjs from '@/lib/dayjs'

const SLOT_INTERVAL_MINUTES = 15

const TIME_OPTIONS: { value: number; label: string }[] = (() => {
  const options: { value: number; label: string }[] = []
  for (let m = 0; m < MINUTES_PER_DAY; m += SLOT_INTERVAL_MINUTES) {
    options.push({ value: m, label: toHHMMA(minutesToDate(m, dayjs().toDate())) })
  }
  return options
})()

interface BlockedDatesCalendarProps {
  blockedDates: { id: string; startDate: string; endDate: string }[]
  availabilityDays: { dayIndex: number; ranges: { startMinutes: number; endMinutes: number }[] }[]
}

export function BlockedDatesCalendar({ blockedDates, availabilityDays }: BlockedDatesCalendarProps) {
  const queryClient = useQueryClient()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([])
  const [isAllDay, setIsAllDay] = useState(true)
  const [startMinutes, setStartMinutes] = useState(270)
  const [endMinutes, setEndMinutes] = useState(690)

  const visibleBlockedDates = blockedDates.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )
  const workingDayIndices = new Set(availabilityDays.filter((d) => d.ranges.length > 0).map((d) => d.dayIndex))

  // Create blocked dates
  const bulkCreateMutation = useMutation({
    mutationFn: async (dates: { startDate: number; endDate: number }[]) => {
      const res = await honoClient.server.experts.availability['block-dates']['bulk-create'].$post({
        json: { dates },
      })
      if (!res.ok) throw new Error('Failed to create blocked dates')
      return res.json()
    },
    onSuccess: async (data) => {
      const count = data.count || 0
      toast.success(`Successfully blocked ${count} dates`)
      setIsDialogOpen(false)
      setSelectedDates([])
      await queryClient.invalidateQueries({ queryKey: ['expert-availability'] })
    },
    onError: () => {
      toast.error('Failed to block dates')
    },
  })

  // Delete blocked dates
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

  // Disable certain days in calendar
  const isDateDisabled = (date: Date) => {
    if (dayjs(date).isBefore(dayjs().startOf('day'))) return true
    if (!workingDayIndices.has(date.getDay())) return true

    const isBlocked = blockedDates.some(
      (block) =>
        dayjs(date).isSame(block.startDate, 'day') ||
        dayjs(date).isSame(block.endDate, 'day') ||
        (dayjs(date).isAfter(block.startDate, 'day') && dayjs(date).isBefore(block.endDate, 'day')),
    )

    if (isBlocked) return true

    return false
  }

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
    setSelectedDates([])
    setIsAllDay(true)
    setStartMinutes(270)
    setEndMinutes(690)
  }

  // Handle dialog save
  const handleDialogSave = () => {
    if (!selectedDates || selectedDates.length === 0) {
      toast.error('Please select at least one date')
      return
    }

    const payload = selectedDates.map((date) => {
      const localDate = dayjs(date)

      if (isAllDay) {
        return {
          startDate: localDate.startOf('day').valueOf(),
          endDate: localDate.endOf('day').valueOf(),
        }
      } else {
        const localStartMinutes = utcMinutesToLocalMinutes(startMinutes)
        const localEndMinutes = utcMinutesToLocalMinutes(endMinutes)

        const startHours = Math.floor(localStartMinutes / 60)
        const startMins = localStartMinutes % 60
        const endHours = Math.floor(localEndMinutes / 60)
        const endMins = localEndMinutes % 60

        return {
          startDate: localDate.hour(startHours).minute(startMins).second(0).millisecond(0).valueOf(),
          endDate: localDate.hour(endHours).minute(endMins).second(0).millisecond(0).valueOf(),
        }
      }
    })

    bulkCreateMutation.mutate(payload)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Blocked Dates</h2>
          <p className="text-muted-foreground text-sm">Manage your unavailable dates.</p>
        </div>
        <div>
          <Button onClick={handleOpenDialog}>Block Dates</Button>
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Block Dates</DialogTitle>
            <DialogDescription>Select one or more dates to block.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-6 py-4">
            <div className="border rounded-md self-center p-2">
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={setSelectedDates}
                disabled={isDateDisabled}
                showOutsideDays={false}
                className="rounded-md border-0"
              />
            </div>
            <div className="space-y-4 px-2 flex-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="all-day" checked={isAllDay} onCheckedChange={(c) => setIsAllDay(c === true)} />
                <Label htmlFor="all-day">All Day Unavailable</Label>
              </div>

              {!isAllDay && (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Select
                      value={String(utcMinutesToLocalMinutes(startMinutes))}
                      onValueChange={(val) => setStartMinutes(localMinutesToUtcMinutes(Number(val)))}
                    >
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
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Select
                      value={String(utcMinutesToLocalMinutes(endMinutes))}
                      onValueChange={(val) => setEndMinutes(localMinutesToUtcMinutes(Number(val)))}
                    >
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
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDialogSave} disabled={bulkCreateMutation.isPending || !selectedDates?.length}>
              {bulkCreateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
