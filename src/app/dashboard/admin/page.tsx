"use client";

import {
	ArrowRight,
	Briefcase,
	CurrencyDollar,
	Handshake,
	UsersThree,
	WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeaderStat, PageHeader } from "@/components/shared/page-header";

import { useAdminDashboardStats } from "@/features/admin/queries";

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
