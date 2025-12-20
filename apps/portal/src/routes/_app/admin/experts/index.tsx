import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import React, { useState } from 'react'
import type { InferResponseType } from 'hono'
import type { ColumnDef } from '@tanstack/react-table'
import { match } from 'ts-pattern'
import { Edit } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { honoClient } from '@/lib/hono-client'
import type { HonoClient } from '@/lib/hono-client'
import { DataTable } from '@/components/ui/data-table'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ExpertInfoForm from './-components/expert-info-form'
import ExpertAvailabilityForm from './-components/expert-availability-form'

type ExpertsResponse = InferResponseType<HonoClient['server']['experts']['all-experts']['$get'], 200>
type ExpertData = ExpertsResponse[number]

export const Route = createFileRoute('/_app/admin/experts/')({
  component: AdminExpertsPage,
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
  const [selectedExpert, setSelectedExpert] = useState<ExpertData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

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
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedExpert(row.original)
            setDialogOpen(true)
          }}
          icon={<Edit className="h-4 w-4" />}
        >
          Edit
        </Button>
      ),
    },
  ]

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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expert: {selectedExpert?.name}</DialogTitle>
            <DialogDescription>Update expert information and availability</DialogDescription>
          </DialogHeader>

          {selectedExpert && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Expert Information</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="mt-4">
                <ExpertInfoForm
                  expertId={selectedExpert.id}
                  onSuccess={() => {
                    setDialogOpen(false)
                    getAllExpertsQuery.refetch()
                  }}
                />
              </TabsContent>
              <TabsContent value="availability" className="mt-4">
                <ExpertAvailabilityForm
                  expertId={selectedExpert.id}
                  onSuccess={() => {
                    setDialogOpen(false)
                  }}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
