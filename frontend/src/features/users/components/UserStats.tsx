import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface UserStatsProps {
    total: number;
}

export function UserStats({ total }: UserStatsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-200">Всего пользователей</CardTitle>
                    <Users className="h-4 w-4 text-neutral-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-neutral-100">{total}</div>
                </CardContent>
            </Card>
        </div>
    );
}
