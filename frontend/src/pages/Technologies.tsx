import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useTechnologies } from "@/features/technologies/hooks/useTechnologies";
import { TechnologyStats } from "@/features/technologies/components/TechnologyStats";
import { TechnologyFilters } from "@/features/technologies/components/TechnologyFilters";
import { TechnologiesTable } from "@/features/technologies/components/TechnologiesTable";
import { TechnologyDialogs } from "@/features/technologies/components/TechnologyDialogs";

export default function TechnologiesPage() {
	const {
		items, categories, statuses, stats,
		page, setPage, pageSize, setPageSize, totalPages, total,
		q, setQ, statusFilter, setStatusFilter, categoryFilter, setCategoryFilter,
		sortBy, sortOrder, onSort,
		loading,
		createOpen, setCreateOpen,
		editOpen, setEditOpen, setEditing,
		deleteId, setDeleteId,
		newCatOpen, setNewCatOpen,
		newStatusOpen, setNewStatusOpen,
		newCat, setNewCat,
		newStatus, setNewStatus,
		form,
		onOpenCreate,
		onSubmitCreate,
		onOpenEdit,
		onSubmitEdit,
		onConfirmDelete,
		onCreateCategory,
		onCreateStatus,
		pageSizes
	} = useTechnologies();

	return (
		<div className="min-h-screen w-full bg-neutral-950 text-neutral-100 p-6 space-y-8">
			<div className="mx-auto max-w-7xl space-y-8">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Технологии</h1>
						<p className="text-neutral-400 mt-1">Управление стеком технологий компании</p>
					</div>
					<Button onClick={onOpenCreate} className="gap-2">
						<Plus className="h-4 w-4" />
						Добавить технологию
					</Button>
				</div>

				<TechnologyStats stats={stats} />

				<Card className="border-neutral-800 bg-neutral-900">
					<CardHeader>
						<TechnologyFilters
							q={q} setQ={setQ}
							statusFilter={statusFilter} setStatusFilter={setStatusFilter}
							categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
							pageSize={pageSize} setPageSize={setPageSize}
							statuses={statuses} categories={categories} pageSizes={pageSizes}
							setPage={setPage}
						/>
					</CardHeader>
					<CardContent>
						<TechnologiesTable
							items={items}
							loading={loading}
							categories={categories}
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

				<TechnologyDialogs
					createOpen={createOpen} setCreateOpen={setCreateOpen}
					editOpen={editOpen} setEditOpen={setEditOpen} setEditing={setEditing}
					deleteId={deleteId} setDeleteId={setDeleteId}
					newCatOpen={newCatOpen} setNewCatOpen={setNewCatOpen}
					newStatusOpen={newStatusOpen} setNewStatusOpen={setNewStatusOpen}
					newCat={newCat} setNewCat={setNewCat}
					newStatus={newStatus} setNewStatus={setNewStatus}
					categories={categories} statuses={statuses}
					form={form}
					onSubmitCreate={onSubmitCreate} onSubmitEdit={onSubmitEdit} onConfirmDelete={onConfirmDelete}
					onCreateCategory={onCreateCategory} onCreateStatus={onCreateStatus}
				/>
			</div>
		</div>
	);
}


