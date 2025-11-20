import { ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export interface Option {
    label: string
    value: string
}

interface MultiSelectProps {
    options: Option[]
    selected: string[]
    onChange: (selected: string[]) => void
    placeholder?: string
    className?: string
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    className,
}: MultiSelectProps) {
    const handleSelect = (value: string) => {
        if (selected.includes(value)) {
            onChange(selected.filter((item) => item !== value))
        } else {
            onChange([...selected, value])
        }
    }

    const selectedLabels = selected
        .map((value) => options.find((option) => option.value === value)?.label)
        .filter(Boolean)

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className={cn("w-full justify-between h-auto min-h-10", className)}
                >
                    <div className="flex flex-wrap gap-1 text-left font-normal">
                        {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
                        {selectedLabels.map((label) => (
                            <Badge variant="secondary" key={label} className="mr-1 mb-1">
                                {label}
                            </Badge>
                        ))}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuLabel>{placeholder}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={selected.includes(option.value)}
                            onCheckedChange={() => handleSelect(option.value)}
                            onSelect={(e) => e.preventDefault()}
                        >
                            {option.label}
                        </DropdownMenuCheckboxItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
