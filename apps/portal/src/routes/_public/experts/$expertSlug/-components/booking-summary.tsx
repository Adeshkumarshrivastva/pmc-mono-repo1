import { ArrowLeftIcon, UserIcon, ClockIcon, CreditCardIcon, GlobeIcon, CalendarIcon } from 'lucide-react'
import type { InferResponseType } from 'hono'
import type { HonoClient } from '@/lib/hono-client'
import { Button } from '@/components/ui/button'
import { useBooking } from '../-hooks/use-booking'
import { CURRENCY_CONFIG, type BookingMode } from '@/lib/booking'
import { Separator } from '@/components/ui/separator'
import { DEFAULT_TIMEZONE, formatDateTimeRange } from '@/lib/date'
import dayjs from '@/lib/dayjs'
import { SERVICE_MODE_CONFIG } from '@/lib/location'

type BookingSummaryProps = {
  mode: BookingMode
  onBack: () => void
  service: GetServiceQueryResult
}

export default function BookingSummary({ mode, onBack, service }: BookingSummaryProps) {
  const { getSelectedSlot } = useBooking()
  const selectedSlot = getSelectedSlot()

  return (
    <div className="space-y-4">
      <div className="p-4">
        <Button
          variant="ghost"
          icon={<ArrowLeftIcon className="text-primary size-6" />}
          onClick={() => {
            onBack()
          }}
        />
      </div>

      <div className="space-y-8">
        <div className="space-y-2 px-6">
          <div className="text-xl font-semibold">{service.name}</div>
          <div className="flex items-center gap-3">
            {service.expert.image ? (
              <img src={service.expert.image} alt={service.expert.name} className="size-12 rounded-full" />
            ) : (
              <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full">
                <UserIcon className="size-6 text-gray-400" />{' '}
              </div>
            )}
            <div className="text-muted-foreground font-bold">{service.expert.name}</div>
          </div>
        </div>
        <Separator className="hidden xl:block" />
        <div className="space-y-4 px-6">
          <div className="flex items-center gap-2">
            <ClockIcon className="size-5 text-muted-foreground" />
            <div className="text-muted-foreground font-bold text-sm">{service.durationInMinutes} minutes</div>
          </div>
          <div className="flex items-center gap-2">
            <CreditCardIcon className="size-5 text-muted-foreground" />
            <div className="text-muted-foreground font-bold text-sm">
              {CURRENCY_CONFIG[service.currency].symbol}
              {service.price}
            </div>
          </div>
          {service.availableModes.length === 1 ? (
            <div className="flex items-center gap-2">
              {service.availableModes.map((availableMode) => {
                const modeConfig = SERVICE_MODE_CONFIG[availableMode]
                const Icon = modeConfig.icon
                return (
                  <div key={availableMode} className="flex items-center gap-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="size-5 text-muted-foreground" />
                      <div className="text-muted-foreground font-bold text-sm">{modeConfig.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
          {mode.type !== 'select_slot' && selectedSlot ? (
            <>
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-5 text-muted-foreground" />
                <div className="text-muted-foreground font-bold text-sm">
                  {formatDateTimeRange({
                    startDateTime: selectedSlot,
                    endDateTime: dayjs(selectedSlot).add(service.durationInMinutes, 'minutes').toDate(),
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <GlobeIcon className="size-5 text-muted-foreground" />
                <div className="text-muted-foreground font-bold text-sm">{DEFAULT_TIMEZONE}</div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

type GetServiceQueryResult = InferResponseType<
  HonoClient['server']['experts'][':expertSlug']['service'][':serviceSlug']['$get'],
  200
>
