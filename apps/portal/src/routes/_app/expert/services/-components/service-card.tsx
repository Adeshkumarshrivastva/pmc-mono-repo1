import { MapPin, Clock, IndianRupee } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ServiceCardProps {
  service: {
    id: string
    name: string
    price: number
    durationInMinutes: number
    city: string
    country: string
    availableModes: ('IN_PERSON' | 'VIRTUAL')[]
  }
  onClick?: () => void
}

export function ServiceCard({ service, onClick }: ServiceCardProps) {
  return (
    <Card
      key={service.id}
      className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg font-semibold flex-1 min-w-0">{service.name}</CardTitle>
          <div className="flex gap-1 flex-shrink-0">
            {service.availableModes.map((mode) => (
              <Badge key={mode} variant="outline" className="text-xs">
                {mode === 'IN_PERSON' ? 'In Person' : 'Virtual'}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <IndianRupee className="size-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground font-bold">₹{service.price}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="size-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground font-bold">{service.durationInMinutes} minutes</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="size-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground font-bold">
            {service.city}, {service.country}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
