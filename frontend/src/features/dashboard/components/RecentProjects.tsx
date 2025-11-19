import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface RecentProjectsProps {
    projects: Array<{
        id: number;
        name: string;
        status: string;
        created_at: string;
        team_name: string | null;
        tech_count: number;
    }>;
}

export function RecentProjects({ projects }: RecentProjectsProps) {
    return (
        <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
                <CardTitle className="text-neutral-100">Недавние проекты</CardTitle>
                <p className="text-sm text-neutral-400">Последние 5 проектов</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {projects.length === 0 ? (
                        <p className="text-neutral-500 text-center py-4">Нет проектов</p>
                    ) : (
                        projects.map(project => (
                            <div key={project.id} className="flex items-center justify-between border-b border-neutral-800 pb-3 last:border-0">
                                <div className="flex-1">
                                    <h4 className="text-neutral-100 font-medium">{project.name}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </span>
                                        {project.team_name && (
                                            <span className="text-xs text-neutral-500">
                                                Команда: {project.team_name}
                                            </span>
                                        )}
                                        <span className="text-xs text-neutral-500">
                                            Технологий: {project.tech_count}
                                        </span>
                                    </div>
                                </div>
                                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                                    {project.status}
                                </Badge>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
