"use client";

import {
	ArrowRight,
	Briefcase,
	ChartPieSlice,
	CurrencyDollar,
	Handshake,
	UsersThree,
	WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { HeaderStat, PageHeader } from "@/components/shared/page-header";
import {
	DonutChart,
	StatusBars,
	type ChartSegment,
} from "@/features/admin/charts";

import {
	useAdminDashboardStats,
	useAdminUsers,
} from "@/features/admin/queries";
import { useJobs } from "@/features/jobs/queries";

const ROLE_SEGMENTS: Record<
	string,
	{ label: string; stroke: string; dot: string; bar: string }
> = {
	CLIENT: {
		label: "Clients",
		stroke: "stroke-sky-500",
		dot: "bg-sky-500",
		bar: "bg-sky-500",
	},
	FREELANCER: {
		label: "Freelancers",
		stroke: "stroke-violet-500",
		dot: "bg-violet-500",
		bar: "bg-violet-500",
	},
	ADMIN: {
		label: "Admins",
		stroke: "stroke-amber-500",
		dot: "bg-amber-500",
		bar: "bg-amber-500",
	},
};

const JOB_STATUS_SEGMENTS: Record<
	string,
	{ label: string; stroke: string; dot: string; bar: string }
> = {
	OPEN: {
		label: "Open",
		stroke: "stroke-emerald-500",
		dot: "bg-emerald-500",
		bar: "bg-emerald-500",
	},
	IN_PROGRESS: {
		label: "In progress",
		stroke: "stroke-sky-500",
		dot: "bg-sky-500",
		bar: "bg-sky-500",
	},
	COMPLETED: {
		label: "Completed",
		stroke: "stroke-violet-500",
		dot: "bg-violet-500",
		bar: "bg-violet-500",
	},
	CLOSED: {
		label: "Closed",
		stroke: "stroke-muted-foreground",
		dot: "bg-muted-foreground/60",
		bar: "bg-muted-foreground/50",
	},
	CANCELLED: {
		label: "Cancelled",
		stroke: "stroke-rose-500",
		dot: "bg-rose-500",
		bar: "bg-rose-500",
	},
};

function ChartCard({
	icon,
	title,
	hint,
	children,
	index,
	action,
}: {
	icon: React.ReactNode;
	title: string;
	hint: string;
	children: React.ReactNode;
	index: number;
	action?: React.ReactNode;
}) {
	return (
		<section
			className="rounded-3xl border border-border bg-card p-6 shadow-xs animate-rise motion-reduce:animate-none sm:p-7"
			style={{ animationDelay: `${index * 70}ms` }}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/60 text-secondary-foreground ring-1 ring-black/5">
						{icon}
					</span>
					<div>
						<h2 className="font-semibold tracking-tight">{title}</h2>
						<p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
					</div>
				</div>
				{action}
			</div>
			<div className="mt-5">{children}</div>
		</section>
	);
}

function ChartSkeleton() {
	return (
		<div aria-hidden className="animate-pulse space-y-3">
			<div className="h-4 w-1/3 rounded-md bg-muted" />
			<div className="h-2.5 rounded-full bg-muted" />
			<div className="h-4 w-1/4 rounded-md bg-muted/70" />
			<div className="h-2.5 rounded-full bg-muted/70" />
		</div>
	);
}

function StatTile({
	icon,
	label,
	value,
	sub,
	loading,
	index,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	sub: string;
	loading?: boolean;
	index: number;
}) {
	return (
		<div
			className="rounded-2xl border border-border bg-card p-5 shadow-xs animate-rise motion-reduce:animate-none"
			style={{ animationDelay: `${index * 60}ms` }}
		>
			<p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
				<span className="text-primary">{icon}</span>
				{label}
			</p>
			{loading ? (
				<div className="mt-2 h-8 w-24 animate-pulse rounded-lg bg-muted" />
			) : (
				<p className="mt-1.5 text-2xl font-bold tabular-nums sm:text-3xl">
					{value}
				</p>
			)}
			<p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
		</div>
	);
}

export default function AdminDashboardPage() {
	const { data, isLoading, isError, refetch } = useAdminDashboardStats();
	const stats = data?.data;
	const revenue = stats?.totalRevenue._sum.platformCommission ?? 0;

	const { data: usersData, isLoading: usersLoading } = useAdminUsers();
	const {
		data: jobsData,
		isLoading: jobsLoading,
		isError: jobsError,
		refetch: refetchJobs,
	} = useJobs({ limit: 100 });

	const roleSegments = useMemo<ChartSegment[]>(() => {
		const users = usersData?.data.users ?? [];
		const counts = new Map<string, number>();
		for (const u of users) counts.set(u.role, (counts.get(u.role) ?? 0) + 1);
		return Object.entries(ROLE_SEGMENTS).map(([key, meta]) => ({
			key,
			label: meta.label,
			value: counts.get(key) ?? 0,
			stroke: meta.stroke,
			dot: meta.dot,
			bar: meta.bar,
		}));
	}, [usersData]);

	const { jobSegments, jobsAnalyzed, jobsTotal } = useMemo(() => {
		const jobs = jobsData?.data.jobs ?? [];
		const counts = new Map<string, number>();
		for (const job of jobs)
			counts.set(job.status, (counts.get(job.status) ?? 0) + 1);
		const order = ["OPEN", "IN_PROGRESS", "COMPLETED", "CLOSED", "CANCELLED"];
		const seen = [...counts.keys()].filter((k) => !order.includes(k));
		return {
			jobSegments: [...order, ...seen]
				.filter((key) => counts.has(key))
				.map((key) => {
					const meta = JOB_STATUS_SEGMENTS[key] ?? {
						label: key.charAt(0) + key.slice(1).toLowerCase(),
						stroke: "stroke-primary",
						dot: "bg-primary",
						bar: "bg-primary",
					};
					return {
						key,
						label: meta.label,
						value: counts.get(key) ?? 0,
						stroke: meta.stroke,
						dot: meta.dot,
						bar: meta.bar,
					};
				}),
			jobsAnalyzed: jobs.length,
			jobsTotal: jobsData?.data.pagination.total ?? jobs.length,
		};
	}, [jobsData]);

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
			<PageHeader
				title="Overview"
				description="Platform health at a glance — people, work, agreements and revenue."
				actions={
					<HeaderStat
						value={stats?.totalUsers ?? 0}
						label="total users"
						loading={isLoading}
					/>
				}
			/>

			{isError ? (
				<div
					role="alert"
					className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
				>
					<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-destructive/15 text-destructive">
						<WarningCircle className="size-5" />
					</span>
					<div className="min-w-0 flex-1">
						<p className="font-semibold text-destructive">
							Could not load platform stats
						</p>
						<p className="mt-0.5 text-sm text-destructive/80">
							Check your connection and try again.
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						className="border-destructive/30 bg-background/60 text-destructive hover:bg-background hover:text-destructive"
					>
						Retry
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
					<StatTile
						index={0}
						icon={<UsersThree className="size-3.5" />}
						label="Users"
						value={(stats?.totalUsers ?? 0).toLocaleString()}
						sub="Clients, freelancers, admins"
						loading={isLoading}
					/>
					<StatTile
						index={1}
						icon={<Briefcase className="size-3.5" />}
						label="Jobs"
						value={(stats?.totalJobs ?? 0).toLocaleString()}
						sub="Posted all time"
						loading={isLoading}
					/>
					<StatTile
						index={2}
						icon={<Handshake className="size-3.5" />}
						label="Contracts"
						value={(stats?.totalContracts ?? 0).toLocaleString()}
						sub="Signed agreements"
						loading={isLoading}
					/>
					<StatTile
						index={3}
						icon={<CurrencyDollar className="size-3.5" />}
						label="Revenue"
						value={`$${Number(revenue).toLocaleString()}`}
						sub="Platform commission"
						loading={isLoading}
					/>
				</div>
			)}

			<div className="grid items-start gap-5 lg:grid-cols-2">
				<ChartCard
					index={4}
					icon={<ChartPieSlice className="size-5" />}
					title="Users by role"
					hint="Who makes up the marketplace"
					action={
						<Link
							href="/dashboard/admin/users"
							className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
						>
							Manage
						</Link>
					}
				>
					{usersLoading ? (
						<ChartSkeleton />
					) : (
						<DonutChart
							segments={roleSegments}
							centerLabel="users"
							centerValue={usersData?.data.total.toLocaleString() ?? "0"}
						/>
					)}
				</ChartCard>

				<ChartCard
					index={5}
					icon={<Briefcase className="size-5" />}
					title="Jobs by status"
					hint={
						jobsTotal > jobsAnalyzed
							? `Latest ${jobsAnalyzed} of ${jobsTotal} jobs`
							: `${jobsTotal} ${jobsTotal === 1 ? "job" : "jobs"} total`
					}
				>
					{jobsLoading ? (
						<ChartSkeleton />
					) : jobsError ? (
						<div className="flex items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3">
							<p className="text-sm text-destructive">
								Could not load job breakdown.
							</p>
							<Button
								variant="outline"
								size="sm"
								onClick={() => refetchJobs()}
								className="border-destructive/30 bg-background/60 text-destructive hover:bg-background hover:text-destructive"
							>
								Retry
							</Button>
						</div>
					) : jobSegments.length === 0 ? (
						<p className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center text-sm text-muted-foreground">
							No jobs posted yet — status breakdown appears here.
						</p>
					) : (
						<StatusBars segments={jobSegments} />
					)}
				</ChartCard>
			</div>

			<Link
				href="/dashboard/admin/users"
				className="group relative isolate flex items-center gap-4 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xs transition-all duration-300 ease-snappy hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 animate-rise motion-reduce:animate-none"
				style={{ animationDelay: "200ms" }}
			>
				<div
					aria-hidden
					className="pointer-events-none absolute -top-20 -right-14 size-44 rounded-full bg-primary/12 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
				/>
				<span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary/60 text-secondary-foreground ring-1 ring-black/5 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
					<UsersThree className="size-5" />
				</span>
				<span className="min-w-0 flex-1">
					<span className="block font-semibold tracking-tight transition-colors group-hover:text-primary">
						Manage users
					</span>
					<span className="mt-0.5 block text-sm text-muted-foreground">
						Search accounts, review roles, block or unblock access.
					</span>
				</span>
				<ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
			</Link>
		</div>
	);
}
