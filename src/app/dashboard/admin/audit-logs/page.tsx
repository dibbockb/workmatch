"use client";

import {
	ArrowCounterClockwise,
	CurrencyDollar,
	FileText,
	Handshake,
	Prohibit,
	Scroll,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { HeaderStat, PageHeader } from "@/components/shared/page-header";
import { JobsEmpty, JobsSearch } from "@/features/jobs/job-list";
import { useAdminUsers, useAuditLogs } from "@/features/admin/queries";
import { cn } from "@/lib/utils";

type Category = "contract" | "payment" | "counter" | "user" | "other";

const CATEGORIES: { key: Category | "ALL"; label: string }[] = [
	{ key: "ALL", label: "All" },
	{ key: "contract", label: "Contracts" },
	{ key: "payment", label: "Payments" },
	{ key: "counter", label: "Counter offers" },
	{ key: "user", label: "Users" },
	{ key: "other", label: "Other" },
];

function categorize(action: string): Category {
	if (action.startsWith("CONTRACT")) return "contract";
	if (action.startsWith("PAYMENT")) return "payment";
	if (action.startsWith("COUNTER")) return "counter";
	if (
		action.includes("USER") ||
		action.includes("BLOCK") ||
		action.includes("ADMIN")
	)
		return "user";
	return "other";
}

const CATEGORY_META: Record<
	Category,
	{ icon: typeof FileText; chip: string; iconColor: string }
> = {
	contract: {
		icon: Handshake,
		chip: "bg-sky-500/10 text-sky-600 ring-sky-500/30 dark:text-sky-400",
		iconColor: "text-sky-500",
	},
	payment: {
		icon: CurrencyDollar,
		chip: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/30 dark:text-emerald-400",
		iconColor: "text-emerald-500",
	},
	counter: {
		icon: ArrowCounterClockwise,
		chip: "bg-amber-500/10 text-amber-600 ring-amber-500/30 dark:text-amber-400",
		iconColor: "text-amber-500",
	},
	user: {
		icon: Prohibit,
		chip: "bg-rose-500/10 text-rose-600 ring-rose-500/30 dark:text-rose-400",
		iconColor: "text-rose-500",
	},
	other: {
		icon: FileText,
		chip: "bg-muted text-muted-foreground ring-border",
		iconColor: "text-muted-foreground",
	},
};

function humanize(action: string) {
	return action
		.toLowerCase()
		.split("_")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

function timeAgo(iso: string) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "—";
	const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
	if (seconds < 60) return "just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function describeQueryError(error: unknown): {
	status: number | null;
	message: string;
} {
	if (error && typeof error === "object") {
		const err = error as {
			response?: { status?: number; _data?: { message?: unknown } };
			data?: { message?: unknown };
		};
		const status = err.response?.status ?? null;
		const fromResponse = err.response?._data?.message;
		if (typeof fromResponse === "string" && fromResponse.trim()) {
			return { status, message: fromResponse };
		}
		if (Array.isArray(fromResponse) && fromResponse.length > 0) {
			return { status, message: String(fromResponse[0]) };
		}
		const fromData = err.data?.message;
		if (typeof fromData === "string" && fromData.trim()) {
			return { status, message: fromData };
		}
		if (error instanceof Error && error.message) {
			return { status, message: error.message };
		}
	}
	return { status: null, message: "Unknown error" };
}

function fullDate(iso: string) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

export default function AdminAuditLogsPage() {
	const router = useRouter();
	const params = useSearchParams();
	const rawCategory = params.get("category") ?? "ALL";
	const category = CATEGORIES.some((c) => c.key === rawCategory)
		? rawCategory
		: "ALL";
	const search = params.get("search") ?? "";

	const [query, setQuery] = useState(search);
	useEffect(() => setQuery(search), [search]);

	const { data, isLoading, isError, isFetching, refetch, error } =
		useAuditLogs();
	const { data: usersData } = useAdminUsers();
	const queryError = isError ? describeQueryError(error) : null;

	const nameById = useMemo(() => {
		const map = new Map<string, string>();
		for (const u of usersData?.data.users ?? []) map.set(u.id, u.name);
		return map;
	}, [usersData]);

	const logs = useMemo(() => data?.data.logs ?? [], [data]);
	const total = data?.data.total ?? logs.length;

	const visible = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return logs.filter((log) => {
			if (category !== "ALL" && categorize(log.action) !== category)
				return false;
			if (!needle) return true;
			const actor = log.userId ? (nameById.get(log.userId) ?? "") : "system";
			return `${log.action} ${log.entityType} ${log.entityId} ${actor}`
				.toLowerCase()
				.includes(needle);
		});
	}, [logs, category, query, nameById]);

	function setParam(key: string, value: string) {
		const next = new URLSearchParams(params);
		value ? next.set(key, value) : next.delete(key);
		router.push(`?${next.toString()}`);
	}

	function onSearch(value: string) {
		setQuery(value);
		setParam("search", value);
	}

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
			<PageHeader
				title="Audit logs"
				description="View critical events happened in the app."
				actions={
					<HeaderStat value={total} label="total events" loading={isLoading} />
				}
			/>

			<div className="flex flex-col gap-3">
				<div
					role="tablist"
					aria-label="Filter by category"
					className="flex flex-wrap gap-1.5"
				>
					{CATEGORIES.map((c) => {
						const active = category === c.key;
						return (
							<button
								key={c.key}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() =>
									setParam("category", c.key === "ALL" ? "" : c.key)
								}
								className={cn(
									"rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
									active
										? "border-primary/40 bg-primary text-primary-foreground shadow-xs"
										: "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
								)}
							>
								{c.label}
							</button>
						);
					})}
				</div>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<JobsSearch
						value={query}
						onChange={onSearch}
						placeholder="Search action, entity or actor..."
						label="Search audit logs"
					/>
					{isFetching && !isLoading && (
						<span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
							<span
								aria-hidden
								className="size-1.5 animate-pulse rounded-full bg-primary"
							/>
							Updating results…
						</span>
					)}
				</div>
			</div>

			{isError && queryError && (
				<div
					role="alert"
					className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
				>
					<div className="min-w-0 flex-1">
						<p className="font-semibold text-destructive">
							Could not load audit logs
							{queryError.status !== null && (
								<span className="tabular-nums"> ({queryError.status})</span>
							)}
						</p>
						<p className="mt-0.5 text-sm wrap-break-word text-destructive/80">
							{queryError.message}
						</p>
						{queryError.status === 403 && (
							<p className="mt-1 text-sm text-destructive/80">
								This endpoint is admin-only.
							</p>
						)}
						{queryError.status === 401 && (
							<p className="mt-1 text-sm text-destructive/80">
								Session expired — log out and back in, then retry.
							</p>
						)}
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						className="shrink-0 border-destructive/30 bg-background/60 text-destructive hover:bg-background hover:text-destructive"
					>
						Retry
					</Button>
				</div>
			)}

			{isLoading ? (
				<div
					aria-hidden
					className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card"
				>
					{[0, 1, 2, 3, 4].map((row) => (
						<div
							key={row}
							className="flex items-center gap-3 border-b border-border/50 p-3.5 last:border-0"
						>
							<div className="size-8 rounded-lg bg-muted" />
							<div className="h-3.5 flex-1 rounded-md bg-muted" />
							<div className="h-3.5 w-20 rounded-md bg-muted/70" />
						</div>
					))}
				</div>
			) : visible.length === 0 ? (
				<JobsEmpty
					title={query.trim() ? "No events match your search" : "No events yet"}
					description={
						query.trim()
							? `Nothing matches “${query.trim()}”. Try another keyword.`
							: "Contract, payment and moderation events land here."
					}
					icon={<Scroll className="size-5" />}
					action={
						query.trim() ? (
							<Button variant="outline" size="sm" onClick={() => onSearch("")}>
								Clear search
							</Button>
						) : undefined
					}
				/>
			) : (
				<div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs animate-rise motion-reduce:animate-none">
					{/* header */}
					<div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_auto] items-center gap-3 border-b border-border bg-muted/40 px-4 py-2.5 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase sm:grid-cols-[130px_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
						<span className="hidden sm:block">Time</span>
						<span>Event</span>
						<span className="hidden sm:block">Entity</span>
						<span className="hidden sm:block">Actor</span>
						<span className="text-right">Ref</span>
					</div>
					<ul className="divide-y divide-border/60">
						{visible.map((log, index) => {
							const meta = CATEGORY_META[categorize(log.action)];
							const Icon = meta.icon;
							const actor = log.userId ? nameById.get(log.userId) : null;
							return (
								<li
									key={log.id}
									className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_auto] items-center gap-3 px-4 py-2.5 transition-colors animate-rise motion-reduce:animate-none hover:bg-muted/40 sm:grid-cols-[130px_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
									style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
								>
									<span
										className="hidden text-xs whitespace-nowrap text-muted-foreground tabular-nums sm:block"
										title={fullDate(log.createdAt)}
									>
										{timeAgo(log.createdAt)}
									</span>
									<span className="flex min-w-0 items-center gap-2">
										<span
											className={cn(
												"grid size-7 shrink-0 place-items-center rounded-lg ring-1 ring-inset",
												meta.chip,
											)}
										>
											<Icon className="size-3.5" />
										</span>
										<span className="truncate text-sm font-medium">
											{humanize(log.action)}
										</span>
									</span>
									<span className="hidden min-w-0 text-xs text-muted-foreground sm:block">
										<span className="font-semibold tracking-wide uppercase">
											{log.entityType}
										</span>
									</span>
									<span className="hidden min-w-0 truncate text-sm sm:block">
										{actor ?? log.userId ?? (
											<span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
												System
											</span>
										)}
										{!actor && log.userId && (
											<span
												className="font-mono text-xs text-muted-foreground"
												title={log.userId}
											>
												{log.userId.slice(0, 8)}…
											</span>
										)}
									</span>
									<span
										className="text-right font-mono text-xs text-muted-foreground tabular-nums"
										title={log.entityId}
									>
										{log.entityId.slice(0, 8)}
									</span>
								</li>
							);
						})}
					</ul>
					<p className="border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground tabular-nums">
						Showing {visible.length} of {total} events · latest first
					</p>
				</div>
			)}
		</div>
	);
}
