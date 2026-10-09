"use client";

import {
	CalendarBlank,
	CheckCircle,
	Prohibit,
	ShieldCheck,
	User,
} from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogContent,
} from "@/components/ui/dialog";
import { HeaderStat, PageHeader } from "@/components/shared/page-header";
import {
	JobListSkeleton,
	JobsEmpty,
	JobsError,
	JobsSearch,
} from "@/features/jobs/job-list";
import {
	useAdminUsers,
	useBlockUser,
	useUnblockUser,
} from "@/features/admin/queries";
import type { AdminUser } from "@/features/admin/schemas";
import { cn } from "@/lib/utils";

const ROLE_TABS = ["ALL", "CLIENT", "FREELANCER", "ADMIN"] as const;

const ROLE_CHIP: Record<string, string> = {
	CLIENT: "bg-sky-500/10 text-sky-600 ring-sky-500/30 dark:text-sky-400",
	FREELANCER:
		"bg-violet-500/10 text-violet-600 ring-violet-500/30 dark:text-violet-400",
	ADMIN: "bg-amber-500/10 text-amber-600 ring-amber-500/30 dark:text-amber-400",
};

function formatJoined(iso?: string | null) {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function RoleBadge({ role }: { role: string }) {
	return (
		<span
			className={cn(
				"inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[0.6875rem] leading-none font-semibold tracking-wider whitespace-nowrap uppercase ring-1 ring-inset",
				ROLE_CHIP[role] ?? "bg-muted text-muted-foreground ring-border",
			)}
		>
			{role.charAt(0) + role.slice(1).toLowerCase()}
		</span>
	);
}

function UserStatusBadge({ user }: { user: AdminUser }) {
	const blocked = user.status === "BLOCKED" || user.isBlocked === true;
	if (blocked) {
		return (
			<span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[0.6875rem] leading-none font-semibold tracking-wider whitespace-nowrap text-rose-600 uppercase ring-1 ring-rose-500/30 ring-inset dark:text-rose-400">
				<span aria-hidden className="size-1.5 rounded-full bg-rose-500" />
				Blocked
			</span>
		);
	}
	return (
		<span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[0.6875rem] leading-none font-semibold tracking-wider whitespace-nowrap text-emerald-600 uppercase ring-1 ring-emerald-500/30 ring-inset dark:text-emerald-400">
			<span className="relative flex size-1.5">
				<span
					aria-hidden
					className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75 motion-reduce:animate-none"
				/>
				<span
					aria-hidden
					className="relative inline-flex size-1.5 rounded-full bg-emerald-500"
				/>
			</span>
			Active
		</span>
	);
}

export default function AdminUsersPage() {
	const router = useRouter();
	const params = useSearchParams();
	const rawRole = params.get("role") ?? "ALL";
	const role = (ROLE_TABS as readonly string[]).includes(rawRole)
		? rawRole
		: "ALL";
	const search = params.get("search") ?? "";

	const [query, setQuery] = useState(search);
	useEffect(() => setQuery(search), [search]);

	const [target, setTarget] = useState<AdminUser | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const block = useBlockUser();
	const unblock = useUnblockUser();
	const busy = block.isPending || unblock.isPending;

	const { data, isLoading, isError, isFetching, refetch } = useAdminUsers();
	const users = useMemo(() => data?.data.users ?? [], [data]);
	const total = data?.data.total ?? users.length;

	const visible = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return users.filter((u) => {
			if (role !== "ALL" && u.role !== role) return false;
			if (!needle) return true;
			return `${u.name} ${u.email}`.toLowerCase().includes(needle);
		});
	}, [users, role, query]);

	function setParam(key: string, value: string) {
		const next = new URLSearchParams(params);
		value ? next.set(key, value) : next.delete(key);
		router.push(`?${next.toString()}`);
	}

	function onSearch(value: string) {
		setQuery(value);
		setParam("search", value);
	}

	const isBlockedTarget =
		target != null &&
		(target.status === "BLOCKED" || target.isBlocked === true);
	// Admins are never blockable from here — protects peer admins and yourself.
	const canModerate = target != null && target.role !== "ADMIN";

	function closeDialog() {
		setTarget(null);
		setActionError(null);
		block.reset();
		unblock.reset();
	}

	function confirmAction() {
		if (!target || !canModerate) return;
		setActionError(null);
		const mutation = isBlockedTarget ? unblock : block;
		mutation.mutate(target.id, {
			onSuccess: () => {
				toast.success(
					isBlockedTarget
						? `${target.name} is back in.`
						: `${target.name} has been blocked.`,
				);
				closeDialog();
			},
			onError: () => {
				setActionError("Could not update this user. Try again.");
			},
		});
	}

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
			<PageHeader
				title="Users"
				description="Everyone on the platform — clients, freelancers and fellow admins."
				actions={
					<HeaderStat value={total} label="total users" loading={isLoading} />
				}
			/>

			<div className="flex flex-col gap-3">
				<div
					role="tablist"
					aria-label="Filter by role"
					className="flex flex-wrap gap-1.5"
				>
					{ROLE_TABS.map((tab) => {
						const active = role === tab;
						return (
							<button
								key={tab}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => setParam("role", tab === "ALL" ? "" : tab)}
								className={cn(
									"rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
									active
										? "border-primary/40 bg-primary text-primary-foreground shadow-xs"
										: "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
								)}
							>
								{tab === "ALL"
									? "All"
									: `${tab.charAt(0)}${tab.slice(1).toLowerCase()}s`}
							</button>
						);
					})}
				</div>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<JobsSearch
						value={query}
						onChange={onSearch}
						placeholder="Search by name or email..."
						label="Search users"
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

			{isError && <JobsError onRetry={() => refetch()} />}

			{isLoading ? (
				<JobListSkeleton />
			) : visible.length === 0 ? (
				<JobsEmpty
					title={query.trim() ? "No users match your search" : "No users here"}
					description={
						query.trim()
							? `Nothing matches “${query.trim()}”. Try another keyword.`
							: "Users with this role will show up here."
					}
					icon={<User className="size-5" />}
					action={
						query.trim() ? (
							<Button variant="outline" size="sm" onClick={() => onSearch("")}>
								Clear search
							</Button>
						) : undefined
					}
				/>
			) : (
				<ul className="grid gap-3">
					{visible.map((user, index) => {
						const blocked =
							user.status === "BLOCKED" || user.isBlocked === true;
						const joined = formatJoined(user.createdAt);
						const initial = user.name.trim().charAt(0).toUpperCase() || "U";
						return (
							<li
								key={user.id}
								className="animate-rise motion-reduce:animate-none"
								style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
							>
								<article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs transition-all duration-300 ease-snappy hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5">
									<span
										aria-hidden
										className="absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 bg-primary transition-transform duration-300 ease-snappy group-hover:scale-y-100"
									/>
									<div className="relative flex items-start gap-3">
										<span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary/60 text-sm font-bold text-secondary-foreground ring-1 ring-black/5">
											{initial}
										</span>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<p className="truncate font-semibold tracking-tight">
													{user.name}
												</p>
												<RoleBadge role={user.role} />
												<UserStatusBadge user={user} />
											</div>
											<p className="mt-0.5 truncate text-sm text-muted-foreground">
												{user.email}
											</p>
											<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
												{joined && (
													<span className="inline-flex items-center gap-1.5">
														<CalendarBlank className="size-3.5" />
														Joined {joined}
													</span>
												)}
												{user.emailVerified ? (
													<span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
														<CheckCircle className="size-3.5" />
														Verified
													</span>
												) : (
													<span className="inline-flex items-center gap-1">
														<ShieldCheck className="size-3.5" />
														Unverified email
													</span>
												)}
											</div>
										</div>
										{user.role !== "ADMIN" && (
											<Button
												type="button"
												variant={blocked ? "outline" : "ghost"}
												size="sm"
												onClick={() => {
													setActionError(null);
													setTarget(user);
												}}
												className={cn(
													"shrink-0",
													!blocked &&
													"text-muted-foreground hover:text-destructive",
												)}
											>
												<Prohibit
													className="size-3.5"
													data-icon="inline-start"
												/>
												{blocked ? "Unblock" : "Block"}
											</Button>
										)}
									</div>
								</article>
							</li>
						);
					})}
				</ul>
			)}

			<Dialog
				open={target !== null}
				onOpenChange={(open) => {
					if (!open) closeDialog();
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{isBlockedTarget
								? `Unblock ${target?.name}?`
								: `Block ${target?.name}?`}
						</DialogTitle>
						<DialogDescription>
							{isBlockedTarget
								? "They regain full access immediately."
								: "They lose access immediately until unblocked."}
						</DialogDescription>
					</DialogHeader>
					<DialogBody className="flex flex-col gap-4">
						{target && (
							<div className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm leading-relaxed">
								<p className="font-semibold">{target.name}</p>
								<p className="mt-0.5 text-muted-foreground">{target.email}</p>
							</div>
						)}
						{!isBlockedTarget && (
							<div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm leading-relaxed text-muted-foreground">
								Blocking signs them out everywhere and locks the account.
							</div>
						)}
						{actionError && (
							<p role="alert" className="text-sm text-destructive">
								{actionError}
							</p>
						)}
					</DialogBody>
					<DialogFooter className="border-t-0 p-6 pt-0">
						<Button type="button" variant="outline" onClick={closeDialog}>
							Cancel
						</Button>
						<Button
							type="button"
							variant={isBlockedTarget ? "default" : "destructive"}
							disabled={busy}
							onClick={confirmAction}
						>
							{busy
								? isBlockedTarget
									? "Unblocking…"
									: "Blocking…"
								: isBlockedTarget
									? "Yes, unblock"
									: "Yes, block"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
