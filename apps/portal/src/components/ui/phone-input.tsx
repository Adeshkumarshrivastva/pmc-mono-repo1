import { cn } from '@/lib/utils'
import { Input } from './input'

interface PhoneInputProps extends Omit<React.ComponentProps<'input'>, 'onChange' | 'value'> {
  value?: string
  onChange?: (value: string) => void
  countryCode?: string
}

export default function PhoneInput({ className, value, onChange, countryCode = '91', ...props }: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneNumber = e.target.value
    onChange?.(`${countryCode}${phoneNumber}`)
  }

  const displayValue = value?.startsWith(countryCode) ? value.slice(countryCode.length) : value

  return (
    <div className="flex items-center rounded-md border bg-transparent px-3 py-1 h-9 text-base shadow-xs outline-none focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] md:text-sm selection:bg-primary selection:text-primary-foreground">
      {/* TODO: Add country selector dropdown to dynamically select country code */}
      <div>+{countryCode}</div>
      <Input
        type="text"
        autoComplete="off"
        className={cn('border-none focus:outline-none pl-1 focus-visible:ring-0 focus-visible:border-none', className)}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
    </div>
  )
}
