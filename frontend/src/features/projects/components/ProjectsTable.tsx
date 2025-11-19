import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { MoreHorizontal, ExternalLink, Edit, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { Project, Team } from "@/api/client";

interface ProjectsTableProps {
    items: Project[];
    loading: boolean;
    teams: Team[];
    onOpenEdit: (project: Project) => void;
    setDeleteId: (id: number) => void;
    total: number;
    page: number;
    setPage: (p: number | ((prev: number) => number)) => void;
    totalPages: number;
    sortBy: "name" | "status" | "created_at" | "team_id";
    sortOrder: "asc" | "desc";
    onSort: (field: "name" | "status" | "created_at" | "team_id") => void;
}

export function ProjectsTable({
    items, loading, teams,
    onOpenEdit, setDeleteId,
    total, page, setPage, totalPages,
    sortBy, sortOrder, onSort
}: ProjectsTableProps) {

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'default';
            case 'completed': return 'secondary';
            case 'on_hold': return 'outline';
            case 'cancelled': return 'destructive';
            default: return 'secondary';
        }
    };

    const SortIcon = ({ field }: { field: "name" | "status" | "created_at" | "team_id" }) => {
        if (sortBy !== field) return <ArrowUpDown className="ml-2 h-4 w-4 text-neutral-600" />;
        return sortOrder === "asc" ? <ArrowUp className="ml-2 h-4 w-4 text-primary" /> : <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
    };

    return (
        <>
            <div className="rounded-md border border-neutral-800">
                <Table>
                    <TableHeader>
                        <TableRow className="border-neutral-800 hover:bg-neutral-900/50">
                            <TableHead
                                className="text-neutral-400 cursor-pointer hover:text-neutral-200 transition-colors"
                                onClick={() => onSort("name")}
                            >
                                <div className="flex items-center">
                                    Название
                                    <SortIcon field="name" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-neutral-400 cursor-pointer hover:text-neutral-200 transition-colors"
                                onClick={() => onSort("team_id")}
                            >
                                <div className="flex items-center">
                                    Команда
                                    <SortIcon field="team_id" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-neutral-400 cursor-pointer hover:text-neutral-200 transition-colors"
                                onClick={() => onSort("status")}
                            >
                                <div className="flex items-center">
                                    Статус
                                    <SortIcon field="status" />
                                </div>
                            </TableHead>
                            <TableHead className="text-neutral-400">Репозиторий</TableHead>
                            <TableHead
                                className="text-neutral-400 cursor-pointer hover:text-neutral-200 transition-colors"
                                onClick={() => onSort("created_at")}
                            >
                                <div className="flex items-center">
                                    Создан
                                    <SortIcon field="created_at" />
                                </div>
                            </TableHead>
                            <TableHead className="text-right text-neutral-400">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-neutral-500">
                                    Загрузка...
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-neutral-500">
                                    Проекты не найдены
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((p) => {
                                const teamName = teams.find(t => t.id === p.team_id)?.name ?? "—";
                                return (
                                    <TableRow key={p.id} className="border-neutral-800 hover:bg-neutral-900/50">
                                        <TableCell className="font-medium text-neutral-200">
                                            <div>{p.name}</div>
                                            {p.description && (
                                                <div className="text-xs text-neutral-500 truncate max-w-[200px]">{p.description}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-neutral-300">{teamName}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(p.status) as any}>
                                                {p.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {p.repository_url ? (
                                                <a
                                                    href={p.repository_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-neutral-400 hover:text-primary transition-colors"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    <span className="text-sm">Перейти</span>
                                                </a>
                                            ) : <span className="text-neutral-600">—</span>}
                                        </TableCell>
                                        <TableCell className="text-neutral-400 text-sm">
                                            {new Date(p.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Открыть меню</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => onOpenEdit(p)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Редактировать
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => setDeleteId(p.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Удалить
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-neutral-500">
                    Всего: {total}
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                aria-disabled={page <= 1}
                                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
                            const n = idx + 1;
                            return (
                                <PaginationItem key={n}>
                                    <PaginationLink
                                        isActive={n === page}
                                        onClick={() => setPage(n)}
                                        className="cursor-pointer"
                                    >
                                        {n}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                aria-disabled={page >= totalPages}
                                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </>
    );
}
