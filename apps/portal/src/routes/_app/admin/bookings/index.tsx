import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import { format } from 'date-fns'
import type { InferResponseType } from 'hono'
import type { ColumnDef } from '@tanstack/react-table'
import { match } from 'ts-pattern'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { honoClient } from '@/lib/hono-client'
import type { HonoClient } from '@/lib/hono-client'
import { DataTable } from '@/components/ui/data-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BOOKING_PERIODS, type BookingPeriod } from '@/lib/booking'
import { TablePagination } from '@/components/ui/table-pagination'
import { TableSkeleton } from '@/components/ui/table-skeleton'

type BookingsResponse = InferResponseType<HonoClient['server']['booking']['all-bookings']['$get'], 200>
type BookingData = BookingsResponse['data'][number]

const statusVariants: Record<BookingData['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  BOOKED: 'default',
  CANCELLED: 'destructive',
  COMPLETED: 'outline',
  RESCHEDULED: 'outline',
  NOSHOW: 'destructive',
} as const

const BOOKING_PERIODS_CONFIG: Record<BookingPeriod, { label: string }> = {
  upcoming: {
    label: 'Upcoming Bookings',
  },
  past: {
    label: 'Past Bookings',
  },
}

const columns: ColumnDef<BookingData>[] = [
  {
    accessorKey: 'patientName',
    header: 'Patient Name',
  },
  {
    accessorKey: 'patient.user.phoneNumber',
    header: 'Phone',
    cell: ({ row }) => row.original.patient.user.phoneNumber || 'N/A',
  },
  {
    accessorKey: 'expert.user.name',
    header: 'Expert',
  },
  {
    accessorKey: 'serviceName',
    header: 'Service',
  },
  {
    accessorKey: 'servicePrice',
    header: 'Price',
    cell: ({ row }) => `${row.original.serviceCurrency} ${row.original.servicePrice}`,
  },
  {
    accessorKey: 'startDateTime',
    header: 'Date & Time',
    cell: ({ row }) => format(new Date(row.original.startDateTime), 'PPp'),
  },
  {
    accessorKey: 'mode',
    header: 'Mode',
    cell: ({ row }) => (row.original.mode === 'VIRTUAL' ? 'Virtual' : 'In Person'),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge variant={statusVariants[status]} className="capitalize">
          {status.toLowerCase()}
        </Badge>
      )
    },
  },
]

export const Route = createFileRoute('/_app/admin/bookings/')({
  component: AdminBookingsPage,
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

function AdminBookingsPage() {
  const [period, setPeriod] = useState<BookingPeriod>('upcoming')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const getAllBookingsQuery = useQuery({
    queryKey: ['admin-bookings', period, page, pageSize],
    queryFn: async () => {
      const response = await honoClient.server.booking['all-bookings'].$get({
        query: {
          period,
          page: page.toString(),
          pageSize: pageSize.toString(),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      return (await response.json()) as BookingsResponse
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground mt-2">Manage all bookings in the system</p>
      </div>

      <Tabs value={period} className="w-full">
        <TabsList className="mb-4">
          {BOOKING_PERIODS.map((p) => (
            <TabsTrigger
              key={p}
              value={p}
              onClick={() => {
                setPeriod(p)
                setPage(1)
              }}
            >
              {BOOKING_PERIODS_CONFIG[p].label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={period}>
          {match(getAllBookingsQuery)
            .returnType<React.ReactNode>()
            .with({ status: 'pending' }, () => <TableSkeleton rows={10} columns={5} />)
            .with({ status: 'error' }, () => (
              <div className="flex h-screen w-full items-center justify-center gap-2">
                <div className="text-muted-foreground text-xs font-medium">Error loading bookings</div>
              </div>
            ))
            .with({ status: 'success' }, ({ data }) => (
              <>
                <DataTable
                  hidePagination={true}
                  columns={columns}
                  data={data.data}
                  initialPageSize={pageSize}
                  emptyMessage={`No ${period} bookings found`}
                  className="mb-2"
                />
                <TablePagination
                  page={page}
                  onPageChange={setPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                  totalPages={data.pagination.totalPages}
                />
              </>
            ))
            .otherwise(() => null)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
