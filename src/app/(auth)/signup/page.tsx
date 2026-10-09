"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/landing/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";
import {
	DEMO_ACCOUNTS,
	DEMO_ROLES,
	fakeAuthRequest,
	type DemoRole,
} from "@/lib/demo-accounts";
import { cn } from "@/lib/utils";
import {
	ArrowRight,
	Briefcase,
	CheckCircle,
	CircleNotch,
	Eye,
	EyeSlash,
	Info,
	Palette,
	ShieldCheck,
} from "@phosphor-icons/react";
import { ZodError } from "zod";
import { useRouter } from "next/navigation";
import { useLogin, useRegister } from "@/features/auth/queries";

function getErrorMessage(error: unknown) {
	if (error instanceof ZodError)
		return error.issues[0]?.message ?? "Invalid input.";
	const e = error as { data?: { message?: string }; statusCode?: number };
	if (e?.data?.message) return e.data.message;
	if (e?.statusCode === 409)
		return "An account with this email already exists.";
	return "Something went wrong. Please try again.";
}

const ROLE_ICONS: Record<DemoRole, typeof ShieldCheck> = {
	admin: ShieldCheck,
	client: Briefcase,
	freelancer: Palette,
};

type SignupRole = "client" | "freelancer";

export default function SignupPage() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState<SignupRole>("client");
	const [showPassword, setShowPassword] = useState(false);
	const [notice, setNotice] = useState<string | null>(null);
	const router = useRouter();
	const registerMutation = useRegister();
	const loginMutation = useLogin();
	const [loadingRole, setLoadingRole] = useState<DemoRole | "form" | null>(
		null,
	);
	const loading =
		registerMutation.isPending ||
		loginMutation.isPending ||
		registerMutation.isSuccess ||
		loginMutation.isSuccess;
	const error = registerMutation.error ?? loginMutation.error;

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (loading) return;
		setLoadingRole("form");
		try {
			await registerMutation.mutateAsync({
				name,
				email,
				password,
				role: role.toUpperCase() as "CLIENT" | "FREELANCER",
			});
			router.replace("/dashboard");
			router.refresh();
		} catch {
			setLoadingRole(null);
		}
	}

	async function handleDemoLogin(demoRole: DemoRole) {
		if (loading) return;
		const account = DEMO_ACCOUNTS[demoRole];
		setEmail(account.email);
		setPassword(account.password);
		setLoadingRole(demoRole);
		try {
			await loginMutation.mutateAsync({
				email: account.email,
				password: account.password,
			});
			router.replace("/dashboard");
			router.refresh();
		} catch {
			setLoadingRole(null);
		}
	}

	return (
		<div className="min-h-full bg-background font-sans text-foreground">
			<Navbar />

			<main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 pt-24 pb-8">
				<div className="animate-rise rounded-4xl border border-border bg-card p-6 shadow-[0_40px_100px_-40px_oklch(0.43_0.04_42/0.5)] sm:p-7">
					<h1 className="mt-1 text-2xl font-bold tracking-[-0.03em]">
						Create your account
					</h1>
					<p className="mt-1.5 text-sm text-muted-foreground">
						Free to join — pay only when you hire someone you love.
					</p>

					<p className="mt-4 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
						I want to
					</p>
					<div className="mt-3 grid grid-cols-2 gap-2">
						{(
							[
								{
									value: "client",
									title: "Hire talent",
									desc: "Post briefs, get matches",
									icon: Briefcase,
								},
								{
									value: "freelancer",
									title: "Offer services",
									desc: "Get matched to briefs",
									icon: Palette,
								},
							] as const
						).map((opt) => (
							<button
								key={opt.value}
								type="button"
								onClick={() => setRole(opt.value)}
								aria-pressed={role === opt.value}
								className={cn(
									"rounded-2xl border p-3 text-left transition-all duration-500 ease-snappy",
									role === opt.value
										? "border-primary/60 bg-secondary text-secondary-foreground shadow-md"
										: "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
								)}
							>
								<span className="flex items-center justify-between">
									<opt.icon weight="duotone" className="size-5" />
									{role === opt.value && (
										<CheckCircle weight="fill" className="size-4" />
									)}
								</span>
								<span className="mt-1.5 block text-sm font-bold">
									{opt.title}
								</span>
								<span
									className={cn(
										"block text-xs",
										role === opt.value ? "opacity-70" : "text-muted-foreground",
									)}
								>
									{opt.desc}
								</span>
							</button>
						))}
					</div>

					<form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
						<Field>
							<Label htmlFor="name">Full name</Label>
							<Input
								id="name"
								type="text"
								autoComplete="name"
								required
								placeholder="Ada Lovelace"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</Field>

						<Field>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								required
								placeholder="you@company.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</Field>

						<Field>
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									required
									minLength={8}
									placeholder="8+ characters"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="pr-10"
								/>
								<button
									type="button"
									aria-label={showPassword ? "Hide password" : "Show password"}
									onClick={() => setShowPassword((v) => !v)}
									className="absolute top-1/2 right-2.5 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
								>
									{showPassword ? (
										<EyeSlash className="size-4" />
									) : (
										<Eye className="size-4" />
									)}
								</button>
							</div>
						</Field>

						<Button
							type="submit"
							size="lg"
							disabled={loading}
							className="mt-1 w-full rounded-xl py-3 text-[15px] font-bold"
						>
							{loading && loadingRole === "form" ? (
								<>
									<CircleNotch className="size-4 animate-spin" />
									Creating account…
								</>
							) : (
								<>
									Create account
									<ArrowRight className="size-4" />
								</>
							)}
						</Button>
					</form>

					<p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
						By creating an account you agree to our{" "}
						<a href="/signup" className="font-semibold hover:text-foreground">
							Terms
						</a>{" "}
						and{" "}
						<a href="/signup" className="font-semibold hover:text-foreground">
							Privacy Policy
						</a>
						.
					</p>

					<p className="mt-4 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase">
						Or explore with a demo account
					</p>
					<div className="mt-3 grid grid-cols-3 gap-2">
						{DEMO_ROLES.map((demoRole) => {
							const Icon = ROLE_ICONS[demoRole];
							const isActive = loading && loadingRole === demoRole;
							return (
								<button
									key={demoRole}
									type="button"
									disabled={loading}
									onClick={() => handleDemoLogin(demoRole)}
									className={cn(
										"flex flex-col items-center gap-1 rounded-2xl border px-2 py-2.5 text-[13px] font-bold transition-all duration-500 ease-snappy disabled:cursor-wait disabled:opacity-70",
										isActive
											? "border-primary/60 bg-secondary text-secondary-foreground shadow-md"
											: "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary hover:text-secondary-foreground hover:shadow-md",
									)}
								>
									{isActive ? (
										<CircleNotch className="size-5 animate-spin" />
									) : (
										<Icon weight="duotone" className="size-5" />
									)}
									{DEMO_ACCOUNTS[demoRole].label}
								</button>
							);
						})}
					</div>

					{error && (
						<p
							role="alert"
							className="mt-4 flex items-start gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive"
						>
							<Info className="mt-0.5 size-4 shrink-0" />
							{getErrorMessage(error)}
						</p>
					)}

					<p className="mt-4 text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/login"
							className="font-bold text-primary hover:underline"
						>
							Sign in
						</Link>
					</p>
				</div>
			</main>
		</div>
	);
}
