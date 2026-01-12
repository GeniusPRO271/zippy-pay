import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { IconCirclePlus } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectComboboxProps {
  options: Option[];
  label?: string;
  value?: string[]; // controlled selected values
  onChange?: (values: string[]) => void;
}

export function MultiSelectCombobox({
  options,
  label = "Filter",
  value = [],
  onChange,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const toggleValue = (val: string) => {
    const next = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];

    onChange?.(next);
  };

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
          <div className="flex items-center gap-2">
            <IconCirclePlus size={16} />
            <span>{label}</span>
          </div>

          {value.length > 0 && <Separator orientation="vertical" />}

          <div className="flex items-center gap-1">
            {value.length > 2 ? (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {value.length} selected
              </Badge>
            ) : (
              value.map((val) => {
                const option = options.find((o) => o.value === val);
                return (
                  <Badge key={val} variant="secondary" className="text-xs px-2 py-0">
                    {option?.label ?? val}
                  </Badge>
                );
              })
            )}
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
                    checked={value.includes(item.value)}
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
  );
}
