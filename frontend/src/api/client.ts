import Cookies from "js-cookie";

const TOKEN_COOKIE_NAME = "sr_token";
const ONE_DAY_IN_DAYS = 1;

export type User = {
	id: number;
	email: string;
	full_name: string;
	is_admin: boolean;
	is_active: boolean;
	created_at: string;
	updated_at: string;
};

export type PaginatedResponse<T> = {
	items: T[];
	page: number;
	page_size: number;
	total: number;
	total_pages: number;
	sort_by: string;
	sort_order: string;
};

export type LoginRequest = {
	email: string;
	password: string;
};

export type LoginResponse = {
	token: string;
	user: User;
};

export type TechnologyCategory = {
	id: number;
	name: string;
	description: string;
	icon: string;
	created_at: string;
};

export type Technology = {
	id: number;
	name: string;
	category_id: number;
	description: string;
	official_website: string;
	status: string;
	created_at: string;
	updated_at: string;
};

export type CreateTechnologyRequest = {
	name: string;
	category_id: number;
	description: string;
	official_website: string;
	status: string;
};

export type UpdateTechnologyRequest = CreateTechnologyRequest;

export type Project = {
	id: number;
	name: string;
	description: string;
	team_id: number | null;
	status: string;
	repository_url: string;
	start_date: string | null;
	created_at: string;
	updated_at: string;
};

export type CreateProjectRequest = {
	name: string;
	description: string;
	team_id: number | null;
	status: string;
	repository_url: string;
	start_date: string | null;
};

export type Team = {
	id: number;
	name: string;
	description: string;
	lead_id: number | null;
	created_at: string;
	updated_at: string;
};

export type CreateTeamRequest = {
	name: string;
	description: string;
	lead_id: number | null;
};

export type CreateUserRequest = {
	email: string;
	password: string;
	full_name: string;
	is_admin: boolean;
	is_active: boolean;
};

export type UpdateUserRequest = {
	email: string;
	full_name: string;
	is_admin: boolean;
	is_active: boolean;
};

export type DashboardStats = {
	overview: {
		total_projects: number;
		total_technologies: number;
		total_teams: number;
		total_users: number;
	};
	technology_usage: Array<{
		name: string;
		project_count: number;
		category_name: string;
	}>;
	project_status_distribution: Array<{
		status: string;
		count: number;
	}>;
	recent_projects: Array<{
		id: number;
		name: string;
		status: string;
		created_at: string;
		team_name: string | null;
		tech_count: number;
	}>;
	team_summary: Array<{
		id: number;
		name: string;
		project_count: number;
		lead_name: string | null;
	}>;
	technology_by_category: Array<{
		category: string;
		count: number;
	}>;
};

export type AddTechnologyToProjectRequest = {
	technology_id: number;
	version_id: number | null;
	usage_type: string;
	notes: string;
};

function getBaseUrl(): string {
	const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
	// Default to Vite proxy path to avoid CORS in Docker (proxied to backend)
	return fromEnv && fromEnv.length > 0 ? fromEnv : "/api/v1";
}

function getTokenFromCookies(): string | undefined {
	return Cookies.get(TOKEN_COOKIE_NAME);
}

export function setTokenToCookies(token: string): void {
	const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
	Cookies.set(TOKEN_COOKIE_NAME, token, {
		expires: ONE_DAY_IN_DAYS,
		secure: isSecure,
		sameSite: "lax"
	});
}

export function clearTokenCookie(): void {
	Cookies.remove(TOKEN_COOKIE_NAME);
}

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type RequestOptions = {
	method?: HttpMethod;
	body?: unknown;
	headers?: Record<string, string>;
	auth?: boolean;
	signal?: AbortSignal;
};

