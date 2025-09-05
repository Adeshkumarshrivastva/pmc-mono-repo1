import { match } from 'ts-pattern'
import { useQuery } from '@tanstack/react-query'
import { honoClient } from '@/lib/hono-client'

type ExpertServiceProps = {
  expertSlug: string
  serviceSlug: string
}

export default function ExpertService({ expertSlug, serviceSlug }: ExpertServiceProps) {
  const getServiceQuery = useQuery({
    queryKey: ['expert-service', expertSlug, serviceSlug],
    queryFn: () => fetchExpertService(expertSlug, serviceSlug),
  })

  return (
    <>
      {match(getServiceQuery)
        .returnType<React.ReactNode>()
        .with({ status: 'pending' }, () => <div>Loading...</div>)
        .with({ status: 'error' }, () => <div>Error loading service</div>)
        .with({ status: 'success' }, ({ data: service }) => {
          return (
            <div>
              <div>{service.name}</div>
              <div>By {service.expert.name}</div>
              <div>Price: ₹{service.price}</div>
              <div>Duration: {service.durationInMinutes} minutes</div>
            </div>
          )
        })
        .otherwise(() => null)}
    </>
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
