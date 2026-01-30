import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { flexRender } from '@tanstack/react-table'
import type { Row } from '@tanstack/react-table'

interface SortableRowProps<T> {
  row: Row<T>
}

export function SortableRow<T extends { id: string }>({ row }: SortableRowProps<T>) {
  const { attributes, listeners, transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="group bg-card hover:bg-muted"
      data-state={isDragging ? 'dragging' : undefined}
    >
      {row.getVisibleCells().map((cell, i) => (
        <td key={cell.id} className={i === 0 ? 'relative px-2 py-2' : 'px-2 py-2'}>
          {i === 0 ? (
            <div className="flex items-center gap-2">
              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </td>
      ))}
    </tr>
  )
}
