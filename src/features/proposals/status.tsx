import { cn } from "@/lib/utils";

const PROPOSAL_STATUS_META: Record<
	string,
	{ label: string; chip: string; dot: string; live?: boolean }
> = {
	PENDING: {
		label: "Pending",
		chip: "bg-amber-500/10 text-amber-600 ring-amber-500/30 dark:text-amber-400",
		dot: "bg-amber-500",
		live: true,
	},
	ACCEPTED: {
		label: "Accepted",
		chip: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400",
		dot: "bg-emerald-500",
	},
	REJECTED: {
		label: "Rejected",
		chip: "bg-rose-500/10 text-rose-600 ring-rose-500/30 dark:text-rose-400",
		dot: "bg-rose-500",
	},
	WITHDRAWN: {
		label: "Withdrawn",
		chip: "bg-muted text-muted-foreground ring-border",
		dot: "bg-muted-foreground/70",
	},
};

const CHIP_BASE =
	"inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] leading-none font-semibold tracking-wider whitespace-nowrap uppercase ring-1 ring-inset";

export function ProposalStatusBadge({
	status,
	className,
}: {
	status: string;
	className?: string;
}) {
	const meta = PROPOSAL_STATUS_META[status];

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
