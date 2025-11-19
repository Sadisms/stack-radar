import { useState, useEffect } from "react";
import { api } from "@/api/client";

export interface ArchivePreviewProject {
    project_id: number;
    project_name: string;
    last_updated: string;
    days_inactive: number;
    action_taken: string;
}

export interface ArchiveHistoryEntry {
    id: number;
    archived_at: string;
    archived_by_name: string;
    projects_count: number;
    inactive_threshold: number;
    notes: string;
}

export function useArchivePreview() {
    const [data, setData] = useState<ArchivePreviewProject[]>([]);
    const [loading, setLoading] = useState(false);
    const [count, setCount] = useState(0);

    const preview = async (inactiveDays: number) => {
        setLoading(true);
        try {
            const resp = await api.previewArchive(inactiveDays);
            setData(resp.projects);
            setCount(resp.count);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, count, preview };
}

export function useArchiveExecute() {
    const [loading, setLoading] = useState(false);

    const execute = async (inactiveDays: number) => {
        setLoading(true);
        try {
            const resp = await api.executeArchive(inactiveDays);
            return resp;
        } finally {
            setLoading(false);
        }
    };

    return { execute, loading };
}

export function useArchiveHistory() {
    const [data, setData] = useState<ArchiveHistoryEntry[]>([]);
    const [loading, setLoading] = useState(false);

    const load = async (limit: number = 10) => {
        setLoading(true);
        try {
            const resp = await api.getArchiveHistory(limit);
            setData(resp.history);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { data, loading, reload: load };
}
