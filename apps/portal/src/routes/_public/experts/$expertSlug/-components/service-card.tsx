import { Clock } from 'lucide-react'
import type { ServiceMode } from '@pmc/server/src/generated/prisma/client'
import type { InferResponseType } from 'hono'
import { Button } from '@/components/ui/button'
import { CURRENCY_CONFIG } from '@/lib/booking'
import { SERVICE_MODE_CONFIG } from '@/lib/service'
import { type HonoClient } from '@/lib/hono-client'

type ExpertWithDetails = InferResponseType<HonoClient['server']['experts'][':expertSlug']['$get'], 200>['expert']

export function ServiceCard({
  service,
  onBook,
}: {
  service: ExpertWithDetails['servicesProvided'][number]
  onBook: () => void
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:border-primary/20">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">{service.name}</h3>
        </div>
        <div className="text-right ml-4 flex-shrink-0">
          <div className="text-xl font-bold text-primary">
            {`${CURRENCY_CONFIG[service.currency].symbol} ${service.price}`}
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3" />
            {service.durationInMinutes}min
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        {service.availableModes.map((mode: ServiceMode) => {
          const modeConfig = SERVICE_MODE_CONFIG[mode]
          const ServiceIcon = modeConfig.icon

          return (
            <div
              key={mode}
              className="flex items-center gap-1 px-2 py-1 bg-muted/50 border border-border rounded-md text-sm"
            >
              <ServiceIcon className="w-3 h-3 text-muted-foreground" />
              <span className="text-foreground">{modeConfig.label}</span>
            </div>
          )
        })}
      </div>

      <Button
        onClick={onBook}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-2 text-sm font-medium transition-colors"
      >
        Book Session
      </Button>
    </div>
  )
}
