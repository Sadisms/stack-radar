import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useUsers } from "@/features/users/hooks/useUsers";
import { UserStats } from "@/features/users/components/UserStats";
import { UserFilters } from "@/features/users/components/UserFilters";
import { UsersTable } from "@/features/users/components/UsersTable";
import { UserDialogs } from "@/features/users/components/UserDialogs";

export default function UsersPage() {
    const {
        items,
        page, setPage, pageSize, setPageSize, totalPages, total,
        q, setQ,
        isAdminFilter, setIsAdminFilter,
        sortBy, sortOrder, onSort,
        loading,
        createOpen, setCreateOpen,
        editOpen, setEditOpen,
        deleteId, setDeleteId,
        createForm,
        editForm,
        onSubmitCreate,
        onSubmitEdit,
        onConfirmDelete,
        onOpenCreate,
        onOpenEdit,
        pageSizes
    } = useUsers();

    return (
        <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 p-6 space-y-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
                        <p className="text-neutral-400 mt-1">Управление пользователями системы</p>
                    </div>
                    <Button onClick={onOpenCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Создать пользователя
                    </Button>
                </div>

                <UserStats total={total} />

                <Card className="border-neutral-800 bg-neutral-900">
                    <CardHeader>
                        <UserFilters
                            q={q} setQ={setQ}
                            isAdminFilter={isAdminFilter} setIsAdminFilter={setIsAdminFilter}
                            pageSize={pageSize} setPageSize={setPageSize}
                            pageSizes={pageSizes}
                            setPage={setPage}
                        />
                    </CardHeader>
                    <CardContent>
                        <UsersTable
                            items={items}
                            loading={loading}
                            onOpenEdit={onOpenEdit}
                            setDeleteId={setDeleteId}
                            total={total}
                            page={page}
                            setPage={setPage}
                            totalPages={totalPages}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSort={onSort}
                        />
                    </CardContent>
                </Card>

                <UserDialogs
                    createOpen={createOpen} setCreateOpen={setCreateOpen}
                    editOpen={editOpen} setEditOpen={setEditOpen}
                    deleteId={deleteId} setDeleteId={setDeleteId}
                    createForm={createForm}
                    editForm={editForm}
                    onSubmitCreate={onSubmitCreate}
                    onSubmitEdit={onSubmitEdit}
                    onConfirmDelete={onConfirmDelete}
                />
            </div>
        </div>
    );
}
