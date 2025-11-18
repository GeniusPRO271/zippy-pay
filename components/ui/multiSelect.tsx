"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { IconCirclePlus } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

interface Option {
  value: string
  label: string
}

interface PopoverMultiSelectProps {
  value?: string[]
  onChange?: (values: string[]) => void
  options: Option[]
  label?: string
  disabled?: boolean
}

export function PopoverMultiSelect({
  value = [],
  onChange,
  options,
  label = "Select",
  disabled = false,
}: PopoverMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedValues, setSelectedValues] = React.useState<string[]>(value)

  React.useEffect(() => {
    setSelectedValues([])
    onChange?.([])
  }, [])

  const toggleValue = (val: string) => {
    const newValues = selectedValues.includes(val)
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val]
    setSelectedValues(newValues)
    onChange?.(newValues)
  }

  return (
    <Popover open={open} onOpenChange={(o) => !disabled && setOpen(o)}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={`border-dashed flex items-center gap-2 ${disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          <div className="flex items-center justify-start w-full gap-2">
            <IconCirclePlus size={16} />
            <span>{label}</span>
          </div>
          {selectedValues.length > 0 && <Separator orientation="vertical" />}
          <div className="flex items-center gap-1">
            {selectedValues.length > 2 ? (
              <Badge className="text-xs px-2 py-0">
                {selectedValues.length} selected
              </Badge>
            ) : selectedValues.length > 0 ? (
              selectedValues.map((val) => {
                const option = options.find((f) => f.value === val)
                return (
                  <Badge key={val} className="text-xs px-2 py-0">
                    {option?.label ?? val}
                  </Badge>
                )
              })
            ) : null}
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[180px] p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${label.toLowerCase()}...`}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  className="flex items-center gap-2"
                  onSelect={() => toggleValue(item.value)}
                >
                  <Checkbox
                    checked={selectedValues.includes(item.value)}
                    onCheckedChange={() => toggleValue(item.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
