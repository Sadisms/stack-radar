import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useTeams } from "@/features/teams/hooks/useTeams";
import { TeamStats } from "@/features/teams/components/TeamStats";
import { TeamFilters } from "@/features/teams/components/TeamFilters";
import { TeamsTable } from "@/features/teams/components/TeamsTable";
import { TeamDialogs } from "@/features/teams/components/TeamDialogs";

export default function TeamsPage() {
    const {
        items, users,
        page, setPage, pageSize, setPageSize, totalPages, total,
        q, setQ,
        sortBy, sortOrder, onSort,
        loading,
        createOpen, setCreateOpen,
        editOpen, setEditOpen,
        deleteId, setDeleteId,
        form,
        onSubmitCreate,
        onSubmitEdit,
        onConfirmDelete,
        onOpenCreate,
        onOpenEdit,
        pageSizes
    } = useTeams();

    return (
        <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 p-6 space-y-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Команды</h1>
                        <p className="text-neutral-400 mt-1">Управление командами и отделами</p>
                    </div>
                    <Button onClick={onOpenCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Создать команду
                    </Button>
                </div>

                <TeamStats total={total} />

                <Card className="border-neutral-800 bg-neutral-900">
                    <CardHeader>
                        <TeamFilters
                            q={q} setQ={setQ}
                            pageSize={pageSize} setPageSize={setPageSize}
                            pageSizes={pageSizes}
                            setPage={setPage}
                        />
                    </CardHeader>
                    <CardContent>
                        <TeamsTable
                            items={items}
                            loading={loading}
                            users={users}
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

                <TeamDialogs
                    createOpen={createOpen} setCreateOpen={setCreateOpen}
                    editOpen={editOpen} setEditOpen={setEditOpen}
                    deleteId={deleteId} setDeleteId={setDeleteId}
                    form={form}
                    onSubmitCreate={onSubmitCreate}
                    onSubmitEdit={onSubmitEdit}
                    onConfirmDelete={onConfirmDelete}
                    users={users}
                />
            </div>
        </div>
    );
}
