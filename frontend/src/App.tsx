import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth, RedirectIfAuth } from "@/components/RequireAuth";
import { AuthProvider } from "@/contexts/AuthContext";
import LoginPage from "@/pages/Login";
import HomePage from "@/pages/Home";
import AppLayout from "@/components/layout/AppLayout";
import TechnologiesPage from "@/pages/Technologies";
import ProjectsPage from "@/pages/Projects";
import TeamsPage from "@/pages/Teams";
import UsersPage from "@/pages/Users";
import AdminPage from "@/pages/Admin";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route element={<RedirectIfAuth />}>
						<Route path="/login" element={<LoginPage />} />
					</Route>
					<Route element={<RequireAuth />}>
						<Route element={<AppLayout />}>
							<Route path="/" element={<HomePage />} />
							<Route path="/technologies" element={<TechnologiesPage />} />
							<Route path="/projects" element={<ProjectsPage />} />
							<Route path="/teams" element={<TeamsPage />} />
							<Route path="/users" element={<UsersPage />} />
							<Route path="/admin" element={<AdminPage />} />
						</Route>
					</Route>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
