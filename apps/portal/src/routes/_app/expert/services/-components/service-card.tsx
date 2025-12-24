import { useNavigate } from '@tanstack/react-router'
import { MapPin, Clock, IndianRupee, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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
}

export function ServiceCard({ service }: ServiceCardProps) {
  const navigate = useNavigate()

  return (
    <Card key={service.id} className="hover:shadow-lg transition-all duration-200 h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg font-semibold flex-1 min-w-0">{service.name}</CardTitle>
          <div className="flex gap-2 flex-shrink-0 items-center">
            <div className="flex gap-1">
              {service.availableModes.map((mode) => (
                <Badge key={mode} variant="outline" className="text-xs">
                  {mode === 'IN_PERSON' ? 'In Person' : 'Virtual'}
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                navigate({ to: '/expert/services/$serviceId', params: { serviceId: service.id } })
              }}
              className="h-8 w-8 hover:bg-accent"
            >
              <Pencil className="size-4" />
            </Button>
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
