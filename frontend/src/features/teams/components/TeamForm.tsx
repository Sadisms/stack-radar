import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UseFormReturn } from "react-hook-form";
import type { User } from "@/api/client";

interface TeamFormProps {
    form: UseFormReturn<any>;
    onSubmit: (values: any) => void;
    users: User[];
    onCancel: () => void;
    submitLabel: string;
}

export function TeamForm({ form, onSubmit, users, onCancel, submitLabel }: TeamFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Название</FormLabel>
                            <FormControl>
                                <Input placeholder="Название команды" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Описание</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Описание команды" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="lead_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Тимлид</FormLabel>
                            <Select
                                onValueChange={(v) => field.onChange(Number(v))}
                                defaultValue={field.value?.toString()}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Выберите тимлида" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.full_name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Отмена
                    </Button>
                    <Button type="submit">{submitLabel}</Button>
                </div>
            </form>
        </Form>
    );
}
