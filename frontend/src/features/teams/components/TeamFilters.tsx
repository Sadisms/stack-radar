import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface TeamFiltersProps {
    q: string;
    setQ: (q: string) => void;
    pageSize: number;
    setPageSize: (s: number) => void;
    pageSizes: number[];
    setPage: (p: number) => void;
}

export function TeamFilters({
    q, setQ,
    pageSize, setPageSize,
    pageSizes,
    setPage
}: TeamFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                    placeholder="Поиск команд..."
                    value={q}
                    onChange={(e) => {
                        setQ(e.target.value);
                        setPage(1);
                    }}
                    className="pl-8 bg-neutral-950 border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus-visible:ring-neutral-700"
                />
            </div>
            <div className="flex gap-2">
                <Select
                    value={pageSize.toString()}
                    onValueChange={(v) => {
                        setPageSize(Number(v));
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-[80px] bg-neutral-950 border-neutral-800 text-neutral-100 focus:ring-neutral-700">
                        <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-100">
                        {pageSizes.map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
