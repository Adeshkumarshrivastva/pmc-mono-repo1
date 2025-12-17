import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import type { InferResponseType } from 'hono'
import type { ColumnDef } from '@tanstack/react-table'
import { match } from 'ts-pattern'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { honoClient } from '@/lib/hono-client'
import type { HonoClient } from '@/lib/hono-client'
import { DataTable } from '@/components/ui/data-table'
import { TableSkeleton } from '@/components/ui/table-skeleton'

type ExpertsResponse = InferResponseType<HonoClient['server']['experts']['all-experts']['$get'], 200>
type ExpertData = ExpertsResponse[number]

const columns: ColumnDef<ExpertData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.type.toLowerCase().replace('_', ' ')}
      </Badge>
    ),
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => row.original.gender || 'N/A',
  },
  {
    accessorKey: 'city',
    header: 'City',
    cell: ({ row }) => row.original.city || 'N/A',
  },
  {
    accessorKey: 'expertise',
    header: 'Expertise',
    cell: ({ row }) => {
      const expertise = row.original.expertise
      if (!expertise || expertise.length === 0) return 'N/A'
      return (
        <div className="flex flex-wrap gap-1">
          {expertise.slice(0, 2).map((exp) => (
            <Badge key={exp} variant="secondary" className="text-xs">
              {exp}
            </Badge>
          ))}
          {expertise.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{expertise.length - 2}
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'avgRating',
    header: 'Rating',
    cell: ({ row }) => {
      const rating = row.original.avgRating
      return rating ? `${rating.toFixed(1)} / 5` : 'N/A'
    },
  },
]

export const Route = createFileRoute('/_app/admin/experts/')({
  component: AdminExpertsPage,
  beforeLoad: ({ context: { user } }) => {
    if (user.role === 'PATIENT') {
      throw redirect({ to: '/patient/dashboard' })
    }
  },
  pendingComponent: () => {
    return (
      <div className="flex h-screen w-full items-center justify-center gap-2">
        <Spinner />
        <div className="text-muted-foreground text-xs font-medium">Loading...</div>
      </div>
    )
  },
})

function AdminExpertsPage() {
  const getAllExpertsQuery = useQuery({
    queryKey: ['admin-experts'],
    queryFn: async () => {
      const response = await honoClient.server.experts['all-experts'].$get()

      if (!response.ok) {
        throw new Error('Failed to fetch experts')
      }

      return (await response.json()) as ExpertsResponse
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Experts</h1>
        <p className="text-muted-foreground mt-2">Manage all experts in the system</p>
      </div>

      {match(getAllExpertsQuery)
        .returnType<React.ReactNode>()
        .with({ status: 'pending' }, () => <TableSkeleton rows={10} columns={7} />)
        .with({ status: 'error' }, () => (
          <div className="flex h-screen w-full items-center justify-center gap-2">
            <div className="text-muted-foreground text-xs font-medium">Error loading experts</div>
          </div>
        ))
        .with({ status: 'success' }, ({ data }) => (
          <DataTable columns={columns} data={data} emptyMessage="No experts found" />
        ))
        .otherwise(() => null)}
    </div>
  )
}
