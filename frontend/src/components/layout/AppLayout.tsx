import type { ElementType } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AccountMenu } from "@/components/AccountMenu";
import { Link, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Boxes, FolderKanban, Users, User, Settings } from "lucide-react";

type NavItem = {
	label: string;
	icon: ElementType;
	to?: string;
	action?: () => void;
	adminOnly?: boolean;
};

const navItems: NavItem[] = [
	{ to: "/", label: "Главная", icon: Home },
	{ to: "/technologies", label: "Технологии", icon: Boxes },
	{ to: "/projects", label: "Проекты", icon: FolderKanban },
	{ to: "/teams", label: "Команды", icon: Users },
	{ to: "/users", label: "Пользователи", icon: User, adminOnly: true },
	{ to: "/admin", label: "Админ", icon: Settings, adminOnly: true },
];

export default function AppLayout() {
	const location = useLocation();
	const { isAdmin } = useAuth();

	const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

	return (
		<SidebarProvider>
			<Sidebar className="bg-neutral-950 border-neutral-800">
				<SidebarHeader className="px-4 py-3">
					<div className="text-neutral-100 font-semibold">Stack Radar</div>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent>
							<SidebarMenu>
								{visibleNavItems.map((item) => {
									const active = location.pathname === item.to;
									return (
										<SidebarMenuItem key={item.to ?? item.label}>
											{item.to ? (
												<SidebarMenuButton asChild>
													<Link
														to={item.to}
														className={cn("flex items-center gap-2", active ? "bg-neutral-800 text-neutral-100" : "")}
													>
														<item.icon className="h-4 w-4" />
														{item.label}
													</Link>
												</SidebarMenuButton>
											) : (
												<SidebarMenuButton asChild>
													<button
														type="button"
														className={cn("flex w-full items-center gap-2 text-left")}
														onClick={item.action}
													>
														<item.icon className="h-4 w-4" />
														{item.label}
													</button>
												</SidebarMenuButton>
											)}
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter />
				<SidebarRail />
			</Sidebar>
			<SidebarInset>
				<header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 backdrop-blur">
					<div />
					<div className="flex items-center gap-2">
						<Separator orientation="vertical" className="h-6 bg-neutral-800" />
						<AccountMenu />
					</div>
				</header>
				<main className="min-h-[calc(100vh-3.5rem)] bg-neutral-900 text-neutral-100">
					<Outlet />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}