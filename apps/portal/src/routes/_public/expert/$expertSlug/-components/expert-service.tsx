import { match } from 'ts-pattern'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon, UserIcon, ClockIcon, IndianRupeeIcon } from 'lucide-react'
import { honoClient } from '@/lib/hono-client'
import { Button } from '@/components/ui/button'

type ExpertServiceProps = {
  expertSlug: string
  serviceSlug: string
  onBack: () => void
}

export default function ExpertService({ expertSlug, serviceSlug, onBack }: ExpertServiceProps) {
  const getServiceQuery = useQuery({
    queryKey: ['expert-service', expertSlug, serviceSlug],
    queryFn: () => fetchExpertService(expertSlug, serviceSlug),
  })

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        icon={<ArrowLeftIcon className="text-primary size-6" />}
        onClick={() => {
          onBack()
        }}
      />
      {match(getServiceQuery)
        .returnType<React.ReactNode>()
        .with({ status: 'pending' }, () => <div>Loading...</div>)
        .with({ status: 'error' }, () => <div>Error loading service</div>)
        .with({ status: 'success' }, ({ data: service }) => {
          return (
            <div className="space-y-4">
              <div className="text-xl font-semibold">{service.name}</div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full">
                  <UserIcon className="size-6 text-gray-400" />
                </div>
                <div className="text-gray-600">{service.expert.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="size-5 text-gray-600" />
                <div className="text-gray-600">{service.durationInMinutes} minutes</div>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupeeIcon className="size-5 text-gray-600" />
                <div className="text-lg font-medium">{service.price}</div>
              </div>
            </div>
          )
        })
        .otherwise(() => null)}
    </div>
  )
}

const fetchExpertService = async (expertSlug: string, serviceSlug: string) => {
  const res = await honoClient.server.experts[':expertSlug'].service[':serviceSlug'].$get({
    param: { expertSlug, serviceSlug },
  })
  if (!res.ok) {
    throw new Error('Failed to fetch service')
  }

  const service = await res.json()
  return service
}
