import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TeamForm } from "./TeamForm";
import type { UseFormReturn } from "react-hook-form";
import type { User } from "@/api/client";

interface TeamDialogsProps {
    createOpen: boolean;
    setCreateOpen: (open: boolean) => void;
    editOpen: boolean;
    setEditOpen: (open: boolean) => void;
    deleteId: number | null;
    setDeleteId: (id: number | null) => void;
    form: UseFormReturn<any>;
    onSubmitCreate: (values: any) => void;
    onSubmitEdit: (values: any) => void;
    onConfirmDelete: () => void;
    users: User[];
}

export function TeamDialogs({
    createOpen, setCreateOpen,
    editOpen, setEditOpen,
    deleteId, setDeleteId,
    form, onSubmitCreate, onSubmitEdit, onConfirmDelete,
    users
}: TeamDialogsProps) {
    return (
        <>
            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100">
                    <DialogHeader>
                        <DialogTitle>Создать команду</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Заполните форму для создания новой команды.
                        </DialogDescription>
                    </DialogHeader>
                    <TeamForm
                        form={form}
                        onSubmit={onSubmitCreate}
                        users={users}
                        onCancel={() => setCreateOpen(false)}
                        submitLabel="Создать"
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100">
                    <DialogHeader>
                        <DialogTitle>Редактировать команду</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Измените данные команды.
                        </DialogDescription>
                    </DialogHeader>
                    <TeamForm
                        form={form}
                        onSubmit={onSubmitEdit}
                        users={users}
                        onCancel={() => setEditOpen(false)}
                        submitLabel="Сохранить"
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            Это действие нельзя отменить. Команда будет удалена навсегда.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100">
                            Отмена
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white border-0"
                            onClick={onConfirmDelete}
                        >
                            Удалить
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
