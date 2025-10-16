import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/expert/services/$serviceId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Service Details</div>
}
