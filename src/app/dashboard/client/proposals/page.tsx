"use client";

import { Handshake } from "@phosphor-icons/react";
import { useQueries } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { HeaderStat, PageHeader } from "@/components/shared/page-header";
import {
	JobListSkeleton,
	JobsEmpty,
	JobsError,
	JobsSearch,
} from "@/features/jobs/job-list";
import { useMyJobs } from "@/features/jobs/queries";
import { getJobProposals } from "@/features/proposals/api";
import {
	AcceptProposalDialog,
	ProposalReviewCard,
	ProposalReviewSection,
	RejectProposalDialog,
	sortProposals,
} from "@/features/proposals/proposal-review";
import type { Proposal } from "@/features/proposals/schemas";
import { cn } from "@/lib/utils";

type DialogState = {
	jobId: string;
	id: string;
	mode: "accept" | "reject";
} | null;

const STATUS_TABS = ["ALL", "PENDING", "ACCEPTED"] as const;

export default function ClientProposalsPage() {
	const router = useRouter();
	const params = useSearchParams();
	const selectedJobId = params.get("jobId") ?? "ALL";
	const rawStatus = params.get("status") ?? "ALL";
	const status = (STATUS_TABS as readonly string[]).includes(rawStatus)
		? rawStatus
		: "ALL";
	const search = params.get("search") ?? "";

	const [query, setQuery] = useState(search);
	useEffect(() => setQuery(search), [search]);

	const [dialog, setDialog] = useState<DialogState>(null);

	const {
		data: jobsData,
		isLoading: jobsLoading,
		isError: jobsError,
		refetch: refetchJobs,
	} = useMyJobs({ page: 1, limit: 100 });
	const jobs = useMemo(() => jobsData?.data.jobs ?? [], [jobsData]);
	const jobById = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);

	const proposalQueries = useQueries({
		queries: jobs.map((job) => ({
			queryKey: ["jobProposals", job.id],
			queryFn: () => getJobProposals(job.id),
		})),
	});

	const proposalsLoading =
		jobsLoading || proposalQueries.some((q) => q.isLoading);
	const proposalsError = proposalQueries.some((q) => q.isError);
	const anyFetching = proposalQueries.some((q) => q.isFetching);

	const all = useMemo(() => {
		const merged: { proposal: Proposal; jobId: string }[] = [];
		proposalQueries.forEach((q, i) => {
			const list = q.data?.data.proposals ?? [];
			const jobId = jobs[i]?.id;
			if (!jobId) return;
			for (const proposal of list) merged.push({ proposal, jobId });
		});
		return merged;
	}, [proposalQueries, jobs]);

	const pendingTotal = all.filter(
		({ proposal }) => proposal.status === "PENDING",
	).length;

	const visible = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return sortProposals(
			all
				.filter(({ proposal, jobId }) => {
					if (selectedJobId !== "ALL" && jobId !== selectedJobId) return false;
					if (status !== "ALL" && proposal.status !== status) return false;
					if (!needle) return true;
					const haystack =
						`${proposal.freelancer?.name ?? ""} ${jobById.get(jobId)?.title ?? ""}`.toLowerCase();
					return haystack.includes(needle);
				})
				.map(({ proposal }) => proposal),
		).map((proposal) => ({
			proposal,
			jobId:
				all.find((entry) => entry.proposal.id === proposal.id)?.jobId ?? "",
		}));
	}, [all, selectedJobId, status, query, jobById]);

	function setParam(key: string, value: string) {
		const next = new URLSearchParams(params);
		value ? next.set(key, value) : next.delete(key);
		router.push(`?${next.toString()}`);
	}

	function onSearch(value: string) {
		setQuery(value);
		setParam("search", value);
	}

	const dialogProposal =
		dialog?.id != null
			? (all.find((entry) => entry.proposal.id === dialog.id)?.proposal ?? null)
			: null;
	const dialogJobId = dialog?.jobId ?? "";
	const dialogOthersPending = dialogProposal
		? all.filter(
				(entry) =>
					entry.jobId === dialogJobId &&
					entry.proposal.id !== dialogProposal.id &&
					entry.proposal.status === "PENDING",
			).length
		: 0;

	const selectedJob =
		selectedJobId !== "ALL" ? jobById.get(selectedJobId) : null;

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
			<PageHeader
				title="Proposals"
				description="Review every pitch across your jobs — accept the best fit or pass with a rejection."
				actions={
					<HeaderStat
						value={pendingTotal}
						label={
							pendingTotal === 1 ? "awaiting decision" : "awaiting decision"
						}
						loading={proposalsLoading}
					/>
				}
			/>

			<div className="flex flex-col gap-3">
				<div
					role="tablist"
					aria-label="Filter by job"
					className="flex flex-wrap gap-1.5"
				>
					<button
						key="ALL"
						type="button"
						role="tab"
						aria-selected={selectedJobId === "ALL"}
						onClick={() => setParam("jobId", "")}
						className={cn(
							"rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
							selectedJobId === "ALL"
								? "border-primary/40 bg-primary text-primary-foreground shadow-xs"
								: "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
						)}
					>
						All jobs
					</button>
					{jobs.map((job) => {
						const active = selectedJobId === job.id;
						const pending = all.filter(
							(entry) =>
								entry.jobId === job.id && entry.proposal.status === "PENDING",
						).length;
						return (
							<button
								key={job.id}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => setParam("jobId", job.id)}
								className={cn(
									"inline-flex max-w-56 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
									active
										? "border-primary/40 bg-primary text-primary-foreground shadow-xs"
										: "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
								)}
							>
								<span className="truncate">{job.title}</span>
								{pending > 0 && (
									<span
										className={cn(
											"grid min-w-5 place-items-center rounded-full px-1 text-[0.6875rem] tabular-nums",
											active
												? "bg-primary-foreground/20 text-primary-foreground"
												: "bg-primary/10 text-primary",
										)}
									>
										{pending}
									</span>
								)}
							</button>
						);
					})}
				</div>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap items-center gap-1.5">
						{STATUS_TABS.map((tab) => {
							const active = status === tab;
							return (
								<button
									key={tab}
									type="button"
									aria-pressed={active}
									onClick={() => setParam("status", tab === "ALL" ? "" : tab)}
									className={cn(
										"rounded-lg px-2.5 py-1.5 text-xs font-semibold tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
										active
											? "bg-secondary text-secondary-foreground"
											: "text-muted-foreground hover:bg-muted hover:text-foreground",
									)}
								>
									{tab.charAt(0) + tab.slice(1).toLowerCase()}
								</button>
							);
						})}
					</div>
					<JobsSearch
						value={query}
						onChange={onSearch}
						placeholder="Search freelancer or job..."
						label="Search proposals"
					/>
				</div>
				{anyFetching && !proposalsLoading && (
					<span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
						<span
							aria-hidden
							className="size-1.5 animate-pulse rounded-full bg-primary"
						/>
						Updating results…
					</span>
				)}
			</div>

			{(jobsError || proposalsError) && (
				<div
					role="alert"
					className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center"
				>
					<div className="min-w-0 flex-1">
						<p className="font-semibold text-destructive">
							Could not load proposals
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
							for (const q of proposalQueries) void q.refetch();
						}}
						className="border-destructive/30 bg-background/60 text-destructive hover:bg-background hover:text-destructive"
					>
						Retry
					</Button>
				</div>
			)}

			{proposalsLoading ? (
				<JobListSkeleton />
			) : jobs.length === 0 ? (
				<JobsEmpty
					title="You have not posted any jobs yet"
					description="Proposals appear here once your jobs start receiving pitches."
					icon={<Handshake className="size-5" />}
					action={
						<Button
							size="sm"
							onClick={() => router.push("/dashboard/client/jobs/new")}
						>
							Post a job
						</Button>
					}
				/>
			) : selectedJob ? (
				<ProposalReviewSection
					key={selectedJob.id}
					jobId={selectedJob.id}
					jobOpen={selectedJob.status === "OPEN"}
				/>
			) : visible.length === 0 ? (
				<JobsEmpty
					title={
						query.trim()
							? "No proposals match your search"
							: status !== "ALL" || selectedJobId !== "ALL"
								? "Nothing under this filter"
								: "No proposals yet"
					}
					description={
						query.trim()
							? `Nothing here matches “${query.trim()}”. Try another keyword.`
							: "Freelancer pitches land here the moment they are sent."
					}
					icon={<Handshake className="size-5" />}
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
					{visible.map(({ proposal, jobId }, index) => {
						const job = jobById.get(jobId);
						return (
							<ProposalReviewCard
								key={proposal.id}
								proposal={proposal}
								index={index}
								jobOpen={job?.status === "OPEN"}
								jobLabel={
									job
										? {
												title: job.title,
												href: `/dashboard/client/jobs/${job.id}`,
											}
										: undefined
								}
								onAccept={() =>
									setDialog({ jobId, id: proposal.id, mode: "accept" })
								}
								onReject={() =>
									setDialog({ jobId, id: proposal.id, mode: "reject" })
								}
							/>
						);
					})}
				</ul>
			)}

			<AcceptProposalDialog
				jobId={dialogJobId}
				proposal={dialog?.mode === "accept" ? dialogProposal : null}
				othersPending={dialogOthersPending}
				open={dialog?.mode === "accept"}
				onClose={() => setDialog(null)}
			/>
			<RejectProposalDialog
				jobId={dialogJobId}
				proposal={dialog?.mode === "reject" ? dialogProposal : null}
				open={dialog?.mode === "reject"}
				onClose={() => setDialog(null)}
			/>
		</div>
	);
}
