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
import { Input } from '@/components/ui/input'
import { honoClient } from '@/lib/hono-client'
import dayjs from '@/lib/dayjs'

interface BlockedDatesCalendarProps {
  blockedDates: { id: string; startDate: string; endDate: string }[]
  availabilityDays: { dayIndex: number; ranges: { startMinutes: number; endMinutes: number }[] }[]
}

export function BlockedDatesCalendar({ blockedDates, availabilityDays }: BlockedDatesCalendarProps) {
  const queryClient = useQueryClient()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([])
  const [isAllDay, setIsAllDay] = useState(true)
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('17:00')

  const visibleBlockedDates = blockedDates.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )
  const workingDayIndices = new Set(availabilityDays.filter((d) => d.ranges.length > 0).map((d) => d.dayIndex))

  // Create blocked dates
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

  // Check if date is disabled
  const isDateDisabled = (date: Date) => {
    const today = dayjs().startOf('day')
    const currentMetricInfo = dayjs(date)

    if (currentMetricInfo.isBefore(today)) return true
    const dayIndex = date.getDay()
    if (!workingDayIndices.has(dayIndex)) return true
    return false
  }

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
    setSelectedDates([])
    setIsAllDay(true)
    setStartTime('10:00')
    setEndTime('17:00')
  }

  // Handle dialog save
  const handleDialogSave = () => {
    if (!selectedDates || selectedDates.length === 0) {
      toast.error('Please select at least one date')
      return
    }
    const payload = selectedDates.map((date) => {
      let start = dayjs(date)
      let end = dayjs(date)
      if (isAllDay) {
        start = start.startOf('day')
        end = end.endOf('day')
      } else {
        const [startHour, startMinute] = startTime.split(':').map(Number)
        const [endHour, endMinute] = endTime.split(':').map(Number)

        start = start.hour(startHour).minute(startMinute)
        end = end.hour(endHour).minute(endMinute)
      }
      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
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
                className="rounded-md border-0"
              />
            </div>
            <div className="space-y-4 px-2 flex-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="all-day" checked={isAllDay} onCheckedChange={(c) => setIsAllDay(c === true)} />
                <Label htmlFor="all-day">All Day Unavailable</Label>
              </div>

              {!isAllDay && (
                <div className="grid grid-rows-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
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
