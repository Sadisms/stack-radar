import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import type { TechnologyCategory } from "@/api/client";

interface TechnologyFiltersProps {
    q: string;
    setQ: (q: string) => void;
    statusFilter: string;
    setStatusFilter: (s: string) => void;
    categoryFilter: number | undefined;
    setCategoryFilter: (c: number | undefined) => void;
    pageSize: number;
    setPageSize: (s: number) => void;
    statuses: string[];
    categories: TechnologyCategory[];
    pageSizes: number[];
    setPage: (p: number) => void;
}

export function TechnologyFilters({
    q, setQ,
    statusFilter, setStatusFilter,
    categoryFilter, setCategoryFilter,
    pageSize, setPageSize,
    statuses, categories, pageSizes,
    setPage
}: TechnologyFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                    placeholder="Поиск технологий..."
                    value={q}
                    onChange={(e) => { setPage(1); setQ(e.target.value); }}
                    className="pl-9 bg-neutral-950 border-neutral-800"
                />
            </div>
            <div className="flex gap-2 flex-wrap">
                <Select
                    value={statusFilter || "all"}
                    onValueChange={(v) => { setPage(1); setStatusFilter(v === "all" ? "" : v); }}
                >
                    <SelectTrigger className="w-[160px] bg-neutral-950 border-neutral-800">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-neutral-500" />
                            <SelectValue placeholder="Статус" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        {statuses.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={categoryFilter ? String(categoryFilter) : "all"}
                    onValueChange={(v) => { setPage(1); setCategoryFilter(v === "all" ? undefined : Number(v)); }}
                >
                    <SelectTrigger className="w-[200px] bg-neutral-950 border-neutral-800">
                        <SelectValue placeholder="Категория" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={String(pageSize)}
                    onValueChange={(v) => { setPage(1); setPageSize(Number(v)); }}
                >
                    <SelectTrigger className="w-[130px] bg-neutral-950 border-neutral-800">
                        <SelectValue placeholder="Размер" />
                    </SelectTrigger>
                    <SelectContent>
                        {pageSizes.map((s) => <SelectItem key={s} value={String(s)}>{s} / стр</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
