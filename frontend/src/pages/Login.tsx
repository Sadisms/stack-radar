import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
	email: z.string().email(),
	password: z.string().min(4, "Минимум 4 символа"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
	const navigate = useNavigate();
	const location = useLocation() as any;
	const from = location.state?.from?.pathname || "/";
	const [submitError, setSubmitError] = useState<string | null>(null);
	const { setUser } = useAuth();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
	});

	const onSubmit = async (values: FormValues) => {
		setSubmitError(null);
		try {
			const user = await api.login(values);
			setUser(user);
			navigate(from, { replace: true });
		} catch (err: any) {
			setSubmitError(err?.message ?? "Login failed");
		}
	};

	return (
		<div className="min-h-screen w-full bg-neutral-900 text-neutral-100 flex items-center justify-center p-4">
			<Card className="w-full max-w-md border-neutral-800 bg-neutral-950">
				<CardHeader>
					<CardTitle className="text-2xl text-neutral-100">Вход</CardTitle>
					<CardDescription className="text-neutral-400">
						Введите email и пароль для входа
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								{...register("email")}
							/>
							{errors.email && (
								<p className="text-sm text-red-500">{errors.email.message}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Пароль</Label>
							<Input id="password" type="password" {...register("password")} />
							{errors.password && (
								<p className="text-sm text-red-500">{errors.password.message}</p>
							)}
						</div>
						{submitError && (
							<p className="text-sm text-red-500">{submitError}</p>
						)}
						<Button
							type="submit"
							className="w-full"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Входим..." : "Войти"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
