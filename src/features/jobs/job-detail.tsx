import {
	ArrowLeft,
	Briefcase,
	CalendarBlank,
	CurrencyDollar,
	FileText,
	Hash,
	MagnifyingGlass,
	WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatBudget, formatDeadline } from "./job-list";
import type { Job } from "./schemas";
import { JobStatusBadge } from "./status";

export type DetailJob = Job & {
	description?: string | null;
	duration?: string | null;
	experienceLevel?: string | null;
	createdAt?: string | null;
	updatedAt?: string | null;
};

/** Unwrap either a raw Job or an { data: Job } envelope. */
export function normalizeJob(raw: unknown): DetailJob | null {
	if (!raw || typeof raw !== "object") return null;
	const envelope = raw as { data?: unknown };
	if (envelope.data && typeof envelope.data === "object") {
		return envelope.data as DetailJob;
	}
	return raw as DetailJob;
}

export function formatLongDate(iso?: string | null) {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export function formatExperience(level?: string | null) {
	if (!level) return null;
	return level
		.toLowerCase()
		.split(/[_\s]+/)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

/* ------------------------------------------------------------------ *
 * Chrome
 * ------------------------------------------------------------------ */

export function JobDetailBack({
	href,
	label,
}: {
	href: string;
	label: string;
}) {
	return (
		<Link
			href={href}
			className="group inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
		>
			<span className="grid size-7 place-items-center rounded-lg border border-border bg-card shadow-xs transition-all group-hover:-translate-x-0.5 group-hover:border-primary/40 group-hover:text-primary">
				<ArrowLeft className="size-3.5" />
			</span>
			{label}
		</Link>
	);
}

export function JobDetailShell({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn("mx-auto flex w-full max-w-5xl flex-col gap-5", className)}
		>
			{children}
		</div>
	);
}

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

export function JobDetailHero({
	job,
	eyebrow,
	actions,
}: {
	job: DetailJob;
	eyebrow: string;
	actions?: ReactNode;
}) {
	const skills = job.requiredSkills ?? [];
	const deadlineShort = formatDeadline(job.deadline);
	const deadlineLong = formatLongDate(job.deadline);
	const initial = (job.client?.name ?? job.title ?? "W")
		.trim()
		.charAt(0)
		.toUpperCase();

	return (
		<header className="relative isolate overflow-hidden rounded-3xl border border-border bg-card shadow-xs animate-rise motion-reduce:animate-none">
			{/* Brand glows — same language as PageHeader */}
			<div
				aria-hidden
				className="pointer-events-none absolute -top-28 -right-20 size-72 rounded-full bg-primary/15 blur-3xl"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -bottom-32 -left-20 size-64 rounded-full bg-secondary/60 blur-3xl"
			/>
			{/* Top hairline accent */}
			<div
				aria-hidden
				className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-secondary"
			/>

			<div className="relative p-6 sm:p-8">
				<div className="flex flex-wrap items-center gap-2">
					<span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/70 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase backdrop-blur">
						<Briefcase className="size-3.5 text-primary" />
						{eyebrow}
					</span>
					<JobStatusBadge status={job.status} />
					<span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 font-mono text-[0.6875rem] text-muted-foreground">
						<Hash className="size-3" />
						{job.id.slice(0, 8)}
					</span>
					{deadlineShort && (
						<span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2.5 py-1 text-[0.6875rem] font-medium text-muted-foreground">
							<CalendarBlank className="size-3.5" />
							Due {deadlineLong ?? deadlineShort}
						</span>
					)}
				</div>

				<div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
					<div className="min-w-0 flex-1">
						<h1 className="max-w-2xl text-2xl font-bold tracking-tight text-balance sm:text-[2rem] sm:leading-[1.15]">
							{job.title}
						</h1>
						<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
							{job.client?.name && (
								<span className="inline-flex min-w-0 items-center gap-2">
									<span className="grid size-6 place-items-center rounded-full bg-primary text-[0.6875rem] font-bold text-primary-foreground">
										{initial}
									</span>
									<span className="font-medium text-foreground">
										{job.client.name}
									</span>
								</span>
							)}
							<span className="inline-flex items-center gap-1.5 tabular-nums">
								<CurrencyDollar className="size-4 text-primary" />
								<span className="font-semibold text-foreground">
									{formatBudget(job)}
								</span>
								<span className="text-xs">budget</span>
							</span>
							{typeof job.proposalCount === "number" && (
								<span className="inline-flex items-center gap-1.5">
									<FileText className="size-4" />
									<span className="font-semibold text-foreground tabular-nums">
										{job.proposalCount}
									</span>
									{job.proposalCount === 1 ? "proposal" : "proposals"}
								</span>
							)}
						</div>

						{skills.length > 0 && (
							<div className="mt-4 flex flex-wrap gap-1.5">
								{skills.map((skill) => (
									<span
										key={skill}
										className="rounded-lg border border-border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground"
									>
										{skill}
									</span>
								))}
							</div>
						)}
					</div>

					{actions && (
						<div className="flex shrink-0 flex-wrap items-center gap-2 lg:max-w-[240px] lg:justify-end">
							{actions}
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

/* ------------------------------------------------------------------ *
 * Cards
 * ------------------------------------------------------------------ */

export function DetailSection({
	icon,
	title,
	hint,
	action,
	children,
	className,
	delay = 0,
}: {
	icon: ReactNode;
	title: string;
	hint?: string;
	action?: ReactNode;
	children: ReactNode;
	className?: string;
	delay?: number;
}) {
	return (
		<section
			className={cn(
				"rounded-3xl border border-border bg-card p-6 shadow-xs animate-rise motion-reduce:animate-none sm:p-7",
				className,
			)}
			style={delay ? { animationDelay: `${delay}ms` } : undefined}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/60 text-secondary-foreground ring-1 ring-black/5">
						{icon}
					</span>
					<div>
						<h2 className="font-semibold tracking-tight">{title}</h2>
						{hint && (
							<p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
						)}
					</div>
				</div>
				{action}
			</div>
			<div className="mt-5">{children}</div>
		</section>
	);
}

export function DetailStat({
	label,
	value,
	sub,
}: {
	label: string;
	value: string;
	sub?: string;
}) {
	return (
		<div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3">
			<p className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
				{label}
			</p>
			<p className="mt-1 font-semibold tabular-nums">{value}</p>
			{sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
		</div>
	);
}

export function DetailSidebarCard({
	title,
	description,
	children,
	className,
	delay = 120,
}: {
	title: string;
	description?: string;
	children: ReactNode;
	className?: string;
	delay?: number;
}) {
	return (
		<aside
			className={cn(
				"rounded-3xl border border-border bg-card p-6 shadow-xs animate-rise motion-reduce:animate-none",
				className,
			)}
			style={{ animationDelay: `${delay}ms` }}
		>
			<h2 className="font-semibold tracking-tight">{title}</h2>
			{description && (
				<p className="mt-1 text-sm text-muted-foreground">{description}</p>
			)}
			<Separator className="my-4" />
			{children}
		</aside>
	);
}

/* ------------------------------------------------------------------ *
 * States
 * ------------------------------------------------------------------ */

export function JobDetailSkeleton({ backLabel }: { backLabel: string }) {
	return (
		<JobDetailShell>
			<span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
				<span className="grid size-7 place-items-center rounded-lg border border-border bg-card">
					<ArrowLeft className="size-3.5" />
				</span>
				{backLabel}
			</span>
			<div
				aria-hidden
				className="animate-pulse rounded-3xl border border-border bg-card p-6 sm:p-8"
			>
				<div className="flex flex-wrap gap-2">
					<div className="h-6 w-24 rounded-full bg-muted" />
					<div className="h-6 w-20 rounded-full bg-muted/70" />
					<div className="h-6 w-28 rounded-full bg-muted/70" />
				</div>
				<div className="mt-5 h-8 w-3/5 rounded-lg bg-muted" />
				<div className="mt-3 h-4 w-2/5 rounded-md bg-muted/70" />
				<div className="mt-4 flex gap-1.5">
					<div className="h-7 w-20 rounded-lg bg-muted/70" />
					<div className="h-7 w-20 rounded-lg bg-muted/70" />
					<div className="h-7 w-20 rounded-lg bg-muted/70" />
				</div>
			</div>
			<div className="grid gap-5 lg:grid-cols-[1fr_340px]">
				<div aria-hidden className="animate-pulse space-y-5">
					<div className="rounded-3xl border border-border bg-card p-6">
						<div className="h-5 w-32 rounded-md bg-muted" />
						<div className="mt-4 space-y-2.5">
							<div className="h-3.5 w-full rounded bg-muted/70" />
							<div className="h-3.5 w-full rounded bg-muted/70" />
							<div className="h-3.5 w-2/3 rounded bg-muted/70" />
						</div>
					</div>
				</div>
				<div
					aria-hidden
					className="animate-pulse rounded-3xl border border-border bg-card p-6"
				>
					<div className="h-5 w-28 rounded-md bg-muted" />
					<div className="mt-4 space-y-2.5">
						<div className="h-10 rounded-xl bg-muted/70" />
						<div className="h-10 rounded-xl bg-muted/70" />
						<div className="h-10 rounded-xl bg-muted" />
					</div>
				</div>
			</div>
		</JobDetailShell>
	);
}

export function JobDetailNotFound({
	title,
	description,
	backHref,
	backLabel,
	retryLabel = "Try again",
	onRetry,
}: {
	title: string;
	description: string;
	backHref: string;
	backLabel: string;
	retryLabel?: string;
	onRetry?: () => void;
}) {
	return (
		<JobDetailShell className="max-w-2xl items-center text-center">
			<div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14">
				<span className="grid size-12 place-items-center rounded-2xl bg-secondary/60 text-secondary-foreground">
					<MagnifyingGlass className="size-5" />
				</span>
				<h1 className="mt-4 text-xl font-bold tracking-tight">{title}</h1>
				<p className="mt-1.5 max-w-sm text-sm text-balance text-muted-foreground">
					{description}
				</p>
				<div className="mt-6 flex flex-wrap items-center justify-center gap-2">
					<Link
						href={backHref}
						className={buttonVariants({ variant: "outline" })}
					>
						{backLabel}
					</Link>
					{onRetry && (
						<Button type="button" onClick={onRetry}>
							{retryLabel}
						</Button>
					)}
				</div>
			</div>
		</JobDetailShell>
	);
}

export function JobDetailLoadError({
	onRetry,
	backHref,
	backLabel,
}: {
	onRetry: () => void;
	backHref: string;
	backLabel: string;
}) {
	return (
		<JobDetailShell className="max-w-2xl">
			<div
				role="alert"
				className="flex flex-col gap-4 rounded-3xl border border-destructive/30 bg-destructive/10 p-6 sm:flex-row sm:items-center"
			>
				<span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-destructive/15 text-destructive">
					<WarningCircle className="size-5" />
				</span>
				<div className="min-w-0 flex-1">
					<p className="font-semibold text-destructive">
						Could not load this job
					</p>
					<p className="mt-0.5 text-sm text-destructive/80">
						Check your connection and try again — or head back to the list.
					</p>
				</div>
				<div className="flex shrink-0 gap-2">
					<Link
						href={backHref}
						className={buttonVariants({ variant: "outline", size: "sm" })}
					>
						{backLabel}
					</Link>
					<Button
						size="sm"
						onClick={onRetry}
						className="border-destructive/30 bg-background/60 text-destructive hover:bg-background hover:text-destructive"
						variant="outline"
					>
						Retry
					</Button>
				</div>
			</div>
		</JobDetailShell>
	);
}
