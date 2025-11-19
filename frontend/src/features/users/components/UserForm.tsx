import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { UseFormReturn } from "react-hook-form";

interface UserFormProps {
    form: UseFormReturn<any>;
    onSubmit: (values: any) => void;
    onCancel: () => void;
    submitLabel: string;
    isEdit?: boolean;
}

export function UserForm({ form, onSubmit, onCancel, submitLabel, isEdit = false }: UserFormProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="user@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {!isEdit && (
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Пароль</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Полное имя</FormLabel>
                            <FormControl>
                                <Input placeholder="Иван Иванов" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_admin"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-neutral-800 p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Администратор
                                </FormLabel>
                                <FormDescription className="text-neutral-500">
                                    Пользователь будет иметь права администратора
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-neutral-800 p-4">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Активен
                                </FormLabel>
                                <FormDescription className="text-neutral-500">
                                    Пользователь может входить в систему
                                </FormDescription>
                            </div>
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
