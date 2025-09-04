import type { Service } from '@pmc/server/src/generated/prisma/client'
import { createFileRoute } from '@tanstack/react-router'
import Navbar from './-components/navbar'
import { honoClient } from '@/lib/hono-client'

const serviceQuery = honoClient.server.

export const Route = createFileRoute('/_public/experts/page')({
  component: ExpertsPage,
})

function ExpertsPage() {
  return (
    <div>
      <Navbar services={mockServices} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Our Experts</h1>
        <div>Experts Page Content</div>
      </main>
    </div>
  )
}
