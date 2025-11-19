import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ProjectStatusChartProps {
    data: Array<{
        status: string;
        count: number;
    }>;
}

const STATUS_COLORS: Record<string, string> = {
    'active': '#94a3b8',
    'planning': '#64748b',
    'completed': '#475569',
    'on_hold': '#94a3b8',
    'archived': '#52525b'
};

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
    const chartData = data.map(item => ({
        ...item,
        fill: STATUS_COLORS[item.status] || '#6b7280'
    }));

    return (
        <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
                <CardTitle className="text-neutral-100">Распределение проектов</CardTitle>
                <p className="text-sm text-neutral-400">По статусам</p>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(props: any) => {
                                const percent = props.percent || 0;
                                const status = props.status || '';
                                return `${status}: ${(percent * 100).toFixed(0)}%`;
                            }}
                            outerRadius={80}
                            dataKey="count"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#171717',
                                border: '1px solid #404040',
                                borderRadius: '6px',
                                color: '#e5e5e5'
                            }}
                        />
                        <Legend
                            wrapperStyle={{ color: '#a3a3a3' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
