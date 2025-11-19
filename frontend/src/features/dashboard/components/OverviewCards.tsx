import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Boxes, Users, User } from "lucide-react";

interface OverviewCardsProps {
    overview: {
        total_projects: number;
        total_technologies: number;
        total_teams: number;
        total_users: number;
    };
}

export function OverviewCards({ overview }: OverviewCardsProps) {
    const cards = [
        {
            title: "Проекты",
            value: overview.total_projects,
            icon: FolderKanban,
            color: "text-slate-400"
        },
        {
            title: "Технологии",
            value: overview.total_technologies,
            icon: Boxes,
            color: "text-slate-400"
        },
        {
            title: "Команды",
            value: overview.total_teams,
            icon: Users,
            color: "text-slate-400"
        },
        {
            title: "Пользователи",
            value: overview.total_users,
            icon: User,
            color: "text-slate-400"
        }
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title} className="bg-neutral-900 border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-200">{card.title}</CardTitle>
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-neutral-100">{card.value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
