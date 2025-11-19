import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/api/client";
import type { Technology, TechnologyCategory } from "@/api/client";

const technologySchema = z.object({
    name: z.string().min(1, "Название обязательно"),
    category_id: z.number().int().positive("Категория обязательна"),
    description: z.string().optional(),
    official_website: z.string().optional(),
    status: z.string().min(1, "Статус обязателен")
});

export type TechnologyFormValues = z.infer<typeof technologySchema>;

export function useTechnologies() {
    const [items, setItems] = useState<Technology[]>([]);
    const [categories, setCategories] = useState<TechnologyCategory[]>([]);
    const [statuses, setStatuses] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [q, setQ] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
    const [sortBy, setSortBy] = useState<"name" | "status" | "created_at">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<Technology | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [newCatOpen, setNewCatOpen] = useState(false);
    const [newStatusOpen, setNewStatusOpen] = useState(false);
    const [newCat, setNewCat] = useState({ name: "", description: "", icon: "" });
    const [newStatus, setNewStatus] = useState("");
    const [stats, setStats] = useState<any>(null);

    const form = useForm<TechnologyFormValues>({
        resolver: zodResolver(technologySchema),
        defaultValues: {
            name: "",
            category_id: 1,
            description: "",
            official_website: "",
            status: "stable"
        }
    });

    useEffect(() => {
        api.listTechnologyCategories().then((cats) => setCategories(cats ?? [])).catch(() => { });
        api.listTechnologyStatuses().then((sts) => setStatuses(sts ?? [])).catch(() => { });
        api.getTechnologyUsageStats().then((s) => setStats(s)).catch(() => { });
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const resp = await api.listTechnologies({
                page,
                page_size: pageSize,
                q: q || undefined,
                status: statusFilter || undefined,
                category_id: categoryFilter,
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
    }, [page, pageSize, q, statusFilter, categoryFilter, sortBy, sortOrder]);

    const onSort = (field: "name" | "status" | "created_at") => {
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
            category_id: categories[0]?.id || 1,
            description: "",
            official_website: "",
            status: "stable"
        });
        setCreateOpen(true);
    };

    const onSubmitCreate = async (values: TechnologyFormValues) => {
        await api.createTechnology({
            name: values.name,
            category_id: values.category_id,
            description: values.description ?? "",
            official_website: values.official_website ?? "",
            status: values.status
        });
        setCreateOpen(false);
        await load();
        api.getTechnologyUsageStats().then((s) => setStats(s)).catch(() => { });
    };

    const onOpenEdit = (tech: Technology) => {
        setEditing(tech);
        form.reset({
            name: tech.name,
            category_id: tech.category_id,
            description: tech.description ?? "",
            official_website: tech.official_website ?? "",
            status: tech.status
        });
        setEditOpen(true);
    };

    const onSubmitEdit = async (values: TechnologyFormValues) => {
        if (!editing) return;
        await api.updateTechnology(editing.id, {
            name: values.name,
            category_id: values.category_id,
            description: values.description ?? "",
            official_website: values.official_website ?? "",
            status: values.status
        });
        setEditOpen(false);
        setEditing(null);
        await load();
    };

    const onConfirmDelete = async () => {
        if (!deleteId) return;
        await api.deleteTechnology(deleteId);
        setDeleteId(null);
        await load();
        api.getTechnologyUsageStats().then((s) => setStats(s)).catch(() => { });
    };

    const onCreateCategory = async () => {
        if (!newCat.name.trim()) return;
        const created = await api.createTechnologyCategory({ name: newCat.name.trim(), description: newCat.description, icon: newCat.icon });
        const cats = await api.listTechnologyCategories();
        setCategories(cats ?? []);
        form.setValue("category_id", created.id);
        setNewCatOpen(false);
    };

    const onCreateStatus = async () => {
        const name = newStatus.trim();
        if (!name) return;
        await api.createTechnologyStatus(name);
        const sts = await api.listTechnologyStatuses();
        setStatuses(sts ?? []);
        form.setValue("status", name);
        setNewStatusOpen(false);
    };

    const pageSizes = useMemo(() => [10, 20, 50], []);

    return {
        items, categories, statuses, stats,
        page, setPage, pageSize, setPageSize, totalPages, total,
        q, setQ, statusFilter, setStatusFilter, categoryFilter, setCategoryFilter,
        sortBy, sortOrder, onSort,
        loading,
        createOpen, setCreateOpen,
        editOpen, setEditOpen,
        editing, setEditing,
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
    };
}
