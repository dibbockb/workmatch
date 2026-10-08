"use client";

import {
	Briefcase,
	CalendarBlank,
	CheckCircle,
	CurrencyDollar,
	FileText,
	Gauge,
	PencilSimple,
	Prohibit,
	Trash,
	UsersThree,
} from "@phosphor-icons/react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmJobDialog, EditJobDialog } from "@/features/jobs/job-form";
import {
	DetailSection,
	DetailSidebarCard,
	DetailStat,
	JobDetailBack,
	JobDetailHero,
	JobDetailLoadError,
	JobDetailNotFound,
	JobDetailShell,
	JobDetailSkeleton,
	formatExperience,
	formatLongDate,
	normalizeJob,
} from "@/features/jobs/job-detail";
import { formatBudget } from "@/features/jobs/job-list";
import { useCloseJob, useDeleteJob, useJob } from "@/features/jobs/queries";
import { ProposalReviewSection } from "@/features/proposals/proposal-review";

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

export default function ClientJobDetailPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const router = useRouter();
	const { data: raw, isLoading, isError, refetch } = useJob(jobId);
	const deleteJob = useDeleteJob();
	const closeJob = useCloseJob();

	const [editing, setEditing] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [confirmingClose, setConfirmingClose] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [closeError, setCloseError] = useState<string | null>(null);

	const job = normalizeJob(raw);

	if (isLoading) {
		return <JobDetailSkeleton backLabel="Back to My jobs" />;
	}

	if (isError) {
		return (
			<JobDetailLoadError
				onRetry={() => refetch()}
				backHref="/dashboard/client/jobs"
				backLabel="Back to list"
			/>
		);
	}

	if (!job) {
		return (
			<JobDetailNotFound
				title="No such job exists"
				description="It may have been deleted. Your other postings are safe in My jobs."
				backHref="/dashboard/client/jobs"
				backLabel="Back to My jobs"
				onRetry={() => refetch()}
			/>
		);
	}

	const isClosed = job.status === "CLOSED";
	const experience = formatExperience(job.experienceLevel);

	function handleDelete() {
		setDeleteError(null);
		deleteJob.mutate(jobId, {
			onSuccess: () => {
				toast.success("Job deleted.");
				router.push("/dashboard/client/jobs");
			},
			onError: (error) => {
				setDeleteError(
					getErrorMessage(error, "Could not delete the job. Try again."),
				);
			},
		});
	}

	function handleClose() {
		setCloseError(null);
		closeJob.mutate(jobId, {
			onSuccess: () => {
				toast.success("Applications closed.");
				setConfirmingClose(false);
			},
			onError: (error) => {
				setCloseError(
					getErrorMessage(error, "Could not close the job. Try again."),
				);
			},
		});
	}

	return (
		<JobDetailShell>
			<JobDetailBack href="/dashboard/client/jobs" label="Back to My jobs" />

			<JobDetailHero
				job={job}
				eyebrow="Your posting"
				actions={
					<>
						<Button
							type="button"
							variant="outline"
							size="lg"
							onClick={() => setEditing(true)}
							className="bg-background/70 backdrop-blur"
						>
							<PencilSimple className="size-4" data-icon="inline-start" />
							Edit
						</Button>
						<Button
							type="button"
							size="lg"
							variant="secondary"
							disabled={isClosed || closeJob.isPending}
							onClick={() => setConfirmingClose(true)}
							className="shadow-xs"
						>
							<Prohibit className="size-4" data-icon="inline-start" />
							{closeJob.isPending
								? "Closing…"
								: isClosed
									? "Closed"
									: "Close job"}
						</Button>
					</>
				}
			/>

			{/* Pipeline strip */}
			<div className="grid grid-cols-2 gap-3 animate-rise motion-reduce:animate-none lg:grid-cols-4">
				<div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
					<p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
						<UsersThree className="size-3.5 text-primary" />
						Proposals
					</p>
					<p className="mt-1.5 text-2xl font-bold tabular-nums">
						{job.proposalCount ?? 0}
					</p>
					<p className="mt-0.5 text-xs text-muted-foreground">
						Freelancers pitched
					</p>
				</div>
				<div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
					<p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
						<CurrencyDollar className="size-3.5 text-primary" />
						Budget
					</p>
					<p className="mt-1.5 font-bold tabular-nums">{formatBudget(job)}</p>
					<p className="mt-0.5 text-xs text-muted-foreground">
						Fixed price · USD
					</p>
				</div>
				<div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
					<p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
						<Gauge className="size-3.5 text-primary" />
						Level
					</p>
					<p className="mt-1.5 font-bold">{experience ?? "Any level"}</p>
					<p className="mt-0.5 text-xs text-muted-foreground">
						{job.duration ?? "Flexible duration"}
					</p>
				</div>
				<div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
					<p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
						<CalendarBlank className="size-3.5 text-primary" />
						Deadline
					</p>
					<p className="mt-1.5 font-bold">
						{formatLongDate(job.deadline)?.replace(/, \d{4}$/, "") ?? "Open"}
					</p>
					<p className="mt-0.5 text-xs text-muted-foreground">
						{formatLongDate(job.deadline) ?? "No hard cutoff"}
					</p>
				</div>
			</div>

			<div className="grid items-start gap-5 lg:grid-cols-[1fr_360px]">
				<div className="flex min-w-0 flex-col gap-5">
					<DetailSection
						icon={<FileText className="size-5" />}
						title="About this job"
						hint="Exactly what freelancers see when they open your posting"
						delay={60}
						action={
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setEditing(true)}
							>
								<PencilSimple className="size-3.5" data-icon="inline-start" />
								Edit brief
							</Button>
						}
					>
						{job.description ? (
							<p className="text-[0.9375rem] leading-relaxed whitespace-pre-line text-foreground/90">
								{job.description}
							</p>
						) : (
							<div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
								No written brief yet. Add scope, deliverables and milestones so
								proposals come back sharp — use Edit above to fill it in.
							</div>
						)}

						{(job.requiredSkills?.length ?? 0) > 0 && (
							<>
								<Separator className="my-5" />
								<p className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
									Required skills
								</p>
								<div className="mt-2.5 flex flex-wrap gap-1.5">
									{job.requiredSkills?.map((skill) => (
										<span
											key={skill}
											className="rounded-lg border border-primary/25 bg-primary/8 px-2.5 py-1 text-xs font-semibold text-foreground"
										>
											{skill}
										</span>
									))}
								</div>
							</>
						)}
					</DetailSection>

					<DetailSection
						icon={<Briefcase className="size-5" />}
						title="Posting details"
						hint="Budget, timing and status in one place"
						delay={100}
					>
						<div className="grid gap-3 sm:grid-cols-2">
							<DetailStat
								label="Budget range"
								value={formatBudget(job)}
								sub={`$${Number(job.budgetMin).toLocaleString()} – $${Number(job.budgetMax).toLocaleString()}`}
							/>
							<DetailStat
								label="Status"
								value={
									isClosed
										? "Closed"
										: job.status
												.toLowerCase()
												.replace(/_/g, " ")
												.replace(/\b\w/g, (c) => c.toUpperCase())
								}
								sub={
									isClosed
										? "No longer accepting proposals"
										: "Accepting proposals"
								}
							/>
							<DetailStat
								label="Duration"
								value={job.duration ?? "Flexible"}
								sub="Your estimate"
							/>
							<DetailStat
								label="Deadline"
								value={formatLongDate(job.deadline) ?? "No deadline"}
								sub={
									experience ? `${experience} preferred` : "Open to all levels"
								}
							/>
						</div>
					</DetailSection>

					<ProposalReviewSection jobId={jobId} jobOpen={!isClosed} />
				</div>

				<div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6">
					<DetailSidebarCard
						title="Manage this job"
						description={
							isClosed
								? "This posting is closed — edit the brief, or remove it for good."
								: "Refine the brief, or close applications once shortlisting starts."
						}
					>
						<div className="flex flex-col gap-2.5">
							<Button
								type="button"
								variant="outline"
								onClick={() => setEditing(true)}
								className="w-full"
							>
								<PencilSimple className="size-4" data-icon="inline-start" />
								Edit job
							</Button>
							<Button
								type="button"
								variant="secondary"
								disabled={isClosed || closeJob.isPending}
								onClick={() => setConfirmingClose(true)}
								className="w-full"
							>
								<Prohibit className="size-4" data-icon="inline-start" />
								{closeJob.isPending
									? "Closing…"
									: isClosed
										? "Job closed"
										: "Close job"}
							</Button>
							{closeJob.isError && !confirmingClose && (
								<p role="alert" className="text-sm text-destructive">
									Could not close the job. Try again.
								</p>
							)}
							{closeJob.isSuccess && (
								<p
									role="status"
									className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400"
								>
									<CheckCircle className="size-4" />
									Applications closed.
								</p>
							)}
							<p className="text-xs leading-relaxed text-muted-foreground">
								Closing keeps the posting visible but stops new proposals —
								perfect once shortlisting starts.
							</p>
						</div>
					</DetailSidebarCard>

					<aside
						className="rounded-3xl border border-destructive/30 bg-destructive/5 p-6 shadow-xs animate-rise motion-reduce:animate-none"
						style={{ animationDelay: "160ms" }}
					>
						<h2 className="inline-flex items-center gap-1.5 font-semibold tracking-tight text-destructive">
							<Trash className="size-4" />
							Danger zone
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Delete the posting and all of its proposals.
						</p>
						<Separator className="my-4 bg-destructive/20" />
						<Button
							type="button"
							variant="destructive"
							disabled={deleteJob.isPending}
							onClick={() => {
								setDeleteError(null);
								setConfirmingDelete(true);
							}}
							className="w-full"
						>
							<Trash className="size-4" data-icon="inline-start" />
							Delete job
						</Button>
					</aside>
				</div>
			</div>

			<EditJobDialog
				open={editing}
				onClose={() => setEditing(false)}
				job={job}
			/>

			<ConfirmJobDialog
				open={confirmingClose}
				onClose={() => {
					setConfirmingClose(false);
					setCloseError(null);
					closeJob.reset();
				}}
				title={isClosed ? "Job already closed" : "Close this job?"}
				description="New proposals stop immediately. You keep every pitch received so far."
				confirmLabel="Yes, close it"
				pendingLabel="Closing…"
				loading={closeJob.isPending}
				error={closeError}
				onConfirm={handleClose}
			/>

			<ConfirmJobDialog
				open={confirmingDelete}
				onClose={() => {
					setConfirmingDelete(false);
					setDeleteError(null);
					deleteJob.reset();
				}}
				title="Delete this job?"
				description={`“${job.title}” will be removed for everyone.`}
				confirmLabel="Yes, delete it"
				pendingLabel="Deleting…"
				danger
				loading={deleteJob.isPending}
				error={deleteError}
				onConfirm={handleDelete}
			/>
		</JobDetailShell>
	);
}
