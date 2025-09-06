import type { Service } from '@pmc/server/src/generated/prisma/client'
import { createFileRoute } from '@tanstack/react-router'
import Navbar from './-components/navbar'
import OurExperts from './-components/expert-card'

// Mock services data - replace with your actual data fetching
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Anxiety Treatment',
    subservices: {
      docs: [
        { id: '1a', name: 'Cognitive Therapy', slug: 'cognitive-therapy' },
        { id: '1b', name: 'Exposure Therapy', slug: 'exposure-therapy' },
      ],
    },
  },
  {
    id: '2',
    name: 'Depression Treatment',
    subservices: {
      docs: [
        { id: '2a', name: 'CBT', slug: 'cbt' },
        { id: '2b', name: 'Mindfulness', slug: 'mindfulness' },
      ],
    },
  },
]

export const Route = createFileRoute('/_public/experts/page')({
  component: ExpertsPage,
})

function ExpertsPage() {
  return (
    <div>
      <Navbar services={mockServices} />

      <OurExperts />
    </div>
  )
}
