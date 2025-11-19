import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CategoryBreakdownProps {
    categories: Array<{
        category: string;
        count: number;
    }>;
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
    const maxCount = Math.max(...categories.map(c => c.count), 1);

    return (
        <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
                <CardTitle className="text-neutral-100">Технологии по категориям</CardTitle>
                <p className="text-sm text-neutral-400">Распределение технологий</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {categories.length === 0 ? (
                        <p className="text-neutral-500 text-center py-4">Нет данных</p>
                    ) : (
                        categories.map(cat => (
                            <div key={cat.category} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-200 font-medium">{cat.category}</span>
                                    <span className="text-neutral-400">{cat.count}</span>
                                </div>
                                <Progress
                                    value={(cat.count / maxCount) * 100}
                                    className="h-2"
                                />
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
