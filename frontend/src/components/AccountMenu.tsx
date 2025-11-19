import { useNavigate } from "react-router-dom";
import { api } from "@/api/client";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function AccountMenu() {
	const navigate = useNavigate();

	function handleLogout() {
		api.logout();
		navigate("/login", { replace: true });
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full">
					<Avatar className="h-8 w-8">
						<AvatarFallback>SR</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				<DropdownMenuLabel>Аккаунт</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleLogout}>Выйти</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}


