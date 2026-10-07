"use client";

import {
	Briefcase,
	CalendarBlank,
	CheckCircle,
	CurrencyDollar,
	FileText,
	FloppyDisk,
	Gauge,
	PencilSimple,
	Prohibit,
	Trash,
	UsersThree,
	X,
} from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateJob } from "@/features/jobs/api";
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

export default function ClientJobDetailPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const router = useRouter();
	const qc = useQueryClient();
	const { data: raw, isLoading, isError, refetch } = useJob(jobId);
	const deleteJob = useDeleteJob();
	const closeJob = useCloseJob();

	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [editing, setEditing] = useState(false);
	const [title, setTitle] = useState("");

	const job = normalizeJob(raw);
	const jobTitle = job?.title ?? "";

	useEffect(() => {
		if (!editing && jobTitle) setTitle(jobTitle);
	}, [jobTitle, editing]);

	const updateMutation = useMutation({
		mutationFn: () => updateJob(jobId, { title: title.trim() }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["job", jobId] });
			qc.invalidateQueries({ queryKey: ["myJobs"] });
			setEditing(false);
		},
	});

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
	const canSave =
		title.trim().length > 0 &&
		title.trim() !== job.title &&
		!updateMutation.isPending;

	function handleDelete() {
		if (!confirmingDelete) {
			setConfirmingDelete(true);
			return;
		}
		deleteJob.mutate(jobId, {
			onSuccess: () => router.push("/dashboard/client/jobs"),
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
							onClick={() => setEditing((v) => !v)}
							className="bg-background/70 backdrop-blur"
						>
							{editing ? (
								<X className="size-4" data-icon="inline-start" />
							) : (
								<PencilSimple className="size-4" data-icon="inline-start" />
							)}
							{editing ? "Cancel" : "Edit"}
						</Button>
						<Button
							type="button"
							size="lg"
							variant="secondary"
							disabled={isClosed || closeJob.isPending}
							onClick={() => closeJob.mutate(jobId)}
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

			{/* Title editor */}
			{editing && (
				<div className="rounded-3xl border border-primary/30 bg-card p-5 shadow-xs animate-rise motion-reduce:animate-none sm:p-6">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (canSave) updateMutation.mutate();
						}}
						className="flex flex-col gap-3"
					>
						<Label htmlFor="jobTitle">Job title</Label>
						<div className="flex flex-col gap-2 sm:flex-row">
							<Input
								id="jobTitle"
								value={title}
								autoFocus
								onChange={(e) => setTitle(e.target.value)}
								placeholder="e.g. Setup WordPress Blog"
								maxLength={120}
								className="h-10 flex-1 rounded-xl shadow-xs"
							/>
							<div className="flex shrink-0 gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => {
										setTitle(job.title);
										setEditing(false);
										updateMutation.reset();
									}}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={!canSave}>
									<FloppyDisk className="size-4" data-icon="inline-start" />
									{updateMutation.isPending ? "Saving…" : "Save"}
								</Button>
							</div>
						</div>
						{updateMutation.isError && (
							<p role="alert" className="text-sm text-destructive">
								Could not save the new title. Try again.
							</p>
						)}
						{updateMutation.isSuccess && (
							<p
								role="status"
								className="inline-flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400"
							>
								<CheckCircle className="size-4" />
								Title updated.
							</p>
						)}
					</form>
				</div>
			)}

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
					>
						{job.description ? (
							<p className="text-[0.9375rem] leading-relaxed whitespace-pre-line text-foreground/90">
								{job.description}
							</p>
						) : (
							<div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
								No written brief yet. Add scope, deliverables and milestones so
								proposals come back sharp — use Edit above to refine the title
								first.
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
				</div>

				<div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6">
					<DetailSidebarCard
						title="Manage this job"
						description={
							isClosed
								? "This posting is closed — reopen it by editing, or remove it for good."
								: "Close applications when you have enough pitches to review."
						}
					>
						<div className="flex flex-col gap-2.5">
							<Button
								type="button"
								variant="secondary"
								disabled={isClosed || closeJob.isPending}
								onClick={() => closeJob.mutate(jobId)}
								className="w-full"
							>
								<Prohibit className="size-4" data-icon="inline-start" />
								{closeJob.isPending
									? "Closing…"
									: isClosed
										? "Job closed"
										: "Close job"}
							</Button>
							{closeJob.isError && (
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
							{confirmingDelete
								? "This permanently removes the posting. This can't be undone."
								: "Delete the posting and all of its proposals."}
						</p>
						<Separator className="my-4 bg-destructive/20" />
						<div className="flex flex-col gap-2">
							{confirmingDelete && (
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setConfirmingDelete(false)}
								>
									Keep my posting
								</Button>
							)}
							<Button
								type="button"
								variant="destructive"
								disabled={deleteJob.isPending}
								onClick={handleDelete}
								className="w-full"
							>
								<Trash className="size-4" data-icon="inline-start" />
								{deleteJob.isPending
									? "Deleting…"
									: confirmingDelete
										? "Yes, delete it"
										: "Delete job"}
							</Button>
							{deleteJob.isError && (
								<p role="alert" className="text-sm text-destructive">
									Could not delete the job. Try again.
								</p>
							)}
						</div>
					</aside>
				</div>
			</div>
		</JobDetailShell>
	);
}
