import { ArchiveManager } from "@/features/admin/components/ArchiveManager";

export default function Admin() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-100">Админ-панель</h1>
                <p className="text-neutral-400 mt-2">
                    Управление и обслуживание системы
                </p>
            </div>

            <ArchiveManager />
        </div>
    );
}
