import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { TechnologyCategory } from "@/api/client";

interface TechnologyFormProps {
    form: UseFormReturn<any>;
    onSubmit: (values: any) => void;
    categories: TechnologyCategory[];
    statuses: string[];
    onNewCategory: () => void;
    onNewStatus: () => void;
    onCancel: () => void;
    submitLabel: string;
}

export function TechnologyForm({
    form, onSubmit, categories, statuses,
    onNewCategory, onNewStatus, onCancel, submitLabel
}: TechnologyFormProps) {
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Название</Label>
                    <div className="col-span-3">
                        <Input id="name" {...form.register("name")} />
                        {form.formState.errors.name && (
                            <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message as string}</p>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Категория</Label>
                    <div className="col-span-3 space-y-2">
                        <Select
                            onValueChange={(v) => form.setValue("category_id", Number(v))}
                            defaultValue={form.getValues("category_id") ? String(form.getValues("category_id")) : undefined}
                            value={String(form.watch("category_id"))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="text-right">
                            <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={onNewCategory}>
                                + Создать категорию
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Статус</Label>
                    <div className="col-span-3 space-y-2">
                        <Select
                            onValueChange={(v) => form.setValue("status", v)}
                            defaultValue={form.getValues("status")}
                            value={form.watch("status")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите статус" />
                            </SelectTrigger>
                            <SelectContent>
                                {statuses.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="text-right">
                            <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={onNewStatus}>
                                + Создать статус
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="official_website" className="text-right">Сайт</Label>
                    <div className="col-span-3">
                        <Input id="official_website" placeholder="https://..." {...form.register("official_website")} />
                    </div>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">Описание</Label>
                    <div className="col-span-3">
                        <Textarea id="description" rows={3} {...form.register("description")} />
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={onCancel}>Отмена</Button>
                <Button type="submit">{submitLabel}</Button>
            </div>
        </form>
    );
}
