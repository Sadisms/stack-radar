import { useState, useEffect } from "react";
import { api } from "@/api/client";
import type { DashboardStats } from "@/api/client";

export function useDashboard() {
    const [data, setData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const stats = await api.getDashboardStats();
            setData(stats);
        } catch (err: any) {
            setError(err?.message || "Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return { data, loading, error, reload: load };
}
