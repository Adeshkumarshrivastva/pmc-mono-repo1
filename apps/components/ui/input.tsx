import { forwardRef } from 'react'
import { SearchIcon } from 'lucide-react'
import { match } from 'ts-pattern'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  addonBefore?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, style, type, addonBefore, ...props }, ref) => {
  return (
    <div
      className={cn(
        'flex h-9 w-full items-center overflow-hidden rounded-md border border-input bg-transparent focus-within:outline-none focus-within:ring-1 focus-within:ring-ring',
        className,
      )}
      style={style}
    >
      {addonBefore ? (
        <div className="flex-shrink-0 self-stretch flex items-center justify-center">{addonBefore}</div>
      ) : null}
      <input
        type={type}
        className="flex h-full flex-1 appearance-none px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-within:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-w-0 bg-transparent"
        ref={ref}
        {...props}
      />
      {match(type)
        .with('search', () => (
          <div className="text-primary-foreground flex-shrink-0 px-4 self-stretch flex items-center justify-center bg-primary">
            <SearchIcon className="h-5 w-5" />
          </div>
        ))
        .otherwise(() => null)}
    </div>
  )
})

Input.displayName = 'Input'
export { Input }
