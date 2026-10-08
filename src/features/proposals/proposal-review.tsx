"use client";

import {
	CalendarBlank,
	CheckCircle,
	CurrencyDollar,
	FileText,
	Handshake,
	Timer,
	XCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { useAcceptProposal } from "@/features/contracts/queries";
import { getCheckoutUrl } from "@/features/contracts/api";
import { DetailSection, DetailStat } from "@/features/jobs/job-detail";
import {
	useJobProposals,
	useRejectProposal,
} from "@/features/proposals/queries";
import type { Proposal } from "@/features/proposals/schemas";
import { ProposalStatusBadge } from "@/features/proposals/status";

function getErrorMessage(error: unknown, fallback: string) {
	if (error && typeof error === "object") {
		const withResponse = error as {
			response?: { _data?: { message?: unknown } };
			data?: { message?: unknown };
		};
		const fromResponse = withResponse.response?._data?.message;
		if (typeof fromResponse === "string" && fromResponse.trim()) {
			return fromResponse;
		}
		if (Array.isArray(fromResponse) && fromResponse.length > 0) {
			return String(fromResponse[0]);
		}
		const fromData = withResponse.data?.message;
		if (typeof fromData === "string" && fromData.trim()) return fromData;
		if (error instanceof Error && error.message) return error.message;
	}
	return fallback;
}

function formatSubmitted(iso?: string | null) {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export function sortProposals(proposals: Proposal[]): Proposal[] {
	return [...proposals].sort((a, b) => {
		const rank = (s: string) =>
			s === "PENDING" ? 0 : s === "ACCEPTED" ? 1 : 2;
		return (
			rank(a.status) - rank(b.status) ||
			+new Date(b.submittedAt) - +new Date(a.submittedAt)
		);
	});
}

export function ProposalReviewCard({
	proposal,
	jobOpen,
	busy,
	onAccept,
	onReject,
	jobLabel,
	index = 0,
}: {
	proposal: Proposal;
	jobOpen: boolean;
	busy?: boolean;
	onAccept: () => void;
	onReject: () => void;
	jobLabel?: { title: string; href: string };
	index?: number;
}) {
	const name = proposal.freelancer?.name ?? "Freelancer";
	const initial = name.trim().charAt(0).toUpperCase() || "F";
	const submitted = formatSubmitted(proposal.submittedAt);
	const pending = proposal.status === "PENDING";
	const accepted = proposal.status === "ACCEPTED";

	return (
		<li
			className="animate-rise motion-reduce:animate-none"
			style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
		>
			<article
				className={
					"rounded-2xl border bg-card p-5 shadow-xs transition-colors " +
					(accepted
						? "border-emerald-500/40"
						: "border-border hover:border-primary/30")
				}
			>
				{jobLabel && (
					<Link
						href={jobLabel.href}
						className="mb-3 inline-flex max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
					>
						<FileText className="size-3.5 shrink-0" />
						<span className="truncate">{jobLabel.title}</span>
					</Link>
				)}
				<div className="flex items-start gap-3">
					<span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
						{initial}
					</span>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<p className="font-semibold tracking-tight">{name}</p>
							<ProposalStatusBadge status={proposal.status} />
						</div>
						{submitted && (
							<p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
								<CalendarBlank className="size-3.5" />
								Pitched {submitted}
							</p>
						)}
					</div>
					{pending && jobOpen && (
						<div className="flex shrink-0 gap-1.5">
							<Button
								type="button"
								size="sm"
								variant="outline"
								disabled={busy}
								onClick={onReject}
								className="text-muted-foreground hover:text-destructive"
							>
								<XCircle className="size-3.5" data-icon="inline-start" />
								Reject
							</Button>
							<Button
								type="button"
								size="sm"
								disabled={busy}
								onClick={onAccept}
								className="shadow-xs"
							>
								<CheckCircle className="size-3.5" data-icon="inline-start" />
								Accept
							</Button>
						</div>
					)}
				</div>

				<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
					<span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
						<CurrencyDollar className="size-4 text-primary" />$
						{Number(proposal.proposedPrice).toLocaleString()}
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

				<p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-foreground/90">
					{proposal.approachDescription}
				</p>
			</article>
		</li>
	);
}

export function AcceptProposalDialog({
	jobId,
	proposal,
	othersPending,
	open,
	onClose,
}: {
	jobId: string;
	proposal: Proposal | null;
	othersPending: number;
	open: boolean;
	onClose: () => void;
}) {
	const accept = useAcceptProposal(jobId);
	const [error, setError] = useState<string | null>(null);

	function close() {
		setError(null);
		accept.reset();
		onClose();
	}

	function confirm() {
		if (!proposal) return;
		setError(null);
		accept.mutate(proposal.id, {
			onSuccess: (response) => {
				const checkoutUrl = getCheckoutUrl(response);
				if (!checkoutUrl) {
					setError(
						"Checkout started but no payment link was returned. Try again.",
					);
					return;
				}
				toast.success("Redirecting to secure checkout…");
				// Stripe Checkout is an external page — full same-tab navigation
				// so its success redirect can return here afterwards.
				window.location.assign(checkoutUrl);
			},
			onError: (err) => {
				setError(getErrorMessage(err, "Could not start checkout. Try again."));
			},
		});
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) close();
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Accept {proposal?.freelancer?.name ?? "this freelancer"}?
					</DialogTitle>
					<DialogDescription>
						You&apos;ll continue to Stripe to fund escrow.
					</DialogDescription>
				</DialogHeader>
				<DialogBody className="flex flex-col gap-4">
					{proposal && (
						<div className="grid grid-cols-2 gap-3">
							<DetailStat
								label="Agreed price"
								value={`$${Number(proposal.proposedPrice).toLocaleString()}`}
								sub="Fixed · USD"
							/>
							<DetailStat
								label="Timeline"
								value={`${proposal.proposedTimeline} ${proposal.proposedTimeline === 1 ? "day" : "days"}`}
								sub="Freelancer estimate"
							/>
						</div>
					)}
					<div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-relaxed text-foreground/90">
						You&apos;ll be redirected to Stripe&apos;s secure checkout to pay.{" "}
						Once payment completes, the contract is created, the job moves to{" "}
						<strong>In progress</strong>
						{othersPending > 0 ? (
							<>
								, and the other{" "}
								<strong>
									{othersPending} pending{" "}
									{othersPending === 1 ? "proposal" : "proposals"}
								</strong>{" "}
								are automatically rejected.
							</>
						) : (
							"."
						)}
					</div>
					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}
				</DialogBody>
				<Separator />
				<DialogFooter className="border-t-0 p-6 pt-0">
					<Button type="button" variant="outline" onClick={close}>
						Keep reviewing
					</Button>
					<Button type="button" disabled={accept.isPending} onClick={confirm}>
						{accept.isPending ? (
							<span className="inline-flex items-center gap-2">
								<span
									aria-hidden
									className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
								/>
								Preparing checkout…
							</span>
						) : (
							<>
								<CheckCircle className="size-4" data-icon="inline-start" />
								Accept & continue to payment
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function RejectProposalDialog({
	jobId,
	proposal,
	open,
	onClose,
}: {
	jobId: string;
	proposal: Proposal | null;
	open: boolean;
	onClose: () => void;
}) {
	const reject = useRejectProposal();
	const [error, setError] = useState<string | null>(null);

	function close() {
		setError(null);
		reject.reset();
		onClose();
	}

	function confirm() {
		if (!proposal) return;
		setError(null);
		reject.mutate(
			{ jobId, proposalId: proposal.id },
			{
				onSuccess: () => {
					toast.success("Proposal rejected.");
					close();
				},
				onError: (err) => {
					setError(
						getErrorMessage(err, "Could not reject the proposal. Try again."),
					);
				},
			},
		);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) close();
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Reject {proposal?.freelancer?.name ?? "this proposal"}?
					</DialogTitle>
					<DialogDescription>
						They will be notified and can no longer be hired for this job.
					</DialogDescription>
				</DialogHeader>
				<DialogBody className="flex flex-col gap-4">
					<div className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
						Rejecting only affects this pitch — every other proposal stays
						pending and the job keeps accepting new ones.
					</div>
					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}
				</DialogBody>
				<Separator />
				<DialogFooter className="border-t-0 p-6 pt-0">
					<Button type="button" variant="outline" onClick={close}>
						Keep it
					</Button>
					<Button
						type="button"
						variant="destructive"
						disabled={reject.isPending}
						onClick={confirm}
					>
						{reject.isPending ? "Rejecting…" : "Yes, reject it"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function ProposalReviewSection({
	jobId,
	jobOpen,
}: {
	jobId: string;
	jobOpen: boolean;
}) {
	const { data, isLoading, isError, refetch } = useJobProposals(jobId);
	const [dialog, setDialog] = useState<{
		id: string;
		mode: "accept" | "reject";
	} | null>(null);

	const proposals = data?.data.proposals ?? [];
	const sorted = sortProposals(proposals);
	const selected = dialog
		? (proposals.find((p) => p.id === dialog.id) ?? null)
		: null;
	const othersPending = selected
		? proposals.filter((p) => p.id !== selected.id && p.status === "PENDING")
				.length
		: 0;

	return (
		<>
			<DetailSection
				icon={<FileText className="size-5" />}
				title="Proposals"
				hint={
					proposals.length === 0
						? "Freelancer pitches land here for review"
						: `${proposals.filter((p) => p.status === "PENDING").length} awaiting your decision`
				}
				delay={120}
			>
				{isLoading ? (
					<ul className="grid animate-pulse gap-3" aria-hidden>
						{[0, 1].map((row) => (
							<li
								key={row}
								className="rounded-2xl border border-border bg-card p-5"
							>
								<div className="flex items-center gap-3">
									<span className="size-10 rounded-full bg-muted" />
									<div className="flex-1 space-y-2">
										<div className="h-4 w-1/3 rounded-md bg-muted" />
										<div className="h-3 w-1/4 rounded-md bg-muted/70" />
									</div>
								</div>
							</li>
						))}
					</ul>
				) : isError ? (
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
							onClick={() => refetch()}
							className="border-destructive/30 bg-background/60 text-destructive hover:bg-background hover:text-destructive"
						>
							Retry
						</Button>
					</div>
				) : sorted.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
						No proposals yet. Share the job or check back soon — new pitches
						appear here the moment freelancers send them.
					</div>
				) : (
					<>
						{!jobOpen && (
							<div className="mb-3 flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
								<Handshake className="size-4 shrink-0 text-primary" />
								This job is no longer open — the accepted proposal is marked
								below.
							</div>
						)}
						<ul className="grid gap-3">
							{sorted.map((proposal, index) => (
								<ProposalReviewCard
									key={proposal.id}
									proposal={proposal}
									index={index}
									jobOpen={jobOpen}
									onAccept={() =>
										setDialog({ id: proposal.id, mode: "accept" })
									}
									onReject={() =>
										setDialog({ id: proposal.id, mode: "reject" })
									}
								/>
							))}
						</ul>
					</>
				)}
			</DetailSection>

			<AcceptProposalDialog
				jobId={jobId}
				proposal={dialog?.mode === "accept" ? selected : null}
				othersPending={othersPending}
				open={dialog?.mode === "accept"}
				onClose={() => setDialog(null)}
			/>
			<RejectProposalDialog
				jobId={jobId}
				proposal={dialog?.mode === "reject" ? selected : null}
				open={dialog?.mode === "reject"}
				onClose={() => setDialog(null)}
			/>
		</>
	);
}
