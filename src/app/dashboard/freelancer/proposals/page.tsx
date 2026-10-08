"use client";

import {
	CalendarBlank,
	CurrencyDollar,
	PaperPlaneTilt,
	Timer,
	ArrowCounterClockwise,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { HeaderStat, PageHeader } from "@/components/shared/page-header";
import {
	JobListSkeleton,
	JobsEmpty,
	JobsError,
	JobsPagination,
	JobsSearch,
} from "@/features/jobs/job-list";
import { PROPOSAL_STATUSES, type Proposal } from "@/features/proposals/schemas";
import { ProposalStatusBadge } from "@/features/proposals/status";
import {
	useMyProposals,
	useWithdrawProposal,
} from "@/features/proposals/queries";
import { cn } from "@/lib/utils";

const money = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
	maximumFractionDigits: 0,
});

function formatSubmitted(iso: string) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function ProposalCard({
	proposal,
	index,
	confirming,
	withdrawing,
	onWithdraw,
	onCancelConfirm,
}: {
	proposal: Proposal;
	index: number;
	confirming: boolean;
	withdrawing: boolean;
	onWithdraw: () => void;
	onCancelConfirm: () => void;
}) {
	const job = proposal.job;
	const submitted = formatSubmitted(proposal.submittedAt);
	const canWithdraw = proposal.status === "PENDING";

	return (
		<li
			className="animate-rise motion-reduce:animate-none"
			style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
		>
			<article className="group relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs transition-all duration-300 ease-snappy hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-5">
				<span
					aria-hidden
					className="absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 bg-primary transition-transform duration-300 ease-snappy group-hover:scale-y-100"
				/>
				<div className="relative flex flex-col gap-3">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							{job ? (
								<Link
									href={`/dashboard/freelancer/jobs/${job.id}`}
									className="font-semibold leading-snug tracking-tight transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
								>
									{job.title}
								</Link>
							) : (
								<p className="font-semibold leading-snug tracking-tight">
									Proposal {proposal.id.slice(0, 8)}
								</p>
							)}
							{submitted && (
								<p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
									<CalendarBlank className="size-3.5" />
									Sent {submitted}
								</p>
							)}
						</div>
						<ProposalStatusBadge status={proposal.status} />
					</div>

					<div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
						<span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
							<CurrencyDollar className="size-4 text-primary" />
							{money.format(proposal.proposedPrice)}
						</span>
						<span className="inline-flex items-center gap-1.5 text-muted-foreground">
							<Timer className="size-4" />
							<span className="font-medium text-foreground tabular-nums">
								{proposal.proposedTimeline}
							</span>
							<span className="text-xs">
								{proposal.proposedTimeline === 1 ? "day" : "days"}
							</span>
						</span>
					</div>

					{proposal.approachDescription && (
						<p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
							{proposal.approachDescription}
						</p>
					)}

					<div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
						{job && (
							<Link
								href={`/dashboard/freelancer/jobs/${job.id}`}
								className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
							>
								View job
							</Link>
						)}
						{canWithdraw && (
							<div className="ml-auto flex items-center gap-2">
								{confirming ? (
									<>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={onCancelConfirm}
										>
											Keep it
										</Button>
										<Button
											type="button"
											variant="destructive"
											size="sm"
											disabled={withdrawing}
											onClick={onWithdraw}
										>
											{withdrawing ? "Withdrawing…" : "Yes, withdraw"}
										</Button>
									</>
								) : (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={onWithdraw}
										className="text-muted-foreground hover:text-destructive"
									>
										<ArrowCounterClockwise
											className="size-3.5"
											data-icon="inline-start"
										/>
										Withdraw
									</Button>
								)}
							</div>
						)}
					</div>
				</div>
			</article>
		</li>
	);
}

const TABS = ["ALL", ...PROPOSAL_STATUSES] as const;

