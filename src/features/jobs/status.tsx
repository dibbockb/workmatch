import { cn } from "@/lib/utils";

export const JobStatus = {
	OPEN: "OPEN",
	CLOSED: "CLOSED",
	IN_PROGRESS: "IN_PROGRESS",
	COMPLETED: "COMPLETED",
	CANCELLED: "CANCELLED",
} as const;

export type JobStatusValue = (typeof JobStatus)[keyof typeof JobStatus];

type JobStatusMeta = {
	/** Text shown inside the chip. */
	label: string;
	/** Chip surface + text color. */
	chip: string;
	/** Dot color. */
	dot: string;
	/** Live statuses get a soft pulsing dot. */
	live?: boolean;
};

export const JOB_STATUS_META: Record<JobStatusValue, JobStatusMeta> = {
	OPEN: {
		label: "Open",
		chip: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400",
		dot: "bg-emerald-500",
		live: true,
	},
	IN_PROGRESS: {
		label: "In progress",
		chip: "bg-sky-500/10 text-sky-600 ring-sky-500/30 dark:text-sky-400",
		dot: "bg-sky-500",
		live: true,
	},
	COMPLETED: {
		label: "Completed",
		chip: "bg-violet-500/10 text-violet-600 ring-violet-500/30 dark:text-violet-400",
		dot: "bg-violet-500",
	},
	CLOSED: {
		label: "Closed",
		chip: "bg-muted text-muted-foreground ring-border",
		dot: "bg-muted-foreground/70",
	},
	CANCELLED: {
		label: "Cancelled",
		chip: "bg-rose-500/10 text-rose-600 ring-rose-500/30 dark:text-rose-400",
		dot: "bg-rose-500",
	},
};

const CHIP_BASE =
	"inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] leading-none font-semibold tracking-wider whitespace-nowrap uppercase ring-1 ring-inset";

export function JobStatusBadge({
	status,
	className,
}: {
	status: string;
	className?: string;
}) {
	const meta = JOB_STATUS_META[status as JobStatusValue];

	if (!meta) {
		return (
			<span
				className={cn(
					CHIP_BASE,
					"bg-muted text-muted-foreground ring-border",
					className,
				)}
			>
				{status || "Unknown"}
			</span>
		);
	}

	return (
		<span className={cn(CHIP_BASE, meta.chip, className)}>
			<span className="relative flex size-1.5">
				{meta.live && (
					<span
						aria-hidden
						className={cn(
							"absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:animate-none",
							meta.dot,
						)}
					/>
				)}
				<span
					aria-hidden
					className={cn("relative inline-flex size-1.5 rounded-full", meta.dot)}
				/>
			</span>
			{meta.label}
		</span>
	);
}
