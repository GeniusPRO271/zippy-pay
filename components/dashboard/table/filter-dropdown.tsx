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
import { Table } from "@tanstack/react-table"

interface Option {
  value: string
  label: string
}

interface MultiSelectComboboxProps<TData> {
  table: Table<TData>
  columnId: string
  options: Option[]
  label?: string
}

export function MultiSelectCombobox<TData>({
  table,
  columnId,
  options,
  label = "Filter",
}: MultiSelectComboboxProps<TData>) {
  const [open, setOpen] = React.useState(false)

  // Get the current values from the table state
  const values: string[] =
    (table.getState().columnFilters.find((f) => f.id === columnId)?.value as string[]) || []

  const toggleValue = (val: string) => {
    const newValues = values.includes(val)
      ? values.filter((v) => v !== val)
      : [...values, val]

    // Update the table filter
    table.setColumnFilters((filters) => {
      const existingFilter = filters.find((f) => f.id === columnId)
      if (existingFilter) {
        return newValues.length > 0
          ? filters.map((f) =>
            f.id === columnId ? { ...f, value: newValues } : f
          )
          : filters.filter((f) => f.id !== columnId)
      } else if (newValues.length > 0) {
        return [...filters, { id: columnId, value: newValues }]
      }
      return filters
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="border-dashed flex items-center justify-between gap-2"
        >
          <div className="flex items-center justify-center gap-2">
            <IconCirclePlus size={16} />
            <span>{label}</span>
          </div>
          {values.length > 0 && <Separator orientation="vertical" />}
          <div className="flex items-center gap-1">
            {values.length > 2 ? (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {values.length} selected
              </Badge>
            ) : values.length > 0 ? (
              values.map((val) => {
                const option = options.find((f) => f.value === val)
                return (
                  <Badge
                    key={val}
                    variant="secondary"
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
                  value={item.value}
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
