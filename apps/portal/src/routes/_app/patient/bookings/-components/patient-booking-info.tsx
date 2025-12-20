import { UserIcon, PhoneIcon, CopyIcon, CalendarClockIcon, ClipboardListIcon, ExternalLinkIcon } from 'lucide-react'
import { match } from 'ts-pattern'
import { toast } from 'sonner'
import type { InferResponseType } from 'hono/client'
import { Separator } from '@/components/ui/separator'
import dayjs from '@/lib/dayjs'
import { formatDateTimeRange, utcDateToLocalDate } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { inPersonLocationSchema, SERVICE_MODE_CONFIG, virtualLocationSchema } from '@/lib/location'
import type { honoClient } from '@/lib/hono-client'
import PrescriptionArea from './prescription-area'
import PaymentArea from './payment-area'

type PatientBookingsResponse = InferResponseType<(typeof honoClient)['server']['patient']['bookings']['$get'], 200>

type Booking = PatientBookingsResponse['bookings'][number]

type PatientBookingInfoProps = {
  booking: Booking
}

export default function PatientBookingInfo({ booking }: PatientBookingInfoProps) {
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
          <span className="font-medium">{booking.expert?.user?.name || booking.expert?.name || 'Unknown Expert'}</span>
        </div>
        {booking.expert?.user?.phoneNumber && (
          <div className="flex items-center gap-2 text-sm">
            <PhoneIcon className="size-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">{booking.expert.user.phoneNumber}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          {match(booking.mode)
            .returnType<React.ReactNode>()
            .with('IN_PERSON', () => {
              const inPersonLocation = inPersonLocationSchema.parse(booking.inPersonLocation)
              const Icon = SERVICE_MODE_CONFIG['IN_PERSON'].icon
              return (
                <>
                  <Icon className="size-4 text-muted-foreground shrink-0" />
                  <div className="space-y-1">
                    <div className="text-muted-foreground font-bold text-sm">{inPersonLocation?.address}</div>
                    {inPersonLocation?.googleMapLink ? (
                      <a
                        href={inPersonLocation.googleMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        Google Map Link
                        <ExternalLinkIcon className="size-3.5" />
                      </a>
                    ) : null}
                  </div>
                </>
              )
            })
            .with('VIRTUAL', () => {
              const virtualLocation = virtualLocationSchema.parse(booking.virtualLocation)
              const Icon = SERVICE_MODE_CONFIG['VIRTUAL'].icon

              return virtualLocation ? (
                <>
                  <Icon className="size-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex items-center gap-1">
                    <a href={virtualLocation.meetLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">Join with Google Meet</Button>
                    </a>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(virtualLocation.meetLink)
                        toast.success('Copied to clipboard successfully')
                      }}
                      variant="outline"
                      icon={<CopyIcon />}
                    />
                  </div>
                </>
              ) : null
            })
            .otherwise(() => null)}
        </div>
      </div>

      <div className="border rounded-lg overflow-y-auto">
        <Tabs defaultValue="booking-details">
          <div className="flex flex-col">
            <div className="flex items-center p-4">
              <TabsList className="gap-2">
                <TabsTrigger value="booking-details">Booking Details</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescription</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
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
            <TabsContent value="prescriptions" className="p-4">
              <PrescriptionArea prescription={booking.prescription[0]} />
            </TabsContent>
            <TabsContent value="payment" className="p-4">
              <PaymentArea payment={booking.payments[0]} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
