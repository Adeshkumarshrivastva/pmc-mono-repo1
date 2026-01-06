import { useCallback, useMemo, useState } from 'react'
import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { z } from 'zod/v4'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import { Button } from './button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command'
import { cn } from '@/lib/utils'

type ComboboxProps = {
  placeholder?: string
  options: { value: string; label: string }[]
  multiple?: boolean
  value?: string[] | string
  onValueChange?: (value?: string[] | string) => void
  disabled?: boolean
  loading?: boolean
  className?: string
  style?: React.CSSProperties
}

export function Combobox({
  placeholder: _placeholder,
  options,
  multiple,
  value,
  loading,
  onValueChange,
  disabled,
  className,
  style,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)

  const placeholder = useMemo(() => {
    let placeholder: string | undefined
    if (multiple) {
      const result = z.string().array().safeParse(value)
      if (result.success) {
        placeholder = result.data
          .map((v) => options.find((option) => option.value === v))
          .map((item) => item?.label)
          .filter(Boolean)
          .join(', ')
      }
    }
    const result = z.string().safeParse(value)
    if (result.success) {
      placeholder = options.find((option) => option.value === result.data)?.label
    }

    return placeholder || _placeholder
  }, [multiple, _placeholder, options, value])

  const handleSelect = useCallback(
    (selectedValue: string) => {
      return () => {
        if (multiple) {
          const result = z.string().array().safeParse(value)
          if (result.success) {
            if (result.data.includes(selectedValue)) {
              onValueChange?.(result.data.filter((v) => v !== selectedValue))
            } else {
              onValueChange?.([...result.data, selectedValue])
            }
          } else {
            onValueChange?.([selectedValue])
          }
        } else {
          onValueChange?.(selectedValue === value ? undefined : selectedValue)
          setOpen(false)
        }
      }
    },
    [multiple, value, onValueChange],
  )

  const isSelected = useCallback(
    (selectedValue: string) => {
      if (multiple) {
        const result = z.string().array().safeParse(value)
        if (result.success) {
          return result.data.includes(selectedValue)
        }
        return false
      } else {
        return value === selectedValue
      }
    },
    [value, multiple],
  )

  return (
    <Popover modal={true} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          icon={<ChevronDownIcon />}
          iconPosition="right"
          variant="outline"
          size="sm"
          className={cn('justify-between h-10 rounded-lg', className)}
          style={style}
          loading={loading}
        >
          {placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput placeholder="Select..."></CommandInput>
          <CommandList className="max-h-[40vh]">
            <CommandEmpty>No option found</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                return (
                  <CommandItem key={option.value} onSelect={handleSelect(option.value)} disabled={disabled}>
                    <span className="flex-1">{option.label}</span>
                    {isSelected(option.value) ? <CheckIcon className="size-4" /> : null}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
