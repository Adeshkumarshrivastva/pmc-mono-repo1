import { createFileRoute } from '@tanstack/react-router'
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
  const getAllPatientsQuery = useQuery({
    queryKey: ['admin-patients'],
    queryFn: async () => {
      const response = await honoClient.server.patient.patients.$get()

      if (!response.ok) {
        throw new Error('Failed to fetch patients')
      }

      return (await response.json()) as PatientsResponse
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Patients</h1>
        <p className="text-muted-foreground mt-2">Manage all patients in the system</p>
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
