import { useDashboard } from "@/features/dashboard/hooks/useDashboard";
import { OverviewCards } from "@/features/dashboard/components/OverviewCards";
import { TechnologyUsageChart } from "@/features/dashboard/components/TechnologyUsageChart";
import { ProjectStatusChart } from "@/features/dashboard/components/ProjectStatusChart";
import { RecentProjects } from "@/features/dashboard/components/RecentProjects";
import { TeamSummary } from "@/features/dashboard/components/TeamSummary";
import { CategoryBreakdown } from "@/features/dashboard/components/CategoryBreakdown";

export default function HomePage() {
	const { data, loading, error } = useDashboard();

	if (loading) {
		return (
			<div className="min-h-screen w-full bg-neutral-950 text-neutral-100 p-6 flex items-center justify-center">
				<div className="text-center">
					<div className="text-xl text-neutral-400">Загрузка...</div>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="min-h-screen w-full bg-neutral-950 text-neutral-100 p-6 flex items-center justify-center">
				<div className="text-center">
					<div className="text-xl text-red-500">Ошибка загрузки данных</div>
					<p className="text-neutral-400 mt-2">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen w-full bg-neutral-950 text-neutral-100 p-6">
			<div className="mx-auto max-w-7xl space-y-8">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
					<p className="text-neutral-400 mt-1">Обзор проектов, технологий и команд</p>
				</div>

				<OverviewCards overview={data.overview} />

				<div className="grid gap-6 md:grid-cols-2">
					<TechnologyUsageChart data={data.technology_usage} />
					<ProjectStatusChart data={data.project_status_distribution} />
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					<RecentProjects projects={data.recent_projects} />
					<TeamSummary teams={data.team_summary} />
					<CategoryBreakdown categories={data.technology_by_category} />
				</div>
			</div>
		</div>
	);
}
