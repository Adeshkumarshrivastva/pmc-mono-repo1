import { Skeleton } from './skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table'

import { cn, noise, type WithBasicProps } from '@/lib/utils'

type TableSkeletonProps = WithBasicProps<{ rows: number; columns: number }>

export function TableSkeleton({ rows, columns, className, style }: TableSkeletonProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border', className)} style={style}>
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton
                  className="h-3 w-full"
                  style={{
                    width: `${noise(i, 0.1) * 100}%`,
                  }}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton
                    className="h-5"
                    style={{
                      width: `${noise(colIndex + rowIndex * rows, 0.3) * 100}%`,
                    }}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
