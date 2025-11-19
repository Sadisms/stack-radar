import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { UserForm } from "./UserForm";
import type { UseFormReturn } from "react-hook-form";

interface UserDialogsProps {
    createOpen: boolean;
    setCreateOpen: (open: boolean) => void;
    editOpen: boolean;
    setEditOpen: (open: boolean) => void;
    deleteId: number | null;
    setDeleteId: (id: number | null) => void;
    createForm: UseFormReturn<any>;
    editForm: UseFormReturn<any>;
    onSubmitCreate: (values: any) => void;
    onSubmitEdit: (values: any) => void;
    onConfirmDelete: () => void;
}

export function UserDialogs({
    createOpen, setCreateOpen,
    editOpen, setEditOpen,
    deleteId, setDeleteId,
    createForm, editForm,
    onSubmitCreate, onSubmitEdit, onConfirmDelete
}: UserDialogsProps) {
    return (
        <>
            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100">
                    <DialogHeader>
                        <DialogTitle>Создать пользователя</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Заполните форму для создания нового пользователя.
                        </DialogDescription>
                    </DialogHeader>
                    <UserForm
                        form={createForm}
                        onSubmit={onSubmitCreate}
                        onCancel={() => setCreateOpen(false)}
                        submitLabel="Создать"
                        isEdit={false}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100">
                    <DialogHeader>
                        <DialogTitle>Редактировать пользователя</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Измените данные пользователя.
                        </DialogDescription>
                    </DialogHeader>
                    <UserForm
                        form={editForm}
                        onSubmit={onSubmitEdit}
                        onCancel={() => setEditOpen(false)}
                        submitLabel="Сохранить"
                        isEdit={true}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription className="text-neutral-400">
                            Это действие нельзя отменить. Пользователь будет удален навсегда.
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
