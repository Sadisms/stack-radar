import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { MoreHorizontal, Edit, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import type { User } from "@/api/client";

interface UsersTableProps {
    items: User[];
    loading: boolean;
    onOpenEdit: (user: User) => void;
    setDeleteId: (id: number) => void;
    total: number;
    page: number;
    setPage: (p: number | ((prev: number) => number)) => void;
    totalPages: number;
    sortBy: "email" | "full_name" | "created_at";
    sortOrder: "asc" | "desc";
    onSort: (field: "email" | "full_name" | "created_at") => void;
}

export function UsersTable({
    items, loading,
    onOpenEdit, setDeleteId,
    total, page, setPage, totalPages,
    sortBy, sortOrder, onSort
}: UsersTableProps) {

    const SortIcon = ({ field }: { field: "email" | "full_name" | "created_at" }) => {
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
                                onClick={() => onSort("email")}
                            >
                                <div className="flex items-center">
                                    Email
                                    <SortIcon field="email" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="text-neutral-400 cursor-pointer hover:text-neutral-200 transition-colors"
                                onClick={() => onSort("full_name")}
                            >
                                <div className="flex items-center">
                                    Имя
                                    <SortIcon field="full_name" />
                                </div>
                            </TableHead>
                            <TableHead className="text-neutral-400">Роль</TableHead>
                            <TableHead className="text-neutral-400">Статус</TableHead>
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
                                    Пользователи не найдены
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((u) => (
                                <TableRow key={u.id} className="border-neutral-800 hover:bg-neutral-900/50">
                                    <TableCell className="font-medium text-neutral-200">
                                        {u.email}
                                    </TableCell>
                                    <TableCell className="text-neutral-300">
                                        {u.full_name || "—"}
                                    </TableCell>
                                    <TableCell>
                                        {u.is_admin ? (
                                            <Badge variant="default">Админ</Badge>
                                        ) : (
                                            <Badge variant="secondary">Пользователь</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {u.is_active ? (
                                            <Badge variant="default" className="bg-green-600">Активен</Badge>
                                        ) : (
                                            <Badge variant="destructive">Неактивен</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-neutral-400 text-sm">
                                        {new Date(u.created_at).toLocaleDateString()}
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
                                                <DropdownMenuItem onClick={() => onOpenEdit(u)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Редактировать
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => setDeleteId(u.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Удалить
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
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
