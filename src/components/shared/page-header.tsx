import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Elevated header card with a soft two-tone glow — the visual anchor for
 * dashboard pages.
 */
export function PageHeader({
	title,
	description,
	actions,
	className,
}: {
	title: string;
	description?: string;
	actions?: ReactNode;
	className?: string;
}) {
	return (
		<header
			className={cn(
				"relative isolate overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xs animate-rise motion-reduce:animate-none",
				className,
			)}
		>
			<div
				aria-hidden
				className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-primary/15 blur-3xl"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute -bottom-28 -left-16 size-56 rounded-full bg-secondary/70 blur-3xl"
			/>
			<div className="relative flex flex-wrap items-end justify-between gap-5">
				<div className="min-w-0">
					<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
						{title}
					</h1>
					{description && (
						<p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
							{description}
						</p>
					)}
				</div>
				{actions && (
					<div className="flex shrink-0 items-center gap-3">{actions}</div>
				)}
			</div>
		</header>
	);
}

/** Big number tile, usually dropped into `PageHeader`'s `actions`. */
export function HeaderStat({
	value,
	label,
	loading,
}: {
	value: number;
	label: string;
	loading?: boolean;
}) {
	return (
		<div className="rounded-2xl border border-border/70 bg-background/60 px-4 py-3 text-right backdrop-blur">
			<p className="text-2xl leading-none font-bold tabular-nums">
				{loading ? (
					<span className="inline-block h-7 w-10 animate-pulse rounded-md bg-muted align-middle" />
				) : (
					value.toLocaleString()
				)}
			</p>
			<p className="mt-1.5 text-xs font-medium text-muted-foreground">
				{label}
			</p>
		</div>
	);
}
