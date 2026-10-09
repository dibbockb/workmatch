"use client";

import {
	ArrowRight,
	Briefcase,
	CurrencyDollar,
	FileText,
	Handshake,
	MagnifyingGlass,
	Trophy,
	WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { HeaderStat, PageHeader } from "@/components/shared/page-header";
import { DonutChart, StatusBars, type ChartSegment } from "@/components/charts";
import { useMe } from "@/features/auth/queries";
import { useMyContracts } from "@/features/contracts/queries";
import { useJobs } from "@/features/jobs/queries";
import { formatBudget } from "@/features/jobs/job-list";
import { useMyProposals } from "@/features/proposals/queries";
import { ProposalStatusBadge } from "@/features/proposals/status";

const OUTCOME_SEGMENTS: Record<
	string,
	{ label: string; stroke: string; dot: string; bar: string }
> = {
	PENDING: {
		label: "Awaiting reply",
		stroke: "stroke-amber-500",
		dot: "bg-amber-500",
		bar: "bg-amber-500",
	},
	ACCEPTED: {
		label: "Won",
		stroke: "stroke-emerald-500",
		dot: "bg-emerald-500",
		bar: "bg-emerald-500",
	},
	REJECTED: {
		label: "Lost",
		stroke: "stroke-rose-500",
		dot: "bg-rose-500",
		bar: "bg-rose-500",
	},
	WITHDRAWN: {
		label: "Withdrawn",
		stroke: "stroke-muted-foreground",
		dot: "bg-muted-foreground/60",
		bar: "bg-muted-foreground/50",
	},
};

function timeAgo(iso: string) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
	if (seconds < 60) return "just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

function SectionCard({
	icon,
	title,
	hint,
	action,
	children,
	index,
}: {
	icon: React.ReactNode;
	title: string;
	hint: string;
	action?: React.ReactNode;
	children: React.ReactNode;
	index: number;
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

function cardLink(href: string, label: string) {
	return (
		<Link
			href={href}
			className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
		>
			{label}
			<ArrowRight className="size-3.5" />
		</Link>
	);
}

export default function FreelancerDashboardPage() {
	const { data: user } = useMe();
	const firstName = user?.name.split(" ")[0];

	const {
		data: proposalsData,
		isLoading: proposalsLoading,
		isError: proposalsError,
		refetch: refetchProposals,
	} = useMyProposals({ limit: 100 });
	const {
		data: contractsData,
		isLoading: contractsLoading,
		isError: contractsError,
		refetch: refetchContracts,
	} = useMyContracts();
	const {
		data: jobsData,
		isLoading: jobsLoading,
		isError: jobsError,
		refetch: refetchJobs,
	} = useJobs({ page: 1, limit: 6 });

	const proposals = useMemo(
		() => proposalsData?.data.proposals ?? [],
		[proposalsData],
	);
	const contracts = useMemo(() => contractsData?.data ?? [], [contractsData]);
	const openJobs = useMemo(() => jobsData?.data.jobs ?? [], [jobsData]);
	const openTotal = jobsData?.data.pagination.total ?? openJobs.length;

	const loading = proposalsLoading || contractsLoading;
	const failed = proposalsError || contractsError || jobsError;

	const decided = proposals.filter(
		(p) => p.status === "ACCEPTED" || p.status === "REJECTED",
	);
	const won = proposals.filter((p) => p.status === "ACCEPTED").length;
	const winRate =
		decided.length > 0 ? Math.round((won / decided.length) * 100) : 0;
	const pending = proposals.filter((p) => p.status === "PENDING").length;
	const activeGigs = contracts.filter((c) => c.status === "ACTIVE");

	const { earnedValue, incomingValue } = useMemo(() => {
		let earned = 0;
		let incoming = 0;
		for (const c of contracts) {
			const paid = c.payments?.[0];
			const earns = paid ? paid.freelancerEarns : c.agreedPrice * 0.9;
			if (c.status === "COMPLETED") earned += earns;
			else if (c.status === "ACTIVE") incoming += earns;
		}
		return { earnedValue: earned, incomingValue: incoming };
	}, [contracts]);

	const outcomes = useMemo<ChartSegment[]>(
		() =>
			Object.entries(OUTCOME_SEGMENTS).map(([key, meta]) => ({
				key,
				label: meta.label,
				value: proposals.filter((p) => p.status === key).length,
				stroke: meta.stroke,
				dot: meta.dot,
				bar: meta.bar,
			})),
		[proposals],
	);

	const recent = useMemo(
		() =>
			[...proposals]
				.sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))
				.slice(0, 5),
		[proposals],
	);

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
			<PageHeader
				title={firstName ? `Welcome back, ${firstName}` : "Overview"}
				description="Your pipeline, gigs and earnings — everything moving forward."
				actions={
					<>
						<HeaderStat
							value={activeGigs.length}
							label="active gigs"
							loading={contractsLoading}
						/>
						<HeaderStat
							value={winRate}
							label="win rate %"
							loading={proposalsLoading}
						/>
					</>
				}
			/>

			{failed && (
				<div
					role="alert"
					className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5"
				>
					<div className="min-w-0 flex-1">
						<p className="font-semibold text-destructive">
							Couldn&apos;t load some of your data
						</p>
						<p className="mt-0.5 text-sm text-destructive/80">
							Check your connection and try again.
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							refetchProposals();
							refetchContracts();
							refetchJobs();
						}}
						className="border-destructive/30 bg-background/60 text-destructive hover:bg-background hover:text-destructive"
					>
						Retry
					</Button>
				</div>
			)}

			<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
				<StatTile
					index={0}
					icon={<FileText className="size-3.5" />}
					label="Proposals sent"
					value={proposals.length.toLocaleString()}
					sub={`${pending} awaiting reply`}
					loading={proposalsLoading}
				/>
				<StatTile
					index={1}
					icon={<Trophy className="size-3.5" />}
					label="Win rate"
					value={`${winRate}%`}
					sub={`${won} of ${decided.length} decided`}
					loading={proposalsLoading}
				/>
				<StatTile
					index={2}
					icon={<Handshake className="size-3.5" />}
					label="Active gigs"
					value={activeGigs.length.toLocaleString()}
					sub="Contracts in progress"
					loading={contractsLoading}
				/>
				<StatTile
					index={3}
					icon={<CurrencyDollar className="size-3.5" />}
					label="Earned"
					value={`$${Math.round(earnedValue).toLocaleString()}`}
					sub={`$${Math.round(incomingValue).toLocaleString()} incoming`}
					loading={contractsLoading}
				/>
			</div>

			<div className="grid items-start gap-5 lg:grid-cols-2">
				<SectionCard
					index={4}
					icon={<FileText className="size-5" />}
					title="Proposal outcomes"
					hint="How every pitch landed"
					action={cardLink("/dashboard/freelancer/proposals", "All pitches")}
				>
					{proposalsLoading ? (
						<div aria-hidden className="animate-pulse space-y-3">
							<div className="h-2.5 rounded-full bg-muted" />
							<div className="h-2.5 rounded-full bg-muted/70" />
							<div className="h-2.5 w-2/3 rounded-full bg-muted/70" />
						</div>
					) : proposals.length === 0 ? (
						<p className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center text-sm text-muted-foreground">
							No pitches yet — find work you love and send the first one.
						</p>
					) : (
						<StatusBars segments={outcomes} />
					)}
				</SectionCard>

				<SectionCard
					index={5}
					icon={<CurrencyDollar className="size-5" />}
					title="Earnings"
					hint="Paid out vs. in progress"
					action={cardLink("/dashboard/freelancer/contracts", "Contracts")}
				>
					{loading ? (
						<div aria-hidden className="animate-pulse space-y-3">
							<div className="mx-auto size-36 rounded-full bg-muted" />
							<div className="h-4 rounded-md bg-muted/70" />
						</div>
					) : earnedValue + incomingValue === 0 ? (
						<p className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center text-sm text-muted-foreground">
							Nothing earned yet — land a gig and watch this grow.
						</p>
					) : (
						<DonutChart
							segments={[
								{
									key: "earned",
									label: "Paid out",
									value: Math.round(earnedValue),
									stroke: "stroke-emerald-500",
									dot: "bg-emerald-500",
									bar: "bg-emerald-500",
								},
								{
									key: "incoming",
									label: "In progress",
									value: Math.round(incomingValue),
									stroke: "stroke-sky-500",
									dot: "bg-sky-500",
									bar: "bg-sky-500",
								},
							]}
							centerLabel="total"
							centerValue={`$${Math.round(earnedValue + incomingValue).toLocaleString()}`}
						/>
					)}
				</SectionCard>
			</div>

			<div className="grid items-start gap-5 lg:grid-cols-2">
				<SectionCard
					index={6}
					icon={<Handshake className="size-5" />}
					title="Active gigs"
					hint="Contracts in progress"
					action={cardLink("/dashboard/freelancer/contracts", "View all")}
				>
					{contractsLoading ? (
						<div aria-hidden className="animate-pulse space-y-2">
							{[0, 1].map((i) => (
								<div key={i} className="h-14 rounded-xl bg-muted/60" />
							))}
						</div>
					) : activeGigs.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center">
							<p className="text-sm font-medium">No active gigs.</p>
							<p className="mt-1 text-sm text-muted-foreground">
								Won proposals turn into gigs here.
							</p>
						</div>
					) : (
						<ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60">
							{activeGigs.slice(0, 5).map((c) => (
								<li key={c.id}>
									<Link
										href={`/dashboard/freelancer/jobs/${c.jobId}`}
										className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
									>
										<span className="min-w-0">
											<span className="block truncate text-sm font-medium">
												{c.job?.title ?? "Contract gig"}
											</span>
											<span className="mt-0.5 block truncate text-xs text-muted-foreground">
												{c.client?.name ?? "Client"} · {c.agreedTimeline}{" "}
												{c.agreedTimeline === 1 ? "day" : "days"}
											</span>
										</span>
										<span className="shrink-0 text-sm font-semibold tabular-nums">
											${c.agreedPrice.toLocaleString()}
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</SectionCard>

				<SectionCard
					index={7}
					icon={<MagnifyingGlass className="size-5" />}
					title="Fresh gigs"
					hint={
						openTotal > 0
							? `${openTotal.toLocaleString()} open right now`
							: "New postings land here"
					}
					action={cardLink("/dashboard/freelancer/jobs", "Find work")}
				>
					{jobsLoading ? (
						<div aria-hidden className="animate-pulse space-y-2">
							{[0, 1, 2].map((i) => (
								<div key={i} className="h-12 rounded-xl bg-muted/60" />
							))}
						</div>
					) : openJobs.length === 0 ? (
						<p className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center text-sm text-muted-foreground">
							Nothing open at the moment — check back soon.
						</p>
					) : (
						<ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60">
							{openJobs.slice(0, 5).map((job) => (
								<li key={job.id}>
									<Link
										href={`/dashboard/freelancer/jobs/${job.id}`}
										className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
									>
										<span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary/60 text-secondary-foreground">
											<Briefcase className="size-4" />
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-medium">
												{job.title}
											</span>
											<span className="block truncate text-xs text-muted-foreground tabular-nums">
												{formatBudget(job)}
											</span>
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</SectionCard>
			</div>

			<SectionCard
				index={8}
				icon={<Briefcase className="size-5" />}
				title="Latest pitches"
				hint="Newest proposals first"
				action={cardLink("/dashboard/freelancer/proposals", "View all")}
			>
				{proposalsLoading ? (
					<div aria-hidden className="animate-pulse space-y-2">
						{[0, 1, 2].map((i) => (
							<div key={i} className="h-12 rounded-xl bg-muted/60" />
						))}
					</div>
				) : recent.length === 0 ? (
					<p className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center text-sm text-muted-foreground">
						No activity yet.
					</p>
				) : (
					<ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0 sm:border-0 sm:bg-transparent">
						{recent.map((p) => (
							<li
								key={p.id}
								className="bg-card sm:rounded-2xl sm:border sm:border-border/60"
							>
								<Link
									href={`/dashboard/freelancer/jobs/${p.jobId}`}
									className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none sm:rounded-2xl"
								>
									<span className="min-w-0 flex-1">
										<span className="block truncate text-sm font-medium">
											{p.job?.title ?? "Job"} · $
											{Number(p.proposedPrice).toLocaleString()}
										</span>
										<span className="mt-0.5 block text-xs text-muted-foreground">
											{timeAgo(p.submittedAt)}
										</span>
									</span>
									<ProposalStatusBadge status={p.status} />
								</Link>
							</li>
						))}
					</ul>
				)}
			</SectionCard>
		</div>
	);
}
