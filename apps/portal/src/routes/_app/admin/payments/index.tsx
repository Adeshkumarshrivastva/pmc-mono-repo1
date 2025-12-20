import { createFileRoute } from '@tanstack/react-router'
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
import { TablePagination } from '@/components/ui/table-pagination'
import { TableSkeleton } from '@/components/ui/table-skeleton'

type PaymentsResponse = InferResponseType<HonoClient['server']['payment']['payments']['$get'], 200>
type PaymentData = PaymentsResponse['data'][number]

const statusVariants: Record<PaymentData['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'secondary',
  COMPLETED: 'default',
  FAILED: 'destructive',
  REFUNDED: 'outline',
} as const

const columns: ColumnDef<PaymentData>[] = [
  {
    accessorKey: 'booking.patientName',
    header: 'Patient Name',
    cell: ({ row }) => row.original.booking.patientName,
  },
  {
    accessorKey: 'patient.user.phoneNumber',
    header: 'Phone',
    cell: ({ row }) => row.original.patient.user.phoneNumber || 'N/A',
  },
  {
    accessorKey: 'expert.user.name',
    header: 'Expert',
    cell: ({ row }) => row.original.expert.user.name,
  },
  {
    accessorKey: 'serviceName',
    header: 'Service',
  },
  {
    accessorKey: 'amountPaid',
    header: 'Amount Paid',
    cell: ({ row }) => `${row.original.amountCurrency} ${row.original.amountPaid}`,
  },
  {
    accessorKey: 'servicePrice',
    header: 'Service Price',
    cell: ({ row }) => `${row.original.serviceCurrency} ${row.original.servicePrice}`,
  },
  {
    accessorKey: 'paymentMode',
    header: 'Payment Mode',
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.paymentMode.toLowerCase()}
      </Badge>
    ),
  },
  {
    accessorKey: 'isPartialPayment',
    header: 'Partial',
    cell: ({ row }) => (row.original.isPartialPayment ? 'Yes' : 'No'),
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
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => format(new Date(row.original.createdAt), 'PP'),
  },
]

export const Route = createFileRoute('/_app/admin/payments/')({
  component: AdminPaymentsPage,

  pendingComponent: () => {
    return (
      <div className="flex h-screen w-full items-center justify-center gap-2">
        <Spinner />
        <div className="text-muted-foreground text-xs font-medium">Loading...</div>
      </div>
    )
  },
})

function AdminPaymentsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const getPaymentsQuery = useQuery({
    queryKey: ['admin-payments', page, pageSize],
    queryFn: async () => {
      const response = await honoClient.server.payment.payments.$get({
        query: {
          page: page.toString(),
          pageSize: pageSize.toString(),
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch payments')
      }

      return (await response.json()) as PaymentsResponse
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="text-muted-foreground mt-2">Manage all payments in the system</p>
      </div>

      {match(getPaymentsQuery)
        .returnType<React.ReactNode>()
        .with({ status: 'pending' }, () => <TableSkeleton rows={10} columns={10} />)
        .with({ status: 'error' }, () => (
          <div className="flex h-screen w-full items-center justify-center gap-2">
            <div className="text-muted-foreground text-xs font-medium">Error loading payments</div>
          </div>
        ))
        .with({ status: 'success' }, ({ data }) => (
          <>
            <DataTable
              hidePagination={true}
              columns={columns}
              data={data.data}
              initialPageSize={pageSize}
              emptyMessage="No payments found"
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
    </div>
  )
}
