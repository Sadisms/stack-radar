import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useArchivePreview, useArchiveExecute, useArchiveHistory } from "../hooks/useAdmin";
import { Archive, Eye, Loader2 } from "lucide-react";

export function ArchiveManager() {
    const [inactiveDays, setInactiveDays] = useState(180);
    const [showPreview, setShowPreview] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [message, setMessage] = useState("");

    const { data: previewData, loading: loadingPreview, count, preview } = useArchivePreview();
    const { execute, loading: loadingExecute } = useArchiveExecute();
    const { data: historyData, loading: loadingHistory, reload: reloadHistory } = useArchiveHistory();

    const handlePreview = async () => {
        await preview(inactiveDays);
        setShowPreview(true);
    };

    const handleExecute = async () => {
        try {
            const result = await execute(inactiveDays);
            setMessage(`Успешно заархивировано: ${result.count} проект(ов)`);
            setShowConfirmDialog(false);
            setShowPreview(false);
            await reloadHistory();
        } catch {
            setMessage("Ошибка при архивации проектов");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="space-y-6">
            {/* Archive Configuration */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-neutral-100">
                        <Archive className="h-5 w-5" />
                        Архивация неактивных проектов
                    </CardTitle>
                    <p className="text-sm text-neutral-400">
                        Автоматическая архивация проектов без обновлений
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <Label htmlFor="inactive-days" className="text-neutral-200">
                                Порог неактивности (дней)
                            </Label>
                            <Input
                                id="inactive-days"
                                type="number"
                                value={inactiveDays}
                                onChange={(e) => setInactiveDays(Number(e.target.value))}
                                min={1}
                                className="mt-1 bg-neutral-800 border-neutral-700 text-neutral-100"
                            />
                        </div>
                        <Button onClick={handlePreview} disabled={loadingPreview} variant="outline">
                            {loadingPreview ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Загрузка...
                                </>
                            ) : (
                                <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Предпросмотр
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={() => setShowConfirmDialog(true)}
                            disabled={!showPreview || count === 0}
                            variant="destructive"
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            Выполнить архивацию
                        </Button>
                    </div>

                    {message && (
                        <div className="rounded-md bg-blue-900/20 border border-blue-800 p-3 text-sm text-blue-200">
                            {message}
                        </div>
                    )}

                    {showPreview && (
                        <div className="mt-4 space-y-3">
                            <div className="rounded-md bg-yellow-900/20 border border-yellow-800 p-3 text-sm text-yellow-200">
                                {count === 0 ? (
                                    <span>Нет проектов, неактивных {inactiveDays}+ дней</span>
                                ) : (
                                    <span>
                                        Найдено: <strong>{count}</strong> проект(ов) неактивных {inactiveDays}+ дней
                                    </span>
                                )}
                            </div>

                            {count > 0 && (
                                <div className="border rounded-lg border-neutral-800">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-neutral-800">
                                                <TableHead className="text-neutral-300">Проект</TableHead>
                                                <TableHead className="text-neutral-300">Последнее обновление</TableHead>
                                                <TableHead className="text-right text-neutral-300">Дней неактивности</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {previewData.map((project) => (
                                                <TableRow key={project.project_id} className="border-neutral-800">
                                                    <TableCell className="font-medium text-neutral-200">{project.project_name}</TableCell>
                                                    <TableCell className="text-neutral-400">{formatDate(project.last_updated)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="inline-flex items-center rounded-full bg-red-900/20 px-2 py-1 text-xs font-medium text-red-300 ring-1 ring-inset ring-red-800">
                                                            {project.days_inactive} дней
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Archive History */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader>
                    <CardTitle className="text-neutral-100">История архивации</CardTitle>
                    <p className="text-sm text-neutral-400">Последние операции архивирования</p>
                </CardHeader>
                <CardContent>
                    {loadingHistory ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
                        </div>
                    ) : historyData && historyData.length > 0 ? (
                        <div className="space-y-3">
                            {historyData.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-start justify-between rounded-lg border border-neutral-800 p-3 text-sm"
                                >
                                    <div className="space-y-1">
                                        <p className="font-medium text-neutral-200">{entry.notes}</p>
                                        <p className="text-xs text-neutral-500">
                                            {entry.archived_by_name} • {formatDate(entry.archived_at)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-neutral-200">{entry.projects_count} проектов</p>
                                        <p className="text-xs text-neutral-500">{entry.inactive_threshold} дней</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-sm text-neutral-500 py-8">История архивации пуста</p>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100">
                    <DialogHeader>
                        <DialogTitle>Подтверждение архивации</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Будет zaархивировано {count || 0} проект(ов), которые не обновлялись {inactiveDays} или более дней.
                            Заархивированные проекты будут помечены как "archived" в системе.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Отмена
                        </Button>
                        <Button onClick={handleExecute} disabled={loadingExecute} variant="destructive">
                            {loadingExecute ? "Архивируем..." : "Да, заархивировать"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
