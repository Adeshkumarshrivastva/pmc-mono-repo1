import { cloneElement, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center space-x-2 rounded-lg text-lg transition-colors cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50',
        secondary:
          'bg-accent text-accent-foreground hover:bg-accent/80 disabled:pointer-events-none disabled:opacity-50',
        outline: 'border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-12 px-4 py-3',
        icon: 'h-9 w-9 justify-center',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const iconVariants = cva('flex-shrink-0', {
  variants: {
    type: {
      withChildren: 'size-6',
      withoutChildren: 'block size-6',
    },
  },
  defaultVariants: {
    type: 'withChildren',
  },
})

export interface BaseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const Comp = 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {children}
      </Comp>
    )
  },
)
BaseButton.displayName = 'BaseButton'

type ButtonProps = BaseButtonProps & {
  loading?: boolean
  icon?: React.ReactElement<{ className?: string }>
  iconPosition?: 'left' | 'right'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading, icon, iconPosition = 'left', children, ...props }, ref) => {
    const iconElement = icon
      ? cloneElement(icon, {
          className: cn(
            iconVariants({
              type: children ? 'withChildren' : 'withoutChildren',
            }),
            icon.props.className,
            'text-current',
          ),
        })
      : null

    return (
      <BaseButton {...props} data-loading={loading} ref={ref}>
        {iconPosition === 'left' && iconElement}
        {children ? <span>{children}</span> : null}
        {iconPosition === 'right' && iconElement}
      </BaseButton>
    )
  },
)

Button.displayName = 'Button'

export { BaseButton, Button }
