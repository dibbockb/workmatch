"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldError } from "@/components/ui/field";
import { DEMO_ACCOUNTS, DEMO_ROLES, type DemoRole } from "@/lib/demo-accounts";
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
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { useLogin, useRegister } from "@/features/auth/queries";

function getNextPath() {
	const next = new URLSearchParams(window.location.search).get("next");
	const safe =
		next &&
		next.startsWith("/") &&
		!next.startsWith("//") &&
		!next.startsWith("/\\");
	return safe ? next : "/dashboard";
}

const PASSWORD_RULES = [
	{ key: "length", label: "8+ characters", test: (v: string) => v.length >= 8 },
	{
		key: "upper",
		label: "Uppercase letter",
		test: (v: string) => /[A-Z]/.test(v),
	},
	{ key: "number", label: "One number", test: (v: string) => /[0-9]/.test(v) },
] as const;

function PasswordChecklist({ value }: { value: string }) {
	if (!value) return null;
	return (
		<ul
			aria-label="Password requirements"
			className="mt-2 flex flex-wrap gap-1.5"
		>
			{PASSWORD_RULES.map((rule) => {
				const met = rule.test(value);
				return (
					<li
						key={rule.key}
						className={
							"animate-in fade-in zoom-in-95 duration-300 ease-out fill-mode-forwards " +
							"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors " +
							(met
								? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
								: "bg-muted text-muted-foreground")
						}
					>
						<CheckCircle
							weight={met ? "fill" : "regular"}
							className={
								"size-3 transition-transform duration-300 " +
								(met ? "scale-110" : "scale-100")
							}
						/>
						{rule.label}
					</li>
				);
			})}
		</ul>
	);
}

function getErrorMessage(error: unknown) {
	if (error && typeof error === "object") {
		const e = error as {
			response?: { _data?: { message?: unknown }; status?: number };
			data?: { message?: unknown };
			statusCode?: number;
		};
		const fromResponse = e.response?._data?.message;
		if (typeof fromResponse === "string" && fromResponse.trim()) {
			return fromResponse;
		}
		if (Array.isArray(fromResponse) && fromResponse.length > 0) {
			return String(fromResponse[0]);
		}
		const fromData = e.data?.message;
		if (typeof fromData === "string" && fromData.trim()) {
			return fromData;
		}
		if (Array.isArray(fromData) && fromData.length > 0) {
			return String(fromData[0]);
		}
		const status = e.response?.status ?? e.statusCode;
		if (status === 409) return "An account with this email already exists.";
		if (status === 400)
			return "Check your details and try again — passwords need 8+ characters with an uppercase letter and a number.";
	}
	return "Something went wrong. Please try again.";
}

const ROLE_ICONS: Record<DemoRole, typeof ShieldCheck> = {
	admin: ShieldCheck,
	client: Briefcase,
	freelancer: Palette,
};

const ROLE_OPTIONS = [
	{
		value: "CLIENT",
		title: "Hire talent",
		desc: "Post briefs, get matches",
		icon: Briefcase,
	},
	{
		value: "FREELANCER",
		title: "Offer services",
		desc: "Get matched to briefs",
		icon: Palette,
	},
] as const;

