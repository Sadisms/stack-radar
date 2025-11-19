import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers } from "lucide-react";

interface TechnologyStatsProps {
    stats: any;
}

export function TechnologyStats({ stats }: TechnologyStatsProps) {
    if (!stats || !stats.summary) return null;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-200">Всего технологий</CardTitle>
                    <Layers className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-neutral-100">{stats.summary.total_technologies}</div>
                </CardContent>
            </Card>
            {/* <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-200">Активных проектов</CardTitle>
                    <Activity className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-neutral-100">{stats.summary.total_projects_using_technologies}</div>
                </CardContent>
            </Card> */}
        </div>
    );
}
