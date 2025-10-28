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
  field: {
    value: string[]
    onChange: (values: string[]) => void
  }
  fieldState?: {
    invalid?: boolean
    error?: any
  }
  options: Option[]
  label?: string
}

export function PopoverMultiSelect({
  field,
  fieldState,
  options,
  label = "Select",
}: PopoverMultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const values = field.value || []

  const toggleValue = (val: string) => {
    const newValues = values.includes(val)
      ? values.filter((v) => v !== val)
      : [...values, val]
    field.onChange(newValues)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="border-dashed flex items-center gap-2"
          aria-invalid={fieldState?.invalid ? "true" : "false"}
        >
          <div className="flex items-center justify-start w-full gap-2">
            <IconCirclePlus size={16} />
            <span>{label}</span>
          </div>
          {values.length > 0 && <Separator orientation="vertical" />}
          <div className="flex items-center gap-1">
            {values.length > 2 ? (
              <Badge className="text-xs px-2 py-0">
                {values.length} selected
              </Badge>
            ) : values.length > 0 ? (
              values.map((val) => {
                const option = options.find((f) => f.value === val)
                return (
                  <Badge
                    key={val}
                    className="text-xs px-2 py-0"
                  >
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
                  value={item.label}
                  className="flex items-center gap-2"
                  onSelect={() => toggleValue(item.value)}
                >
                  <Checkbox
                    checked={values.includes(item.value)}
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
