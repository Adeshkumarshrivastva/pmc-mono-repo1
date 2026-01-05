import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useMutation } from '@tanstack/react-query'
import React, { useState } from 'react'
import type { InferResponseType } from 'hono'
import type { ColumnDef } from '@tanstack/react-table'
import { match } from 'ts-pattern'
import { Edit, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { honoClient } from '@/lib/hono-client'
import type { HonoClient } from '@/lib/hono-client'
import { DataTable } from '@/components/ui/data-table'
import { TableSkeleton } from '@/components/ui/table-skeleton'
import { queryClient } from '@/lib/query-client'

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [expertToDelete, setExpertToDelete] = useState<{ id: string; name: string } | null>(null)

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

  const deleteMutation = useMutation({
    mutationFn: async (expertId: string) => {
      const response = await honoClient.server.admin.experts[':expertId'].$delete({
        param: { expertId },
      })

      if (!response.ok) {
        const error = (await response.json()) as { error?: string }
        throw new Error(error.error || 'Failed to delete expert')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Expert deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['admin-experts'] })
      setDeleteDialogOpen(false)
      setExpertToDelete(null)
    },
    onError: (error: Error) => {
      toast.error('Failed to delete expert', {
        description: error.message,
      })
    },
  })

  const handleDeleteClick = (expert: ExpertData) => {
    setExpertToDelete({ id: expert.id, name: expert.name })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (expertToDelete) {
      deleteMutation.mutate(expertToDelete.id)
    }
  }

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
        <div className="flex gap-2">
          <Link to="/admin/experts/$expertId/edit" params={{ expertId: row.original.id }}>
            <Button variant="outline" size="sm" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            icon={<Trash2 className="size-4" />}
            onClick={() => {
              handleDeleteClick(row.original)
            }}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Experts</h1>
          <p className="text-muted-foreground mt-2">Manage all experts in the system</p>
        </div>
        <Link to="/admin/experts/add">
          <Button icon={<Plus className="h-4 w-4" />}>Add Expert</Button>
        </Link>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Expert</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{expertToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