async function request<TResponse>(path: string, options?: RequestOptions): Promise<TResponse> {
	const baseUrl = getBaseUrl();
	const url = `${baseUrl}${path}`;

	const headers: Record<string, string> = {
		"Accept": "application/json",
		"Content-Type": "application/json",
		...(options?.headers ?? {})
	};

	// Attach Authorization header for all endpoints except when explicitly disabled (e.g., login)
	const shouldAuth = options?.auth !== false;
	if (shouldAuth) {
		const token = getTokenFromCookies();
		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}
	}

	const response = await fetch(url, {
		method: options?.method ?? "GET",
		headers,
		body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
		signal: options?.signal
	});

	if (!response.ok) {
		// If unauthorized, surface a specific error for upstream handling
		if (response.status === 401) {
			throw new Error("Unauthorized");
		}
		let message = `HTTP ${response.status}`;
		try {
			const errorPayload = await response.json();
			if (errorPayload && typeof errorPayload.message === "string") {
				message = errorPayload.message;
			}
		} catch {
			// no-op; keep default message
		}
		throw new Error(message);
	}

	// No content
	if (response.status === 204) {
		return undefined as unknown as TResponse;
	}
	return (await response.json()) as TResponse;
}

function buildQuery(params: Record<string, string | number | boolean | null | undefined>): string {
	const q = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === "") continue;
		q.append(key, String(value));
	}
	const s = q.toString();
	return s ? `?${s}` : "";
}

