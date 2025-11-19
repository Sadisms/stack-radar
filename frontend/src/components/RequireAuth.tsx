import Cookies from "js-cookie";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const TOKEN_COOKIE_NAME = "sr_token";

export function RequireAuth() {
	const token = Cookies.get(TOKEN_COOKIE_NAME);
	const location = useLocation();
	if (!token) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}
	return <Outlet />;
}

export function RedirectIfAuth() {
	const token = Cookies.get(TOKEN_COOKIE_NAME);
	if (token) {
		return <Navigate to="/" replace />;
	}
	return <Outlet />;
}


