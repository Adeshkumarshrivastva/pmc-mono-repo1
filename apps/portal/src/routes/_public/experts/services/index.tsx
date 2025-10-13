import { createFileRoute } from '@tanstack/react-router'
import Navbar from '../-components/navbar'

export const Route = createFileRoute('/_public/experts/services/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Navbar services={[]} />
      <div>hi there</div>
    </>
  )
}
