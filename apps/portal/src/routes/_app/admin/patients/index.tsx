import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import type { InferResponseType } from 'hono'
import type { ColumnDef } from '@tanstack/react-table'
import { match } from 'ts-pattern'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { honoClient } from '@/lib/hono-client'
import type { HonoClient } from '@/lib/hono-client'
import { DataTable } from '@/components/ui/data-table'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import dayjs from '@/lib/dayjs'
import { utcDateToLocalDate } from '@/lib/date'

type PatientsResponse = InferResponseType<HonoClient['server']['patient']['patients']['$get'], 200>
type PatientData = PatientsResponse['patients'][number]

const columns: ColumnDef<PatientData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Phone Number',
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email || 'N/A',
  },
  {
    accessorKey: 'timezone',
    header: 'Timezone',
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {row.original.timezone}
      </Badge>
    ),
  },
  {
    accessorKey: 'user.phoneNumber',
    header: 'User Phone',
    cell: ({ row }) => row.original.user?.phoneNumber || 'N/A',
  },
  {
    accessorKey: 'createdAt',
    header: 'Joined Date',
    cell: ({ row }) => {
      return dayjs(utcDateToLocalDate(dayjs(row.original.createdAt).toDate())).format('MMM D, YYYY')
    },
  },
]

export const Route = createFileRoute('/_app/admin/patients/')({
  component: AdminPatientsPage,
  pendingComponent: () => {
    return (
      <div className="flex h-screen w-full items-center justify-center gap-2">
        <Spinner />
        <div className="text-muted-foreground text-xs font-medium">Loading...</div>
      </div>
    )
  },
})

function AdminPatientsPage() {
  const [filter, setFilter] = useState<'all' | 'day' | 'week' | 'month'>('all')

  const getAllPatientsQuery = useQuery({
    queryKey: ['admin-patients', filter],
    queryFn: async () => {
      const query = filter === 'all' ? {} : { filter }
      const response = await honoClient.server.patient.patients.$get({ query })

      if (!response.ok) {
        throw new Error('Failed to fetch patients')
      }

      return (await response.json()) as PatientsResponse
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground mt-2">Manage all patients in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by:</span>
          <Select value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {match(getAllPatientsQuery)
        .returnType<React.ReactNode>()
        .with({ status: 'pending' }, () => <TableSkeleton rows={10} columns={6} />)
        .with({ status: 'error' }, () => (
          <div className="flex h-screen w-full items-center justify-center gap-2">
            <div className="text-muted-foreground text-xs font-medium">Error loading patients</div>
          </div>
        ))
        .with({ status: 'success' }, ({ data }) => (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Total Patients: {data.total}</div>
            </div>
            <DataTable columns={columns} data={data.patients} emptyMessage="No patients found" />
          </div>
        ))
        .otherwise(() => null)}
    </div>
  )
}
