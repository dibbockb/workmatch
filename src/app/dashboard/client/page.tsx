"use client";

import {
	ArrowRight,
	Briefcase,
	CurrencyDollar,
	FileText,
	Handshake,
	Timer,
	WarningCircle,
} from "@phosphor-icons/react";
import { useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { HeaderStat, PageHeader } from "@/components/shared/page-header";
import { DonutChart, StatusBars, type ChartSegment } from "@/components/charts";
import { useMe } from "@/features/auth/queries";
import { useMyContracts } from "@/features/contracts/queries";
import { useMyJobs } from "@/features/jobs/queries";
import { getJobProposals } from "@/features/proposals/api";
import type { Proposal } from "@/features/proposals/schemas";
import { ProposalStatusBadge } from "@/features/proposals/status";

const PROPOSAL_SEGMENTS: Record<
	string,
	{ label: string; stroke: string; dot: string; bar: string }
> = {
	PENDING: {
		label: "Awaiting decision",
		stroke: "stroke-amber-500",
		dot: "bg-amber-500",
		bar: "bg-amber-500",
	},
	ACCEPTED: {
		label: "Hired",
		stroke: "stroke-emerald-500",
		dot: "bg-emerald-500",
		bar: "bg-emerald-500",
	},
	REJECTED: {
		label: "Rejected",
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

export default function ClientOverviewPage() {
	const { data: user } = useMe();
	const firstName = user?.name.split(" ")[0];

	const {
		data: jobsData,
		isLoading: jobsLoading,
		isError: jobsError,
		refetch: refetchJobs,
	} = useMyJobs({ page: 1, limit: 100 });
	const {
		data: contractsData,
		isLoading: contractsLoading,
		isError: contractsError,
		refetch: refetchContracts,
	} = useMyContracts();

	const jobs = useMemo(() => jobsData?.data.jobs ?? [], [jobsData]);
	const contracts = useMemo(() => contractsData?.data ?? [], [contractsData]);

	const proposalQueries = useQueries({
		queries: jobs.map((job) => ({
			queryKey: ["jobProposals", job.id],
			queryFn: () => getJobProposals(job.id),
		})),
	});

	const proposals = useMemo(() => {
		const merged: { proposal: Proposal; jobId: string }[] = [];
		proposalQueries.forEach((q, i) => {
			const jobId = jobs[i]?.id;
			if (!jobId) return;
			for (const proposal of q.data?.data.proposals ?? []) {
				merged.push({ proposal, jobId });
			}
		});
		return merged;
	}, [proposalQueries, jobs]);

	const proposalsLoading = proposalQueries.some((q) => q.isLoading);
	const proposalsError = proposalQueries.some((q) => q.isError);
	const loading = jobsLoading || contractsLoading;
	const failed = jobsError || contractsError;

	const jobById = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);
	const openJobs = jobs.filter((j) => j.status === "OPEN");

	const pendingByJob = useMemo(() => {
		const map = new Map<string, number>();
		for (const { proposal, jobId } of proposals) {
			if (proposal.status === "PENDING") {
				map.set(jobId, (map.get(jobId) ?? 0) + 1);
			}
		}
		return map;
	}, [proposals]);

	const waiting = openJobs
		.filter((j) => (pendingByJob.get(j.id) ?? 0) > 0)
		.sort(
			(a, b) => (pendingByJob.get(b.id) ?? 0) - (pendingByJob.get(a.id) ?? 0),
		);

	const pendingCount = [...pendingByJob.values()].reduce((a, b) => a + b, 0);
	const activeContracts = contracts.filter((c) => c.status === "ACTIVE");

	const funnel = useMemo<ChartSegment[]>(() => {
		const counts = new Map<string, number>();
		for (const { proposal } of proposals) {
			counts.set(proposal.status, (counts.get(proposal.status) ?? 0) + 1);
		}
		return Object.entries(PROPOSAL_SEGMENTS).map(([key, meta]) => ({
			key,
			label: meta.label,
			value: counts.get(key) ?? 0,
			stroke: meta.stroke,
			dot: meta.dot,
			bar: meta.bar,
		}));
	}, [proposals]);

	const { escrowValue, spentValue } = useMemo(() => {
		let escrow = 0;
		let spent = 0;
		for (const c of contracts) {
			const paid = c.payments?.[0];
			const amount = paid ? paid.amount : c.agreedPrice;
			if (c.status === "ACTIVE") escrow += amount;
			else if (c.status === "COMPLETED") spent += amount;
		}
		return { escrowValue: escrow, spentValue: spent };
	}, [contracts]);

	const recent = useMemo(
		() =>
			[...proposals]
				.sort(
					(a, b) =>
						+new Date(b.proposal.submittedAt) -
						+new Date(a.proposal.submittedAt),
				)
				.slice(0, 5),
		[proposals],
	);

	return (
		<div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
			<PageHeader
				title={firstName ? `Welcome back, ${firstName}` : "Overview"}
				description="Your hiring at a glance — pipeline, spend and what needs you."
				actions={
					<>
						<HeaderStat
							value={openJobs.length}
							label="open jobs"
							loading={jobsLoading}
						/>
						<HeaderStat
							value={pendingCount}
							label="awaiting decision"
							loading={proposalsLoading}
						/>
					</>
				}
			/>

			{(failed || proposalsError) && (
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
							refetchJobs();
							refetchContracts();
							proposalQueries.forEach((q) => {
								void q.refetch();
							});
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
					icon={<Briefcase className="size-3.5" />}
					label="Open jobs"
					value={openJobs.length.toLocaleString()}
					sub={`${jobs.length.toLocaleString()} posted total`}
					loading={jobsLoading}
				/>
				<StatTile
					index={1}
					icon={<FileText className="size-3.5" />}
					label="Proposals"
					value={proposals.length.toLocaleString()}
					sub={`${pendingCount} awaiting decision`}
					loading={proposalsLoading}
				/>
				<StatTile
					index={2}
					icon={<Handshake className="size-3.5" />}
					label="Active contracts"
					value={activeContracts.length.toLocaleString()}
					sub="Work in progress"
					loading={contractsLoading}
				/>
				<StatTile
					index={3}
					icon={<CurrencyDollar className="size-3.5" />}
					label="In escrow"
					value={`$${escrowValue.toLocaleString()}`}
					sub={`$${spentValue.toLocaleString()} paid out`}
					loading={contractsLoading}
				/>
			</div>

			<div className="grid items-start gap-5 lg:grid-cols-2">
				<SectionCard
					index={4}
					icon={<FileText className="size-5" />}
					title="Proposal pipeline"
					hint="Where every pitch stands"
					action={
						<Link
							href="/dashboard/client/proposals"
							className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
						>
							Review all
							<ArrowRight className="size-3.5" />
						</Link>
					}
				>
					{proposalsLoading ? (
						<div aria-hidden className="animate-pulse space-y-3">
							<div className="h-2.5 rounded-full bg-muted" />
							<div className="h-2.5 rounded-full bg-muted/70" />
							<div className="h-2.5 w-2/3 rounded-full bg-muted/70" />
						</div>
					) : proposals.length === 0 ? (
						<p className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center text-sm text-muted-foreground">
							No pitches yet — they&apos;ll funnel in here as freelancers apply.
						</p>
					) : (
						<StatusBars segments={funnel} />
					)}
				</SectionCard>

				<SectionCard
					index={5}
					icon={<CurrencyDollar className="size-5" />}
					title="Spend"
					hint="Escrowed vs. paid out"
					action={
						<Link
							href="/dashboard/client/contracts"
							className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
						>
							Contracts
							<ArrowRight className="size-3.5" />
						</Link>
					}
				>
					{loading ? (
						<div aria-hidden className="animate-pulse space-y-3">
							<div className="mx-auto size-36 rounded-full bg-muted" />
							<div className="h-4 rounded-md bg-muted/70" />
						</div>
					) : escrowValue + spentValue === 0 ? (
						<p className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center text-sm text-muted-foreground">
							Nothing funded yet — spend appears here after checkout.
						</p>
					) : (
						<DonutChart
							segments={[
								{
									key: "escrow",
									label: "In escrow",
									value: escrowValue,
									stroke: "stroke-sky-500",
									dot: "bg-sky-500",
									bar: "bg-sky-500",
								},
								{
									key: "spent",
									label: "Paid out",
									value: spentValue,
									stroke: "stroke-violet-500",
									dot: "bg-violet-500",
									bar: "bg-violet-500",
								},
							]}
							centerLabel="total"
							centerValue={`$${(escrowValue + spentValue).toLocaleString()}`}
						/>
					)}
				</SectionCard>
			</div>

			<div className="grid items-start gap-5 lg:grid-cols-2">
				<SectionCard
					index={6}
					icon={<Timer className="size-5" />}
					title="Needs your decision"
					hint="Open jobs with pitches waiting"
				>
					{proposalsLoading || jobsLoading ? (
						<div aria-hidden className="animate-pulse space-y-2">
							{[0, 1].map((i) => (
								<div key={i} className="h-14 rounded-xl bg-muted/60" />
							))}
						</div>
					) : waiting.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center">
							<p className="text-sm font-medium">All caught up.</p>
							<p className="mt-1 text-sm text-muted-foreground">
								New pitches show up here for review.
							</p>
						</div>
					) : (
						<ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60">
							{waiting.slice(0, 5).map((job) => (
								<li key={job.id}>
									<Link
										href={`/dashboard/client/proposals?jobId=${job.id}`}
										className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
									>
										<span className="min-w-0">
											<span className="block truncate text-sm font-medium">
												{job.title}
											</span>
											<span className="mt-0.5 block text-xs text-muted-foreground tabular-nums">
												{pendingByJob.get(job.id) ?? 0}{" "}
												{(pendingByJob.get(job.id) ?? 0) === 1
													? "proposal"
													: "proposals"}{" "}
												to review
											</span>
										</span>
										<span className="shrink-0 text-xs font-semibold text-primary">
											Review
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</SectionCard>

				<SectionCard
					index={7}
					icon={<Briefcase className="size-5" />}
					title="Latest pitches"
					hint="Newest proposals first"
					action={
						<Link
							href="/dashboard/client/proposals"
							className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
						>
							View all
							<ArrowRight className="size-3.5" />
						</Link>
					}
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
						<ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60">
							{recent.map(({ proposal, jobId }) => (
								<li key={proposal.id}>
									<Link
										href={`/dashboard/client/proposals?jobId=${jobId}`}
										className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
									>
										<span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary/60 text-xs font-bold text-secondary-foreground">
											{(proposal.freelancer?.name ?? "F")
												.trim()
												.charAt(0)
												.toUpperCase()}
										</span>
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-medium">
												{proposal.freelancer?.name ?? "Freelancer"} · $
												{Number(proposal.proposedPrice).toLocaleString()}
											</span>
											<span className="block truncate text-xs text-muted-foreground">
												{jobById.get(jobId)?.title ?? "Job"} ·{" "}
												{timeAgo(proposal.submittedAt)}
											</span>
										</span>
									</Link>
								</li>
							))}
						</ul>
					)}
				</SectionCard>
			</div>
		</div>
	);
}
