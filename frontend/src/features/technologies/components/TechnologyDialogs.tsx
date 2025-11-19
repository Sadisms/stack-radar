import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TechnologyForm } from "./TechnologyForm";
import type { UseFormReturn } from "react-hook-form";
import type { TechnologyCategory } from "@/api/client";

interface TechnologyDialogsProps {
    createOpen: boolean;
    setCreateOpen: (open: boolean) => void;
    editOpen: boolean;
    setEditOpen: (open: boolean) => void;
    setEditing: (tech: any) => void;
    deleteId: number | null;
    setDeleteId: (id: number | null) => void;
    newCatOpen: boolean;
    setNewCatOpen: (open: boolean) => void;
    newStatusOpen: boolean;
    setNewStatusOpen: (open: boolean) => void;
    newCat: { name: string; description: string; icon: string };
    setNewCat: (cat: { name: string; description: string; icon: string }) => void;
    newStatus: string;
    setNewStatus: (status: string) => void;
    categories: TechnologyCategory[];
    statuses: string[];
    form: UseFormReturn<any>;
    onSubmitCreate: (values: any) => void;
    onSubmitEdit: (values: any) => void;
    onConfirmDelete: () => void;
    onCreateCategory: () => void;
    onCreateStatus: () => void;
}

export function TechnologyDialogs({
    createOpen, setCreateOpen,
    editOpen, setEditOpen, setEditing,
    deleteId, setDeleteId,
    newCatOpen, setNewCatOpen,
    newStatusOpen, setNewStatusOpen,
    newCat, setNewCat,
    newStatus, setNewStatus,
    categories, statuses,
    form,
    onSubmitCreate, onSubmitEdit, onConfirmDelete,
    onCreateCategory, onCreateStatus
}: TechnologyDialogsProps) {
    return (
        <>
            {/* Create/Edit Dialog */}
            <Dialog open={createOpen || editOpen} onOpenChange={(o) => {
                if (!o) {
                    setCreateOpen(false);
                    setEditOpen(false);
                    setEditing(null);
                }
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editOpen ? "Редактирование технологии" : "Новая технология"}</DialogTitle>
                        <DialogDescription>
                            {editOpen ? "Измените параметры технологии ниже." : "Заполните данные для создания новой технологии."}
                        </DialogDescription>
                    </DialogHeader>
                    <TechnologyForm
                        form={form}
                        onSubmit={editOpen ? onSubmitEdit : onSubmitCreate}
                        categories={categories}
                        statuses={statuses}
                        onNewCategory={() => { setNewCat({ name: "", description: "", icon: "" }); setNewCatOpen(true); }}
                        onNewStatus={() => { setNewStatus(""); setNewStatusOpen(true); }}
                        onCancel={() => { setCreateOpen(false); setEditOpen(false); setEditing(null); }}
                        submitLabel={editOpen ? "Сохранить" : "Создать"}
                    />
                </DialogContent>
            </Dialog>

            {/* Create Category Dialog */}
            <Dialog open={newCatOpen} onOpenChange={setNewCatOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Новая категория</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Название</Label>
                            <Input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Описание</Label>
                            <Textarea rows={3} value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Иконка (emoji или URL)</Label>
                            <Input value={newCat.icon} onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setNewCatOpen(false)}>Отмена</Button>
                        <Button type="button" onClick={onCreateCategory}>Создать</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Status Dialog */}
            <Dialog open={newStatusOpen} onOpenChange={setNewStatusOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Новый статус</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Название</Label>
                            <Input value={newStatus} onChange={(e) => setNewStatus(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setNewStatusOpen(false)}>Отмена</Button>
                        <Button type="button" onClick={onCreateStatus}>Создать</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Это действие нельзя отменить. Технология будет удалена навсегда.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmDelete} className="bg-red-600 hover:bg-red-700">Удалить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
