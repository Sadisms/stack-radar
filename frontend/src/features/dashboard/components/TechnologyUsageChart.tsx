import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface TechnologyUsageChartProps {
    data: Array<{
        name: string;
        project_count: number;
        category_name: string;
    }>;
}

const COLORS = ['#94a3b8', '#64748b', '#475569', '#94a3b8', '#64748b', '#475569', '#94a3b8', '#64748b', '#475569', '#94a3b8'];

export function TechnologyUsageChart({ data }: TechnologyUsageChartProps) {
    return (
        <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
                <CardTitle className="text-neutral-100">Top 10 технологий</CardTitle>
                <p className="text-sm text-neutral-400">По количеству использований в проектах</p>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                        <XAxis
                            dataKey="name"
                            stroke="#a3a3a3"
                            tick={{ fill: '#a3a3a3', fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis stroke="#a3a3a3" tick={{ fill: '#a3a3a3' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#171717',
                                border: '1px solid #404040',
                                borderRadius: '6px',
                                color: '#e5e5e5'
                            }}
                            itemStyle={{ color: '#e5e5e5' }}
                            cursor={{ fill: '#262626' }}
                        />
                        <Bar dataKey="project_count" name="Проектов">
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
