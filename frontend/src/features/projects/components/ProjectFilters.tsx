import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import type { Team } from "@/api/client";

interface ProjectFiltersProps {
    q: string;
    setQ: (q: string) => void;
    statusFilter: string;
    setStatusFilter: (s: string) => void;
    teamFilter: number | undefined;
    setTeamFilter: (id: number | undefined) => void;
    pageSize: number;
    setPageSize: (s: number) => void;
    teams: Team[];
    pageSizes: number[];
    setPage: (p: number) => void;
}

export function ProjectFilters({
    q, setQ,
    statusFilter, setStatusFilter,
    teamFilter, setTeamFilter,
    pageSize, setPageSize,
    teams, pageSizes,
    setPage
}: ProjectFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-500" />
                <Input
                    placeholder="Поиск проектов..."
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
                    value={statusFilter}
                    onValueChange={(v) => {
                        setStatusFilter(v === "all" ? "" : v);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-[180px] bg-neutral-950 border-neutral-800 text-neutral-100 focus:ring-neutral-700">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-100">
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={teamFilter?.toString() || "all"}
                    onValueChange={(v) => {
                        setTeamFilter(v === "all" ? undefined : Number(v));
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-[180px] bg-neutral-950 border-neutral-800 text-neutral-100 focus:ring-neutral-700">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Команда" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-100">
                        <SelectItem value="all">Все команды</SelectItem>
                        {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id.toString()}>
                                {team.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

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
