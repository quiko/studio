'use client';

import * as React from 'react';
import { ChevronsUpDown, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps extends React.HTMLAttributes<HTMLElement> {
  options: Option[];
  selected: string[];
  onSelect: (selectedValues: string[]) => void;
  placeholder?: string;
  label?: string;
  name: string;
}

export const MultiSelect = React.forwardRef<
  HTMLDivElement,
  MultiSelectProps & {
    onValueChange?: (selectedValues: string[]) => void;
    value: string[];
  }
>(({ options, selected, onSelect, placeholder, label, name, onValueChange, value, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);
  const [selectedValues, setSelectedValues] = React.useState<string[]>(value || []);
 
  React.useEffect(() => {
    setSelectedValues(value || []);
  }, [value]);

  const handleSelect = (currentValue: string) => {
    const isSelected = selectedValues.includes(currentValue);
    const newSelectedValues = isSelected
      ? selectedValues.filter((val) => val !== currentValue)
      : [...selectedValues, currentValue];

    setSelectedValues(newSelectedValues);
    onValueChange?.(newSelectedValues);
    onSelect && onSelect(newSelectedValues);
  };

  const handleRemove = (valueToRemove: string) => {
    const newSelectedValues = selectedValues.filter((val) => val !== valueToRemove);
    setSelectedValues(newSelectedValues);
    onValueChange?.(newSelectedValues);
    onSelect && onSelect(newSelectedValues);
  };

  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                'w-full justify-between',
                selectedValues.length === 0 && 'text-muted-foreground'
              )}
              ref={ref}
              name={name}
              {...props}
            >
              <div className="flex flex-wrap gap-1">
                {selectedValues.length === 0 ? (
                  placeholder
                ) : (
                  selectedValues.map((value) => {
                    const option = options.find((opt) => opt.value === value);
                    return (
                      <Badge key={value} variant="secondary" className="flex items-center">
                        {option?.label || value}
                        <span
                          className="ml-1 text-xs cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(value);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </Badge>
                    );
                  })
                )}
              </div>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className={cn(
                      'cursor-pointer',
                      selectedValues.includes(option.value) && 'font-semibold'
                    )}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
});

MultiSelect.displayName = 'MultiSelect';
