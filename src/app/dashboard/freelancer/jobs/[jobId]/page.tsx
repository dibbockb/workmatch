"use client";

import {
	Briefcase,
	CalendarBlank,
	CheckCircle,
	CurrencyDollar,
	FileText,
	Gauge,
	Lightning,
	PaperPlaneTilt,
	ShieldCheck,
	Timer,
} from "@phosphor-icons/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useJob } from "@/features/jobs/queries";
import { useSubmitProposal } from "@/features/proposals/queries";
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

export default function JobDetailPage() {
	const { jobId } = useParams<{ jobId: string }>();
	const { data: raw, isLoading, isError, refetch } = useJob(jobId);
	const {
		mutate,
		isPending,
		isSuccess,
		isError: submitFailed,
		reset,
	} = useSubmitProposal();

	const [coverLetter, setCoverLetter] = useState("");
	const [proposedPrice, setProposedPrice] = useState("");
	const [proposedTimeline, setProposedTimeline] = useState("");

	if (isLoading) {
		return <JobDetailSkeleton backLabel="Back to Find work" />;
	}

	if (isError) {
		return (
			<JobDetailLoadError
				onRetry={() => refetch()}
				backHref="/dashboard/freelancer/jobs"
				backLabel="Back to list"
			/>
		);
	}

	const job = normalizeJob(raw);
	if (!job) {
		return (
			<JobDetailNotFound
				title="Job not found"
				description="This gig may have been removed or the link is wrong. Browse open jobs and find your next fit."
				backHref="/dashboard/freelancer/jobs"
				backLabel="Back to Find work"
				onRetry={() => refetch()}
			/>
		);
	}

	function handleApply(e: React.FormEvent) {
		e.preventDefault();
		mutate({
			jobId,
			coverLetter: coverLetter.trim(),
			proposedPrice: Number(proposedPrice),
			proposedTimeline: Number(proposedTimeline),
		});
	}

	const canSubmit =
		coverLetter.trim().length >= 10 &&
		Number(proposedPrice) > 0 &&
		Number(proposedTimeline) > 0 &&
		!isPending;

	const experience = formatExperience(job.experienceLevel);
	const posted = formatLongDate(job.createdAt);

	return (
		<JobDetailShell>
			<JobDetailBack
				href="/dashboard/freelancer/jobs"
				label="Back to Find work"
			/>

			<JobDetailHero
				job={job}
				eyebrow="Open gig"
				actions={
					<Button
						type="button"
						size="lg"
						className="w-full shadow-xs lg:w-auto"
						onClick={() =>
							document
								.getElementById("apply")
								?.scrollIntoView({ behavior: "smooth", block: "start" })
						}
					>
						<PaperPlaneTilt className="size-4" data-icon="inline-start" />
						Apply now
					</Button>
				}
			/>

			{/* Key facts */}
			<div className="grid grid-cols-2 gap-3 animate-rise motion-reduce:animate-none lg:grid-cols-4">
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
						<Timer className="size-3.5 text-primary" />
						Duration
					</p>
					<p className="mt-1.5 font-bold">{job.duration ?? "Flexible"}</p>
					<p className="mt-0.5 text-xs text-muted-foreground">
						Expected timeline
					</p>
				</div>
				<div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
					<p className="inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
						<Gauge className="size-3.5 text-primary" />
						Level
					</p>
					<p className="mt-1.5 font-bold">{experience ?? "Any level"}</p>
					<p className="mt-0.5 text-xs text-muted-foreground">
						Experience needed
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
				{/* Main column */}
				<div className="flex min-w-0 flex-col gap-5">
					<DetailSection
						icon={<FileText className="size-5" />}
						title="About this job"
						hint={
							posted
								? `Posted ${posted}${job.client?.name ? ` by ${job.client.name}` : ""}`
								: job.client?.name
									? `Posted by ${job.client.name}`
									: "The full brief from the client"
						}
						delay={60}
					>
						{job.description ? (
							<p className="text-[0.9375rem] leading-relaxed whitespace-pre-line text-foreground/90">
								{job.description}
							</p>
						) : (
							<div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-sm text-muted-foreground">
								The client hasn&apos;t added a written brief yet — the budget,
								skills and timeline above are the best guide for now. A strong
								proposal references the title and suggests a first milestone.
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
						title="Job details"
						hint="Scope, budget and timing at a glance"
						delay={100}
					>
						<div className="grid gap-3 sm:grid-cols-2">
							<DetailStat
								label="Budget range"
								value={formatBudget(job)}
								sub={`$${Number(job.budgetMin).toLocaleString()} – $${Number(job.budgetMax).toLocaleString()}`}
							/>
							<DetailStat
								label="Deadline"
								value={
									formatLongDate(job.deadline)?.replace(/, \d{4}$/, "") ??
									"Flexible"
								}
								sub={formatLongDate(job.deadline) ?? "No hard cutoff"}
							/>
							<DetailStat
								label="Duration"
								value={job.duration ?? "Flexible"}
								sub="Client estimate"
							/>
							<DetailStat
								label="Experience"
								value={experience ?? "Open to all"}
								sub="Preferred level"
							/>
						</div>
					</DetailSection>
				</div>

				{/* Sidebar */}
				<div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6">
					<DetailSidebarCard
						title="Send a proposal"
						description="Stand out with a sharp pitch and a fair price."
					>
						{isSuccess ? (
							<div
								role="status"
								className="flex flex-col items-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-8 text-center"
							>
								<span className="grid size-12 place-items-center rounded-2xl bg-emerald-500 text-white shadow-xs">
									<CheckCircle className="size-6" />
								</span>
								<p className="mt-3 font-semibold text-emerald-700 dark:text-emerald-300">
									Proposal submitted
								</p>
								<p className="mt-1 max-w-[26ch] text-sm text-balance text-emerald-700/80 dark:text-emerald-300/80">
									The client can now review your pitch. We&apos;ll notify you on
									any reply.
								</p>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="mt-4"
									onClick={() => reset()}
								>
									Write another
								</Button>
							</div>
						) : (
							<form
								id="apply"
								onSubmit={handleApply}
								className="flex scroll-mt-24 flex-col gap-4"
							>
								<div className="flex flex-col gap-1.5">
									<Label htmlFor="coverLetter">Cover letter</Label>
									<textarea
										id="coverLetter"
										value={coverLetter}
										onChange={(e) => setCoverLetter(e.target.value)}
										placeholder="Hi! I'm a great fit because… here's how I'd approach the first milestone…"
										rows={5}
										required
										minLength={10}
										className="w-full resize-y rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm leading-relaxed shadow-xs transition-all outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/70"
									/>
									<p className="text-xs text-muted-foreground">
										Min. 10 characters ·{" "}
										<span className="tabular-nums">
											{coverLetter.trim().length}
										</span>{" "}
										written
									</p>
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div className="flex flex-col gap-1.5">
										<Label htmlFor="proposedPrice">Your price</Label>
										<div className="relative">
											<CurrencyDollar className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="proposedPrice"
												type="number"
												min={1}
												step={1}
												inputMode="decimal"
												value={proposedPrice}
												onChange={(e) => setProposedPrice(e.target.value)}
												placeholder="850"
												required
												className="h-10 rounded-xl pr-3 pl-9 shadow-xs"
											/>
										</div>
									</div>
									<div className="flex flex-col gap-1.5">
										<Label htmlFor="proposedTimeline">Timeline</Label>
										<div className="relative">
											<Timer className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
											<Input
												id="proposedTimeline"
												type="number"
												min={1}
												step={1}
												inputMode="numeric"
												value={proposedTimeline}
												onChange={(e) => setProposedTimeline(e.target.value)}
												placeholder="7 days"
												required
												className="h-10 rounded-xl pr-3 pl-9 shadow-xs"
											/>
										</div>
									</div>
								</div>

								{submitFailed && (
									<p
										role="alert"
										className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
									>
										Something went wrong sending your proposal. Check the fields
										and try again.
									</p>
								)}

								<Button
									type="submit"
									size="lg"
									disabled={!canSubmit}
									className="w-full shadow-xs"
								>
									<PaperPlaneTilt className="size-4" data-icon="inline-start" />
									{isPending ? "Submitting…" : "Submit proposal"}
								</Button>
								<p className="text-center text-xs text-muted-foreground">
									Budget {formatBudget(job)} · reply rate is highest in the
									first 24h
								</p>
							</form>
						)}
					</DetailSidebarCard>

					<aside
						className="rounded-3xl border border-border bg-card p-6 shadow-xs animate-rise motion-reduce:animate-none"
						style={{ animationDelay: "160ms" }}
					>
						<h2 className="inline-flex items-center gap-1.5 font-semibold tracking-tight">
							<ShieldCheck className="size-4 text-primary" />
							Protected by WorkMatch
						</h2>
						<ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
							<li className="flex gap-2">
								<Lightning className="mt-0.5 size-4 shrink-0 text-primary" />
								Vetted clients — payments are held in escrow before work starts.
							</li>
							<li className="flex gap-2">
								<CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
								Clear milestones keep scope, price and timeline in writing.
							</li>
						</ul>
					</aside>
				</div>
			</div>
		</JobDetailShell>
	);
}
