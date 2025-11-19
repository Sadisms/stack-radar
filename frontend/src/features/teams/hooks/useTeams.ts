import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/api/client";
import type { Team, User } from "@/api/client";

const teamSchema = z.object({
    name: z.string().min(1, "Название обязательно"),
    description: z.string().optional(),
    lead_id: z.number().nullable().optional()
});

type TeamFormValues = z.infer<typeof teamSchema>;

export function useTeams() {
    const [items, setItems] = useState<Team[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [q, setQ] = useState("");
    const [sortBy, setSortBy] = useState<"name" | "created_at">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Team | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const form = useForm<TeamFormValues>({
        resolver: zodResolver(teamSchema),
        defaultValues: {
            name: "",
            description: "",
            lead_id: null
        }
    });

    useEffect(() => {
        // Fetch users for Lead dropdown and table mapping
        // Fetching first 100 users for now. If more, we might need a better strategy.
        api.listUsers({ page_size: 100 }).then((resp) => setUsers(resp.items ?? [])).catch(() => { });
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const resp = await api.listTeams({
                page,
                page_size: pageSize,
                q: q || undefined,
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
    }, [page, pageSize, q, sortBy, sortOrder]);

    const onSort = (field: "name" | "created_at") => {
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
            lead_id: null
        });
        setCreateOpen(true);
    };

    const onSubmitCreate = async (values: TeamFormValues) => {
        await api.createTeam({
            name: values.name,
            description: values.description ?? "",
            lead_id: values.lead_id ?? null
        });
        setCreateOpen(false);
        await load();
    };

    const onOpenEdit = (team: Team) => {
        setEditing(team);
        form.reset({
            name: team.name,
            description: team.description,
            lead_id: team.lead_id
        });
        setEditOpen(true);
    };

    const onSubmitEdit = async (values: TeamFormValues) => {
        if (!editing) return;
        await api.updateTeam(editing.id, {
            name: values.name,
            description: values.description ?? "",
            lead_id: values.lead_id ?? null
        });
        setEditOpen(false);
        setEditing(null);
        await load();
    };

    const onConfirmDelete = async () => {
        if (!deleteId) return;
        await api.deleteTeam(deleteId);
        setDeleteId(null);
        await load();
    };

    const pageSizes = useMemo(() => [10, 20, 50], []);

    return {
        items, users,
        page, setPage, pageSize, setPageSize, totalPages, total,
        q, setQ,
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
