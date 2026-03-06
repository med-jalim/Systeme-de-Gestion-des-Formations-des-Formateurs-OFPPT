import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { User } from "../types";

interface UsersMultiSelectProps {
  options: User[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const UsersMultiSelect = ({
  options,
  selectedIds,
  onChange,
  placeholder = "Sélectionner des utilisateurs...",
  disabled = false,
}: UsersMultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const toggleSelection = (userId: number) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedIds.length > 0
            ? `${selectedIds.length} utilisateur(s) sélectionné(s)`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Rechercher par nom..." />
          <CommandEmpty>Aucun utilisateur trouvé.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {options.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.first_name} ${user.last_name}`}
                  onSelect={() => toggleSelection(user.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedIds.includes(user.id)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {user.first_name} {user.last_name} ({user.email})
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
