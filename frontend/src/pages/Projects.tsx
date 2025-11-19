import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { ProjectStats } from "@/features/projects/components/ProjectStats";
import { ProjectFilters } from "@/features/projects/components/ProjectFilters";
import { ProjectsTable } from "@/features/projects/components/ProjectsTable";
import { ProjectDialogs } from "@/features/projects/components/ProjectDialogs";

export default function ProjectsPage() {
    const {
        items, teams,
        page, setPage, pageSize, setPageSize, totalPages, total,
        q, setQ, statusFilter, setStatusFilter, teamFilter, setTeamFilter,
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
    } = useProjects();

    return (
        <div className="min-h-screen w-full bg-neutral-950 text-neutral-100 p-6 space-y-8">
            <div className="mx-auto max-w-7xl space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Проекты</h1>
                        <p className="text-neutral-400 mt-1">Управление проектами компании</p>
                    </div>
                    <Button onClick={onOpenCreate} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Добавить проект
                    </Button>
                </div>

                <ProjectStats total={total} />

                <Card className="border-neutral-800 bg-neutral-900">
                    <CardHeader>
                        <ProjectFilters
                            q={q} setQ={setQ}
                            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                            teamFilter={teamFilter} setTeamFilter={setTeamFilter}
                            pageSize={pageSize} setPageSize={setPageSize}
                            teams={teams} pageSizes={pageSizes}
                            setPage={setPage}
                        />
                    </CardHeader>
                    <CardContent>
                        <ProjectsTable
                            items={items}
                            loading={loading}
                            teams={teams}
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

                <ProjectDialogs
                    createOpen={createOpen} setCreateOpen={setCreateOpen}
                    editOpen={editOpen} setEditOpen={setEditOpen}
                    deleteId={deleteId} setDeleteId={setDeleteId}
                    form={form}
                    onSubmitCreate={onSubmitCreate}
                    onSubmitEdit={onSubmitEdit}
                    onConfirmDelete={onConfirmDelete}
                    teams={teams}
                />
            </div>
        </div>
    );
}