export const api = {
	// Auth
	async login(payload: LoginRequest): Promise<User> {
		const data = await request<LoginResponse>("/login", {
			method: "POST",
			body: payload,
			auth: false
		});
		setTokenToCookies(data.token);
		return data.user;
	},
	logout(): void {
		clearTokenCookie();
	},

	// Users
	listUsers(params?: {
		page?: number;
		page_size?: number;
		sort_by?: "created_at" | "email" | "full_name" | "role";
		sort_order?: "asc" | "desc";
		q?: string;
		role?: string;
	}): Promise<PaginatedResponse<User>> {
		const query = buildQuery({
			page: params?.page,
			page_size: params?.page_size,
			sort_by: params?.sort_by,
			sort_order: params?.sort_order,
			q: params?.q,
			role: params?.role
		});
		return request<PaginatedResponse<User>>(`/users${query}`);
	},
	createUser(payload: CreateUserRequest): Promise<User> {
		return request<User>("/users", { method: "POST", body: payload });
	},
	updateUser(id: number, payload: UpdateUserRequest): Promise<User> {
		return request<User>(`/users/${id}`, { method: "PUT", body: payload });
	},
	deleteUser(id: number): Promise<void> {
		return request<void>(`/users/${id}`, { method: "DELETE" });
	},

	// Dashboard
	getDashboardStats(): Promise<DashboardStats> {
		return request<DashboardStats>("/dashboard/stats");
	},

	// Technology Categories
	listTechnologyCategories(): Promise<TechnologyCategory[]> {
		return request<TechnologyCategory[]>("/technologies/categories");
	},
	createTechnologyCategory(payload: { name: string; description?: string; icon?: string }): Promise<TechnologyCategory> {
		return request<TechnologyCategory>("/technologies/categories", { method: "POST", body: payload });
	},
	// Technology statuses
	listTechnologyStatuses(): Promise<string[]> {
		return request<string[]>("/technologies/statuses");
	},
	createTechnologyStatus(name: string): Promise<void> {
		return request<void>("/technologies/statuses", { method: "POST", body: { name } });
	},

	// Technologies
	listTechnologies(params?: {
		page?: number;
		page_size?: number;
		sort_by?: "name" | "status" | "created_at";
		sort_order?: "asc" | "desc";
		q?: string;
		status?: string;
		category_id?: number;
	}): Promise<PaginatedResponse<Technology>> {
		const query = buildQuery({
			page: params?.page,
			page_size: params?.page_size,
			sort_by: params?.sort_by,
			sort_order: params?.sort_order,
			q: params?.q,
			status: params?.status,
			category_id: params?.category_id
		});
		return request<PaginatedResponse<Technology>>(`/technologies${query}`);
	},
	createTechnology(payload: CreateTechnologyRequest): Promise<Technology> {
		return request<Technology>("/technologies", { method: "POST", body: payload });
	},
	getTechnology(id: number): Promise<Technology> {
		return request<Technology>(`/technologies/${id}`);
	},
	updateTechnology(id: number, payload: UpdateTechnologyRequest): Promise<Technology> {
		return request<Technology>(`/technologies/${id}`, { method: "PUT", body: payload });
	},
	deleteTechnology(id: number): Promise<void> {
		return request<void>(`/technologies/${id}`, { method: "DELETE" });
	},
	getTechnologyUsageStats(): Promise<Record<string, unknown>> {
		return request<Record<string, unknown>>("/technologies/stats");
	},

	// Projects
	listProjects(params?: {
		page?: number;
		page_size?: number;
		sort_by?: "created_at" | "name" | "status" | "team_id";
		sort_order?: "asc" | "desc";
		q?: string;
		status?: string;
		team_id?: number;
	}): Promise<PaginatedResponse<Project>> {
		const query = buildQuery({
			page: params?.page,
			page_size: params?.page_size,
			sort_by: params?.sort_by,
			sort_order: params?.sort_order,
			q: params?.q,
			status: params?.status,
			team_id: params?.team_id
		});
		return request<PaginatedResponse<Project>>(`/projects${query}`);
	},
	createProject(payload: CreateProjectRequest): Promise<Project> {
		return request<Project>("/projects", { method: "POST", body: payload });
	},
	getProject(id: number): Promise<Project> {
		return request<Project>(`/projects/${id}`);
	},
	deleteProject(id: number): Promise<void> {
		return request<void>(`/projects/${id}`, { method: "DELETE" });
	},
	getProjectTechnologies(projectId: number): Promise<Record<string, unknown>[]> {
		return request<Record<string, unknown>[]>(`/projects/${projectId}/technologies`);
	},
	addTechnologyToProject(projectId: number, payload: AddTechnologyToProjectRequest): Promise<Record<string, unknown>> {
		return request<Record<string, unknown>>(`/projects/${projectId}/technologies`, { method: "POST", body: payload });
	},
	removeTechnologyFromProject(projectId: number, technologyId: number): Promise<void> {
		return request<void>(`/projects/${projectId}/technologies/${technologyId}`, { method: "DELETE" });
	},

	// Teams
	listTeams(params?: {
		page?: number;
		page_size?: number;
		sort_by?: "name" | "created_at";
		sort_order?: "asc" | "desc";
		q?: string;
	}): Promise<PaginatedResponse<Team>> {
		const query = buildQuery({
			page: params?.page,
			page_size: params?.page_size,
			sort_by: params?.sort_by,
			sort_order: params?.sort_order,
			q: params?.q
		});
		return request<PaginatedResponse<Team>>(`/teams${query}`);
	},
	createTeam(payload: CreateTeamRequest): Promise<Team> {
		return request<Team>("/teams", { method: "POST", body: payload });
	},
	getTeam(id: number): Promise<Team> {
		return request<Team>(`/teams/${id}`);
	},
	updateTeam(id: number, payload: CreateTeamRequest): Promise<Team> {
		return request<Team>(`/teams/${id}`, { method: "PUT", body: payload });
	},
	deleteTeam(id: number): Promise<void> {
		return request<void>(`/teams/${id}`, { method: "DELETE" });
	},

	// Admin - Archive Management
	previewArchive(inactiveDays: number): Promise<{
		count: number;
		inactive_days: number;
		projects: Array<{
			project_id: number;
			project_name: string;
			last_updated: string;
			days_inactive: number;
			action_taken: string;
		}>;
	}> {
		const query = buildQuery({ inactive_days: inactiveDays });
		return request(`/admin/archive/preview${query}`);
	},
	executeArchive(inactiveDays: number): Promise<{
		success: boolean;
		count: number;
		archived_projects: Array<{
			project_id: number;
			project_name: string;
			last_updated: string;
			days_inactive: number;
			action_taken: string;
		}>;
	}> {
		const query = buildQuery({ inactive_days: inactiveDays });
		return request(`/admin/archive/execute${query}`, { method: "POST" });
	},
	getArchiveHistory(limit: number = 10): Promise<{
		history: Array<{
			id: number;
			archived_at: string;
			archived_by_name: string;
			projects_count: number;
			inactive_threshold: number;
			notes: string;
		}>;
	}> {
		const query = buildQuery({ limit });
		return request(`/admin/archive/history${query}`);
	}
};


