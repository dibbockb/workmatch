"use client";

import { cn } from "@/lib/utils";

export type ChartSegment = {
	key: string;
	label: string;
	value: number;
	/** Tailwind stroke class, e.g. "stroke-emerald-500". */
	stroke: string;
	/** Tailwind dot class, e.g. "bg-emerald-500". */
	dot: string;
	/** Tailwind bar class, e.g. "bg-emerald-500". */
	bar: string;
};

const RADIUS = 15.9155;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DonutChart({
	segments,
	size = 168,
	thickness = 22,
	centerLabel,
	centerValue,
}: {
	segments: ChartSegment[];
	size?: number;
	thickness?: number;
	centerLabel: string;
	centerValue: string;
}) {
	const total = segments.reduce((sum, s) => sum + s.value, 0);
	let offset = 25; // start at top

	return (
		<div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
			<div
				role="img"
				aria-label={`${centerLabel}: ${centerValue}`}
				className="relative shrink-0"
				style={{ width: size, height: size }}
			>
				<svg viewBox="0 0 42 42" width={size} height={size} aria-hidden>
					<circle
						cx="21"
						cy="21"
						r={RADIUS}
						fill="none"
						strokeWidth={thickness / 4.5}
						className="stroke-muted"
					/>
					{total > 0 &&
						segments
							.filter((s) => s.value > 0)
							.map((s) => {
								const fraction = s.value / total;
								// Small gap between slices.
								const length = Math.max(fraction * CIRCUMFERENCE - 0.6, 0.1);
								const dashOffset = offset;
								offset -= fraction * CIRCUMFERENCE;
								return (
									<circle
										key={s.key}
										cx="21"
										cy="21"
										r={RADIUS}
										fill="none"
										strokeWidth={thickness / 4.5}
										strokeLinecap="round"
										strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
										strokeDashoffset={dashOffset}
										className={cn(s.stroke, "transition-all duration-700")}
									/>
								);
							})}
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<p className="text-2xl font-bold tabular-nums">{centerValue}</p>
					<p className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
						{centerLabel}
					</p>
				</div>
			</div>
			<ul className="grid w-full min-w-0 flex-1 gap-2">
				{segments.map((s) => {
					const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
					return (
						<li
							key={s.key}
							className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/50 px-3 py-2"
						>
							<span
								aria-hidden
								className={cn("size-2.5 shrink-0 rounded-full", s.dot)}
							/>
							<span className="min-w-0 flex-1 truncate text-sm font-medium">
								{s.label}
							</span>
							<span className="text-sm font-bold tabular-nums">
								{s.value.toLocaleString()}
							</span>
							<span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
								{pct}%
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}

export function StatusBars({ segments }: { segments: ChartSegment[] }) {
	const max = Math.max(1, ...segments.map((s) => s.value));
	const total = segments.reduce((sum, s) => sum + s.value, 0);
	return (
		<ul className="flex flex-col gap-3">
			{segments.map((s) => (
				<li key={s.key}>
					<div className="flex items-baseline justify-between gap-3 text-sm">
						<span className="font-medium">{s.label}</span>
						<span className="text-muted-foreground tabular-nums">
							<span className="font-bold text-foreground">
								{s.value.toLocaleString()}
							</span>{" "}
							· {total > 0 ? Math.round((s.value / total) * 100) : 0}%
						</span>
					</div>
					<div
						role="progressbar"
						aria-valuenow={s.value}
						aria-valuemin={0}
						aria-valuemax={max}
						aria-label={s.label}
						className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted"
					>
						<div
							className={cn(
								"h-full rounded-full transition-[width] duration-700 ease-snappy",
								s.bar,
							)}
							style={{ width: `${(s.value / max) * 100}%` }}
						/>
					</div>
				</li>
			))}
		</ul>
	);
}
