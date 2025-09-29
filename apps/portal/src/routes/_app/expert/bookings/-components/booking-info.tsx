import {
  MapPinIcon,
  VideoIcon,
  UserIcon,
  PhoneIcon,
  CopyIcon,
  CalendarClockIcon,
  ClipboardListIcon,
} from 'lucide-react'
import { match } from 'ts-pattern'
import { Separator } from '@/components/ui/separator'
import dayjs from '@/lib/dayjs'
import { formatDateTimeRange, utcDateToLocalDate } from '@/lib/date'
import type { Booking } from '@/lib/booking'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PrescriptionArea from './prescription-area'

type BookingInfoProps = {
  booking: Booking
}

export default function BookingInfo({ booking }: BookingInfoProps) {
  return (
    <div className="space-y-6 px-4">
      <div className="mt-2 space-y-2 p-6 rounded-lg border bg-linear-to-b from-primary/10 ">
        <div className="text-xl font-medium">
          {formatDateTimeRange({
            startDateTime: dayjs(booking.startDateTime).toDate(),
            endDateTime: dayjs(booking.endDateTime).toDate(),
            dateFormat: 'dddd, D MMMM',
          })}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <UserIcon className="size-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium">{booking.patientName}</span>
        </div>
        {booking.patient.user.phoneNumber && (
          <div className="flex items-center gap-2 text-sm">
            <PhoneIcon className="size-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{booking.patient.user.phoneNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          {match(booking.mode)
            .returnType<React.ReactNode>()
            .with('IN_PERSON', () => (
              <>
                <MapPinIcon className="size-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">GURGAON</span>
              </>
            ))
            .with('VIRTUAL', () => (
              <>
                <VideoIcon className="size-4 text-muted-foreground flex-shrink-0" />
                <div className="flex items-center gap-1">
                  <Button variant="outline">Join with Google Meet</Button>
                  <Button variant="outline" icon={<CopyIcon />} />
                </div>
              </>
            ))
            .otherwise(() => null)}
        </div>
      </div>

      <div className="border rounded-lg">
        <Tabs defaultValue="booking-details">
          <div className="flex flex-col">
            <div className="flex items-center p-4">
              <TabsList>
                <TabsTrigger value="booking-details">Booking Details</TabsTrigger>
                <TabsTrigger value="patient-details">Patient Details</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescription</TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <TabsContent value="booking-details" className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <ClipboardListIcon className="size-4 text-muted-foreground flex-shrink-0" />
                  <span className="hidden sm:block">Event: </span>
                  <span>{booking.serviceName}</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <CalendarClockIcon className="size-4 text-muted-foreground flex-shrink-0" />
                  <span className="hidden sm:block">Date & Time: </span>
                  <span>
                    {formatDateTimeRange({
                      startDateTime: dayjs(booking.startDateTime).toDate(),
                      endDateTime: dayjs(booking.endDateTime).toDate(),
                    })}
                  </span>
                </div>
                <div className="text-xs">
                  Booked on {dayjs(utcDateToLocalDate(dayjs(booking.createdAt).toDate())).format('D MMMM YYYY')}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="patient-details" className="p-4">
              Patient Details
            </TabsContent>
            <TabsContent value="prescriptions" className="p-4">
              <PrescriptionArea prescription={booking.prescription[0]} bookingId={booking.id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
