import { GripVertical } from 'lucide-react'
import type { Row } from '@tanstack/react-table'
import { flexRender } from '@tanstack/react-table'

interface StaticTableRowProps<T> {
  row: Row<T>
}

export function StaticTableRow<T>({ row }: StaticTableRowProps<T>) {
  return (
    <tr className="group bg-muted shadow-md">
      {row.getVisibleCells().map((cell, i) => {
        const cellClasses = 'px-4 py-2'
        if (i === 0) {
          return (
            <td key={cell.id} className={cellClasses}>
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grabbing" />
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </td>
          )
        }
        return (
          <td key={cell.id} className={cellClasses}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      })}
    </tr>
  )
}
