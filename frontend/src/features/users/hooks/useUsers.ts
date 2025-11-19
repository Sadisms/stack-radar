import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/api/client";
import type { User } from "@/api/client";

const createUserSchema = z.object({
    email: z.string().email("Неверный формат email"),
    password: z.string().min(6, "Минимум 6 символов"),
    full_name: z.string().min(1, "Имя обязательно"),
    is_admin: z.boolean(),
    is_active: z.boolean()
});

const editUserSchema = z.object({
    email: z.string().email("Неверный формат email"),
    full_name: z.string().min(1, "Имя обязательно"),
    is_admin: z.boolean(),
    is_active: z.boolean()
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type EditUserFormValues = z.infer<typeof editUserSchema>;

export function useUsers() {
    const [items, setItems] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    const [q, setQ] = useState("");
    const [isAdminFilter, setIsAdminFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"email" | "full_name" | "created_at">("created_at");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [loading, setLoading] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState<User | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const createForm = useForm<CreateUserFormValues>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            email: "",
            password: "",
            full_name: "",
            is_admin: false,
            is_active: true
        }
    });

    const editForm = useForm<EditUserFormValues>({
        resolver: zodResolver(editUserSchema),
        defaultValues: {
            email: "",
            full_name: "",
            is_admin: false,
            is_active: true
        }
    });

    const load = async () => {
        setLoading(true);
        try {
            const resp = await api.listUsers({
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
    }, [page, pageSize, q, isAdminFilter, sortBy, sortOrder]);

    const onSort = (field: "email" | "full_name" | "created_at") => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    const onOpenCreate = () => {
        createForm.reset({
            email: "",
            password: "",
            full_name: "",
            is_admin: false,
            is_active: true
        });
        setCreateOpen(true);
    };

    const onSubmitCreate = async (values: CreateUserFormValues) => {
        await api.createUser(values);
        setCreateOpen(false);
        await load();
    };

    const onOpenEdit = (user: User) => {
        setEditing(user);
        editForm.reset({
            email: user.email,
            full_name: user.full_name,
            is_admin: user.is_admin,
            is_active: user.is_active
        });
        setEditOpen(true);
    };

    const onSubmitEdit = async (values: EditUserFormValues) => {
        if (!editing) return;
        await api.updateUser(editing.id, values);
        setEditOpen(false);
        setEditing(null);
        await load();
    };

    const onConfirmDelete = async () => {
        if (!deleteId) return;
        await api.deleteUser(deleteId);
        setDeleteId(null);
        await load();
    };

    const pageSizes = useMemo(() => [10, 20, 50], []);

    return {
        items,
        page, setPage, pageSize, setPageSize, totalPages, total,
        q, setQ,
        isAdminFilter, setIsAdminFilter,
        sortBy, sortOrder, onSort,
        loading,
        createOpen, setCreateOpen,
        editOpen, setEditOpen,
        editing, setEditing,
        deleteId, setDeleteId,
        createForm,
        editForm,
        onOpenCreate,
        onSubmitCreate,
        onOpenEdit,
        onSubmitEdit,
        onConfirmDelete,
        pageSizes
    };
}
