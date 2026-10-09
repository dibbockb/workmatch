import { cn } from "@/lib/utils";

const CONTRACT_STATUS_META: Record<
	string,
	{ label: string; chip: string; dot: string; live?: boolean }
> = {
	ACTIVE: {
		label: "Active",
		chip: "bg-sky-500/10 text-sky-600 ring-sky-500/30 dark:text-sky-400",
		dot: "bg-sky-500",
		live: true,
	},
	COMPLETED: {
		label: "Completed",
		chip: "bg-violet-500/10 text-violet-600 ring-violet-500/30 dark:text-violet-400",
		dot: "bg-violet-500",
	},
	CANCELLED: {
		label: "Cancelled",
		chip: "bg-muted text-muted-foreground ring-border",
		dot: "bg-muted-foreground/70",
	},
};

const CHIP_BASE =
	"inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] leading-none font-semibold tracking-wider whitespace-nowrap uppercase ring-1 ring-inset";

export function ContractStatusBadge({
	status,
	className,
}: {
	status: string;
	className?: string;
}) {
	const meta = CONTRACT_STATUS_META[status];

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
