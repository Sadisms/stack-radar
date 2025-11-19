import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface TeamSummaryProps {
    teams: Array<{
        id: number;
        name: string;
        project_count: number;
        lead_name: string | null;
    }>;
}

export function TeamSummary({ teams }: TeamSummaryProps) {
    return (
        <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
                <CardTitle className="text-neutral-100">Топ команд</CardTitle>
                <p className="text-sm text-neutral-400">По количеству проектов</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {teams.length === 0 ? (
                        <p className="text-neutral-500 text-center py-4">Нет команд</p>
                    ) : (
                        teams.map((team, index) => (
                            <div key={team.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-800/50 transition-colors">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 font-semibold text-sm">
                                    #{index + 1}
                                </div>
                                <Users className="h-4 w-4 text-neutral-400" />
                                <div className="flex-1">
                                    <div className="text-neutral-100 font-medium">{team.name}</div>
                                    {team.lead_name && (
                                        <div className="text-xs text-neutral-500">Лидер: {team.lead_name}</div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-neutral-200">{team.project_count}</div>
                                    <div className="text-xs text-neutral-500">проектов</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
