import { createFileRoute } from '@tanstack/react-router'
import Navbar from './-components/navbar'
import OurExperts from './-components/expert-card'

export const Route = createFileRoute('/_public/experts/')({
  component: ExpertsPage,
})

function ExpertsPage() {
  return (
    <div>
      <Navbar services={[]} />
      <OurExperts />
    </div>
  )
}