export default function MyProposalsPage() {
	const router = useRouter();
	const params = useSearchParams();
	const search = params.get("search") ?? "";
	const rawStatus = params.get("status") ?? "ALL";
	const status = (PROPOSAL_STATUSES as readonly string[]).includes(rawStatus)
		? rawStatus
		: "ALL";
	const page = Math.max(1, Number(params.get("page") ?? 1) || 1);

	const [query, setQuery] = useState(search);
	useEffect(() => setQuery(search), [search]);

	const [confirmingId, setConfirmingId] = useState<string | null>(null);
	const withdraw = useWithdrawProposal();

	const { data, isLoading, isError, isFetching, refetch } = useMyProposals({
		status: status === "ALL" ? undefined : status,
		page,
		limit: 20,
	});
	const proposals = data?.data.proposals ?? [];
	const pagination = data?.data.pagination;

	const needle = query.trim().toLowerCase();
	const visible = needle
		? proposals.filter((p) =>
				(p.job?.title ?? "").toLowerCase().includes(needle),
			)
		: proposals;

	function setParam(key: string, value: string) {
		const next = new URLSearchParams(params);
		value ? next.set(key, value) : next.delete(key);
		if (key !== "page") next.delete("page");
		router.push(`?${next.toString()}`);
	}

	function onSearch(value: string) {
		setQuery(value);
		setParam("search", value);
	}

	function handleWithdraw(proposal: Proposal) {
		if (confirmingId !== proposal.id) {
			setConfirmingId(proposal.id);
			return;
		}
		withdraw.mutate(proposal.id, {
			onSuccess: () => {
				toast.success("Proposal withdrawn.");
				setConfirmingId(null);
			},
			onError: () => {
				toast.error("Could not withdraw the proposal. Try again.");
			},
		});
	}

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
			<PageHeader
				title="My proposals"
				description="Every pitch you have sent — track what's pending, accepted or needs a rethink."
				actions={
					<HeaderStat
						value={pagination?.total ?? proposals.length}
						label="proposals sent"
						loading={isLoading}
					/>
				}
			/>

			<div className="flex flex-col gap-3">
				<div
					role="tablist"
					aria-label="Filter by status"
					className="flex flex-wrap gap-1.5"
				>
					{TABS.map((tab) => {
						const active = status === tab;
						return (
							<button
								key={tab}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => setParam("status", tab === "ALL" ? "" : tab)}
								className={cn(
									"rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
									active
										? "border-primary/40 bg-primary text-primary-foreground shadow-xs"
										: "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
								)}
							>
								{tab.charAt(0) + tab.slice(1).toLowerCase()}
							</button>
						);
					})}
				</div>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<JobsSearch
						value={query}
						onChange={onSearch}
						placeholder="Search by job title..."
						label="Search your proposals by job title"
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
				needle ? (
					<JobsEmpty
						title="No proposals match your search"
						description={`Nothing here matches “${query.trim()}”. Try another keyword, or clear the search.`}
						action={
							<Button variant="outline" size="sm" onClick={() => onSearch("")}>
								Clear search
							</Button>
						}
					/>
				) : (
					<JobsEmpty
						title={
							status === "ALL"
								? "You have not sent any proposals yet"
								: `No ${status.charAt(0) + status.slice(1).toLowerCase()} proposals`
						}
						description={
							status === "ALL"
								? "Find work you love and send your first pitch — it will show up here."
								: "Proposals with this status will show up here."
						}
						icon={<PaperPlaneTilt className="size-5" />}
						action={
							status === "ALL" ? (
								<Button
									size="sm"
									onClick={() => router.push("/dashboard/freelancer/jobs")}
								>
									Find work
								</Button>
							) : (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setParam("status", "")}
								>
									Show all
								</Button>
							)
						}
					/>
				)
			) : (
				<ul className="grid gap-3">
					{visible.map((proposal, index) => (
						<ProposalCard
							key={proposal.id}
							proposal={proposal}
							index={index}
							confirming={confirmingId === proposal.id}
							withdrawing={withdraw.isPending && confirmingId === proposal.id}
							onWithdraw={() => handleWithdraw(proposal)}
							onCancelConfirm={() => {
								setConfirmingId(null);
								withdraw.reset();
							}}
						/>
					))}
				</ul>
			)}

			{pagination && (
				<JobsPagination
					page={page}
					totalPages={pagination.totalPages}
					total={pagination.total}
					limit={pagination.limit}
					unit="proposals"
					disabled={isFetching}
					onChange={(next) => setParam("page", String(next))}
				/>
			)}
		</div>
	);
}
