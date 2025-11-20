import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import type { UseFormReturn } from "react-hook-form";
import type { Team, Technology } from "@/api/client";

interface ProjectFormProps {
    form: UseFormReturn<any>;
    onSubmit: (values: any) => void;
    teams: Team[];
    technologies?: Technology[];
    onCancel: () => void;
    submitLabel: string;
}

export function ProjectForm({ form, onSubmit, teams, technologies = [], onCancel, submitLabel }: ProjectFormProps) {
    const techOptions = technologies.map(t => ({ label: t.name, value: t.id.toString() }));

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
                                <Input placeholder="Название проекта" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="team_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Команда</FormLabel>
                                <Select
                                    onValueChange={(v) => field.onChange(Number(v))}
                                    defaultValue={field.value?.toString()}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Выберите команду" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {teams.map((team) => (
                                            <SelectItem key={team.id} value={team.id.toString()}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Статус</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Выберите статус" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="on_hold">On Hold</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="technology_ids"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Технологии</FormLabel>
                            <FormControl>
                                <MultiSelect
                                    options={techOptions}
                                    selected={field.value?.map(String) || []}
                                    onChange={(vals) => field.onChange(vals.map(Number))}
                                    placeholder="Выберите технологии"
                                />
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
                                <Textarea placeholder="Описание проекта" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="repository_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ссылка на репозиторий</FormLabel>
                            <FormControl>
                                <Input placeholder="https://github.com/..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Дата начала</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} value={field.value || ""} />
                            </FormControl>
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
