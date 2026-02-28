
import { useState } from "react";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, ChevronDown } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// [FIX] The interface is now EXPORTED to be available across the project.
export interface SelectorOption {
  value: string;
  label: string;
  logo_url?: string | null;
}

interface SearchableSelectorProps {
  options: SelectorOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  showLogo?: boolean;
  className?: string;
}

const SearchableSelector = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyText = "No options found.",
  disabled = false,
  showLogo = false,
  className,
}: SearchableSelectorProps) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (currentValue: string) => {
    onChange(currentValue === value ? "" : currentValue);
    setOpen(false);
  };

  // [EMERGENCY FIX] Corrected the triple quotes to double quotes.
  const ImgWithFallback = ({ src, alt }: { src: string | null | undefined, alt: string }) => (
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      className="w-6 h-6 object-contain mr-2"
      onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
    />
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <div className="flex items-center truncate">
            {showLogo && selectedOption && <ImgWithFallback src={selectedOption.logo_url} alt={selectedOption.label} />}
            <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandList>
            <ScrollArea className="h-72">
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label} // Search by label
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {showLogo && <ImgWithFallback src={option.logo_url} alt={option.label} />}
                    <span>{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
               <div className="flex justify-center items-center p-2 opacity-50">
                <ChevronDown className="h-5 w-5" />
              </div>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelector;
