import {
	Briefcase,
	CalendarBlank,
	CaretLeft,
	CaretRight,
	CurrencyDollar,
	MagnifyingGlass,
	WarningCircle,
	X,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { JobStatus, JobStatusBadge } from "./status";

export type JobSummary = {
	id: string;
	title: string;
	budgetMin: number | string;
	budgetMax: number | string;
	status: string;
	requiredSkills?: string[];
	deadline?: string | null;
	proposalCount?: number;
	client?: { name?: string | null; profileImageUrl?: string | null };
};

const money = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});

const MAX_SKILLS = 3;

export function formatBudget(job: Pick<JobSummary, "budgetMin" | "budgetMax">) {
	// `my-posted` returns budgets as strings — coerce before comparing.
	const min = Number(job.budgetMin);
	const max = Number(job.budgetMax);
	if (
		job.budgetMin == null ||
		job.budgetMax == null ||
		!Number.isFinite(min) ||
		!Number.isFinite(max)
	) {
		return "Flexible budget";
	}
	if (min === max) return money.format(min);
	return `${money.format(min)} – ${money.format(max)}`;
}

export function formatDeadline(iso?: string | null) {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ------------------------------------------------------------------ *
 * Row
 * ------------------------------------------------------------------ */

export function JobCard({
	job,
	index = 0,
	meta,
	href,
}: {
	job: JobSummary;
	index?: number;
	meta?: ReactNode;
	href?: string;
}) {
	const skills = job.requiredSkills ?? [];
	const deadline = formatDeadline(job.deadline);
	const clickable = Boolean(href);

	return (
		<li
			className="animate-rise motion-reduce:animate-none"
			style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
		>
			<article
				className={cn(
					"group relative isolate overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5",
					"transition-all duration-300 ease-snappy",
					"hover:-translate-y-1 hover:border-primary/35 hover:shadow-lg",
					"focus-within:border-primary/35 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
					clickable && "cursor-pointer",
				)}
			>
				{clickable && href && (
					<Link
						href={href}
						aria-label={`View ${job.title}`}
						className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
					>
						<span className="sr-only">View {job.title}</span>
					</Link>
				)}
				{/* Left accent rail — grows in on hover */}
				<span
					aria-hidden
					className="absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 bg-primary transition-transform duration-300 ease-snappy group-hover:scale-y-100"
				/>
				{/* Warm corner glow for live jobs */}
				{job.status === JobStatus.OPEN && (
					<span
						aria-hidden
						className="pointer-events-none absolute -top-20 -right-14 size-44 rounded-full bg-primary/12 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
					/>
				)}

				<div className="relative flex items-start gap-4">
					<span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary/60 text-secondary-foreground ring-1 ring-black/5 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
						<Briefcase className="size-5" />
					</span>

					<div className="min-w-0 flex-1">
						<div className="flex items-start justify-between gap-3">
							<h3 className="min-w-0 flex-1 font-semibold leading-snug tracking-tight transition-colors group-hover:text-primary">
								{job.title}
							</h3>
							<JobStatusBadge status={job.status} />
						</div>

						<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2.5 text-sm">
							<span className="inline-flex items-center gap-1.5 font-semibold text-foreground tabular-nums">
								<CurrencyDollar className="size-4 text-primary" />
								{formatBudget(job)}
							</span>
							<span className="text-[0.65rem] font-medium tracking-wider text-muted-foreground uppercase">
								Budget
							</span>

							{skills.length > 0 && (
								<span className="inline-flex flex-wrap items-center gap-1.5">
									{skills.slice(0, MAX_SKILLS).map((skill) => (
										<span
											key={skill}
											className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground"
										>
											{skill}
										</span>
									))}
									{skills.length > MAX_SKILLS && (
										<span className="px-0.5 text-xs font-medium text-muted-foreground">
											+{skills.length - MAX_SKILLS}
										</span>
									)}
								</span>
							)}

							{deadline && (
								<span className="inline-flex items-center gap-1.5 text-muted-foreground">
									<CalendarBlank className="size-4" />
									<span className="text-xs">Due</span>
									<span className="font-medium text-foreground">
										{deadline}
									</span>
								</span>
							)}

							{meta}
						</div>
					</div>
				</div>
			</article>
		</li>
	);
}

/* ------------------------------------------------------------------ *
 * Search
 * ------------------------------------------------------------------ */

export function JobsSearch({
	value,
	onChange,
	placeholder = "Search jobs...",
	label = "Search jobs",
	className,
}: {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	label?: string;
	className?: string;
}) {
	return (
		<div className={cn("relative w-full sm:max-w-sm", className)}>
			<MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				aria-label={label}
				className="h-10 rounded-xl border-border bg-card pr-9 pl-9 shadow-xs placeholder:text-muted-foreground/70"
			/>
			{value && (
				<button
					type="button"
					onClick={() => onChange("")}
					aria-label="Clear search"
					className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
				>
					<X className="size-3.5" />
				</button>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ *
 * States
 * ------------------------------------------------------------------ */

const SKELETON_ROWS = [0, 1, 2, 3];

export function JobListSkeleton({ rows = 4 }: { rows?: number }) {
	return (
		<ul className="grid gap-3" aria-hidden>
			{SKELETON_ROWS.slice(0, rows).map((row) => (
				<li
					key={row}
					className="animate-pulse rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5"
				>
					<div className="flex items-start gap-4">
						<span className="size-11 shrink-0 rounded-xl bg-muted" />
						<div className="min-w-0 flex-1 space-y-2.5">
							<div className="h-4 w-2/5 rounded-md bg-muted" />
							<div className="h-3.5 w-1/4 rounded-md bg-muted/70" />
						</div>
						<span className="h-6 w-24 shrink-0 rounded-full bg-muted" />
					</div>
				</li>
			))}
		</ul>
	);
}

export function JobsError({ onRetry }: { onRetry: () => void }) {
	return (
		<div
			role="alert"
			className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
		>
			<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive">
				<WarningCircle className="size-5" />
			</span>
			<div className="min-w-0 flex-1">
				<p className="font-semibold text-destructive">Could not load jobs</p>
				<p className="mt-0.5 text-sm text-destructive/80">
					Check your connection and try again.
				</p>
			</div>
			<Button
				variant="outline"
				size="sm"
				onClick={onRetry}
				className="border-destructive/30 bg-background/60 text-destructive hover:bg-background hover:text-destructive"
			>
				Retry
			</Button>
		</div>
	);
}

export function JobsEmpty({
	title,
	description,
	action,
	icon,
}: {
	title: string;
	description: string;
	action?: ReactNode;
	icon?: ReactNode;
}) {
	return (
		<div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
			<span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
				{icon ?? <MagnifyingGlass className="size-5" />}
			</span>
			<p className="mt-4 font-semibold">{title}</p>
			<p className="mt-1 max-w-sm text-sm text-balance text-muted-foreground">
				{description}
			</p>
			{action && <div className="mt-5">{action}</div>}
		</div>
	);
}

/* ------------------------------------------------------------------ *
 * Pagination
 * ------------------------------------------------------------------ */

type PageItem = { key: string; value: number | null };

function buildPages(page: number, totalPages: number): PageItem[] {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => ({
			key: `p${i + 1}`,
			value: i + 1,
		}));
	}

	const wanted = new Set<number>([1, totalPages, page, page - 1, page + 1]);
	const nearStart = page <= 3 ? [2, 3, 4] : [];
	const nearEnd =
		page >= totalPages - 2
			? [totalPages - 3, totalPages - 2, totalPages - 1]
			: [];
	for (const n of [...nearStart, ...nearEnd]) wanted.add(n);

	const sorted = [...wanted]
		.filter((n) => n >= 1 && n <= totalPages)
		.sort((a, b) => a - b);

	const items: PageItem[] = [];
	let previous = 0;
	for (const value of sorted) {
		if (previous && value - previous > 1)
			items.push({ key: `gap${previous}`, value: null });
		items.push({ key: `p${value}`, value });
		previous = value;
	}
	return items;
}

export function JobsPagination({
	page,
	totalPages,
	total,
	limit,
	unit = "jobs",
	disabled = false,
	onChange,
}: {
	page: number;
	totalPages: number;
	total?: number;
	limit?: number;
	unit?: string;
	disabled?: boolean;
	onChange: (page: number) => void;
}) {
	const showRange =
		total !== undefined && limit !== undefined && total > 0 && totalPages > 0;
	const from = showRange ? (page - 1) * (limit ?? 0) + 1 : 0;
	const to = showRange ? Math.min(from + (limit ?? 0) - 1, total ?? 0) : 0;
	const items = buildPages(page, Math.max(totalPages, 1));

	return (
		<div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
			<p className="text-sm text-muted-foreground">
				{total !== undefined && (
					<>
						<span className="font-medium text-foreground tabular-nums">
							{total.toLocaleString()}
						</span>{" "}
						{total === 1 ? unit.replace(/s$/, "") : unit}
					</>
				)}
				{showRange && (
					<span className="tabular-nums">
						{" · Showing "}
						{from.toLocaleString()}–{to.toLocaleString()}
					</span>
				)}
			</p>

			<nav aria-label="Pagination" className="flex items-center gap-1.5">
				<Button
					variant="outline"
					size="icon"
					aria-label="Previous page"
					disabled={disabled || page <= 1}
					onClick={() => onChange(page - 1)}
				>
					<CaretLeft className="size-4" />
				</Button>

				{items.map((item) =>
					item.value === null ? (
						<span
							key={item.key}
							aria-hidden
							className="px-1 text-sm text-muted-foreground"
						>
							…
						</span>
					) : (
						<button
							key={item.key}
							type="button"
							aria-current={item.value === page ? "page" : undefined}
							aria-label={`Page ${item.value}`}
							disabled={disabled}
							onClick={() => onChange(item.value ?? 1)}
							className={cn(
								"grid h-8 min-w-8 place-items-center rounded-lg px-2 text-sm font-medium tabular-nums transition-colors",
								"focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none disabled:opacity-50",
								item.value === page
									? "bg-primary text-primary-foreground shadow-xs"
									: "text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							{item.value}
						</button>
					),
				)}

				<Button
					variant="outline"
					size="icon"
					aria-label="Next page"
					disabled={disabled || page >= totalPages}
					onClick={() => onChange(page + 1)}
				>
					<CaretRight className="size-4" />
				</Button>
			</nav>
		</div>
	);
}
