import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/api/client";
import type { Project, Team, Technology } from "@/api/client";

const projectSchema = z.object({
    name: z.string().min(1, "Название обязательно"),
    description: z.string().optional(),
    team_id: z.number().nullable().optional(),
    status: z.string().min(1, "Статус обязателен"),
    repository_url: z.string().url("Некорректный URL").optional().or(z.literal("")),
    start_date: z.string().optional().nullable(),
    technology_ids: z.array(z.number())
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function useProjects() {
    const [items, setItems] = useState<Project[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [technologies, setTechnologies] = useState<Technology[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [teamFilter, setTeamFilter] = useState<number | undefined>(undefined);
    const [sortBy, setSortBy] = useState<"name" | "status" | "created_at" | "team_id">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Project | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            name: "",
            description: "",
            team_id: null,
            status: "active",
            repository_url: "",
            start_date: null,
            technology_ids: []
        }
    });

    useEffect(() => {
        api.listTeams().then((resp) => setTeams(resp.items ?? [])).catch(() => { });
        api.listTechnologies({ page_size: 100 }).then((resp) => setTechnologies(resp.items ?? [])).catch(() => { });
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const resp = await api.listProjects({
                page,
                page_size: pageSize,
                q: q || undefined,
                status: statusFilter || undefined,
                team_id: teamFilter,
                sort_by: sortBy,
                sort_order: sortOrder
            });
            setItems(resp.items ?? []);
            setTotal(resp.total);
            setTotalPages(resp.total_pages || 1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, pageSize, q, statusFilter, teamFilter, sortBy, sortOrder]);

    const onSort = (field: "name" | "status" | "created_at" | "team_id") => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    const onOpenCreate = () => {
        form.reset({
            name: "",
            description: "",
            team_id: teams[0]?.id || null,
            status: "active",
            repository_url: "",
            start_date: null,
            technology_ids: []
        });
        setCreateOpen(true);
    };

    const onSubmitCreate = async (values: ProjectFormValues) => {
        await api.createProject({
            name: values.name,
            description: values.description ?? "",
            team_id: values.team_id ?? null,
            status: values.status,
            repository_url: values.repository_url ?? "",
            start_date: values.start_date || null,
            technology_ids: values.technology_ids
        } as any);
        setCreateOpen(false);
        await load();
    };

    const onOpenEdit = (project: Project) => {
        setEditing(project);
        form.reset({
            name: project.name,
            description: project.description,
            team_id: project.team_id,
            status: project.status,
            repository_url: project.repository_url,
            start_date: project.start_date,
            technology_ids: project.technologies?.map(t => t.technology_id) || []
        });
        setEditOpen(true);
    };

    const onSubmitEdit = async (values: ProjectFormValues) => {
        if (!editing) return;
        await api.updateProject(editing.id, {
            name: values.name,
            description: values.description ?? "",
            team_id: values.team_id ?? null,
            status: values.status,
            repository_url: values.repository_url ?? "",
            start_date: values.start_date || null,
            technology_ids: values.technology_ids
        });
        setEditOpen(false);
        setEditing(null);
        await load();
    };

    const onConfirmDelete = async () => {
        if (!deleteId) return;
        await api.deleteProject(deleteId);
        setDeleteId(null);
        await load();
    };

    const pageSizes = useMemo(() => [10, 20, 50], []);

    return {
        items, teams, technologies,
        page, setPage, pageSize, setPageSize, totalPages, total,
        q, setQ, statusFilter, setStatusFilter, teamFilter, setTeamFilter,
        sortBy, sortOrder, onSort,
        loading,
        createOpen, setCreateOpen,
        editOpen, setEditOpen,
        editing, setEditing,
        deleteId, setDeleteId,
        form,
        onOpenCreate,
        onSubmitCreate,
        onOpenEdit,
        onSubmitEdit,
        onConfirmDelete,
        pageSizes
    };
}