export default function SignupPage() {
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();
	const registerMutation = useRegister();
	const loginMutation = useLogin();
	const [loadingRole, setLoadingRole] = useState<DemoRole | "form" | null>(
		null,
	);

	const busy = registerMutation.isPending || loginMutation.isPending;
	const error = registerMutation.error ?? loginMutation.error;

	async function signUp(values: RegisterInput) {
		setLoadingRole("form");
		try {
			await registerMutation.mutateAsync(values);
			router.replace(getNextPath());
			router.refresh();
		} catch {
			setLoadingRole(null);
		}
	}

	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			password: "",
			role: "CLIENT",
		} as RegisterInput,
		validators: { onSubmit: registerSchema },
		onSubmit: ({ value }) => signUp(value),
	});

	async function handleDemoLogin(demoRole: DemoRole) {
		if (busy) return;
		const account = DEMO_ACCOUNTS[demoRole];
		setLoadingRole(demoRole);
		try {
			await loginMutation.mutateAsync({
				email: account.email,
				password: account.password,
			});
			router.replace(getNextPath());
			router.refresh();
		} catch {
			setLoadingRole(null);
		}
	}

	return (
		<div className="min-h-full bg-background font-sans text-foreground">
			<main className="mx-auto flex w-full max-w-md flex-col justify-center px-1 pt-24 pb-10 sm:px-5 sm:pt-16 sm:pb-4">
				<div className="animate-rise rounded-4xl border border-border bg-card p-6 shadow-[0_40px_100px_-40px_oklch(0.43_0.04_42/0.5)] sm:p-5">
					<h1 className="mt-1 text-2xl font-bold tracking-[-0.03em] sm:text-xl">
						Create your account
					</h1>
					<p className="mt-1.5 text-sm text-muted-foreground">
						Free to join — pay only when you hire someone you love.
					</p>

					<form.Field name="role">
						{(field) => (
							<div className="mt-4 sm:mt-3">
								<p
									id="role-label"
									className="text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase"
								>
									I want to
								</p>
								<div
									role="radiogroup"
									aria-labelledby="role-label"
									className="mt-3 grid grid-cols-2 gap-2"
								>
									{ROLE_OPTIONS.map((opt) => {
										const selected = field.state.value === opt.value;
										return (
											<label
												key={opt.value}
												className={cn(
													"cursor-pointer rounded-2xl border p-3 text-left transition-all duration-500 ease-snappy focus-within:ring-2 focus-within:ring-ring/60 focus-within:outline-none",
													selected
														? "border-primary/60 bg-secondary text-secondary-foreground shadow-md"
														: "border-border bg-background text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
												)}
											>
												<input
													type="radio"
													name="role"
													value={opt.value}
													checked={selected}
													onChange={() => field.handleChange(opt.value)}
													className="sr-only"
												/>
												<span className="flex items-center justify-between">
													<opt.icon weight="duotone" className="size-5" />
													{selected && (
														<CheckCircle weight="fill" className="size-4" />
													)}
												</span>
												<span className="mt-1.5 block text-sm font-bold">
													{opt.title}
												</span>
												<span
													className={cn(
														"block text-xs",
														selected ? "opacity-70" : "text-muted-foreground",
													)}
												>
													{opt.desc}
												</span>
											</label>
										);
									})}
								</div>
							</div>
						)}
					</form.Field>

					<form
						noValidate
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="mt-4 flex flex-col gap-3 sm:mt-3 sm:gap-2.5"
					>
						<form.Field name="name">
							{(field) => {
								const invalid = field.state.meta.errors.length > 0;
								return (
									<Field data-invalid={invalid}>
										<Label htmlFor={field.name}>Full name</Label>
										<Input
											id={field.name}
											name={field.name}
											type="text"
											autoComplete="name"
											placeholder="John Dough"
											aria-invalid={invalid}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								);
							}}
						</form.Field>

						<form.Field name="email">
							{(field) => {
								const invalid = field.state.meta.errors.length > 0;
								return (
									<Field data-invalid={invalid}>
										<Label htmlFor={field.name}>Email</Label>
										<Input
											id={field.name}
											name={field.name}
											type="email"
											autoComplete="email"
											placeholder="you@company.com"
											aria-invalid={invalid}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
										/>
										<FieldError errors={field.state.meta.errors} />
									</Field>
								);
							}}
						</form.Field>

						<form.Field name="password">
							{(field) => {
								const invalid = field.state.meta.errors.length > 0;
								return (
									<Field data-invalid={invalid}>
										<Label htmlFor={field.name}>Password</Label>
										<div className="relative">
											<Input
												id={field.name}
												name={field.name}
												type={showPassword ? "text" : "password"}
												autoComplete="new-password"
												placeholder="you will forget this"
												aria-invalid={invalid}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												className="pr-10"
											/>
											<button
												type="button"
												aria-label={
													showPassword ? "Hide password" : "Show password"
												}
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
										<PasswordChecklist value={field.state.value} />
										<FieldError errors={field.state.meta.errors} />
									</Field>
								);
							}}
						</form.Field>

						<Button
							type="submit"
							size="lg"
							disabled={busy}
							className="mt-1 w-full rounded-xl py-3 text-[15px] font-bold"
						>
							{busy && loadingRole === "form" ? (
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

					<p className="mt-4 text-center text-sm text-muted-foreground sm:mt-2 sm:text-xs">
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

					<p className="mt-4 text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase sm:mt-3">
						Or explore with a demo account
					</p>
					<div className="mt-3 grid grid-cols-3 gap-2 sm:mt-2">
						{DEMO_ROLES.map((demoRole) => {
							const Icon = ROLE_ICONS[demoRole];
							const isActive = busy && loadingRole === demoRole;
							return (
								<button
									key={demoRole}
									type="button"
									disabled={busy}
									onClick={() => handleDemoLogin(demoRole)}
									className={cn(
										"flex flex-col items-center gap-1 rounded-2xl border px-2 py-2.5 text-[13px] font-bold transition-all duration-500 ease-snappy disabled:cursor-wait disabled:opacity-70 sm:py-2",
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
