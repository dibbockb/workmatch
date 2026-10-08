"use client";

import {
	Briefcase,
	CalendarBlank,
	CurrencyDollar,
	Gauge,
	X,
} from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { HeaderStat, PageHeader } from "@/components/shared/page-header";
import {
	DetailSidebarCard,
	DetailStat,
	JobDetailBack,
	JobDetailShell,
} from "@/features/jobs/job-detail";
import { useCreateJob } from "@/features/jobs/queries";
import {
	EXPERIENCE_LEVELS,
	type JobFormValues,
	jobFormSchema,
} from "@/features/jobs/schemas";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<Record<keyof JobFormValues, string>>;

const EMPTY: JobFormValues = {
	title: "",
	description: "",
	requiredSkills: [],
	budgetMin: 500,
	budgetMax: 1200,
	deadline: "",
	duration: "",
	experienceLevel: "BEGINNER",
};

function validate(values: JobFormValues): FieldErrors {
	const parsed = jobFormSchema.safeParse(values);
	const errors: FieldErrors = {};
	if (!parsed.success) {
		for (const issue of parsed.error.issues) {
			const key = String(issue.path[0] ?? "") as keyof JobFormValues;
			if (key) errors[key] ??= issue.message;
		}
	}
	if (
		Number(values.budgetMin) > Number(values.budgetMax) &&
		!errors.budgetMax
	) {
		errors.budgetMax = "Maximum must be at least the minimum.";
	}
	return errors;
}

function createdJobId(raw: unknown): string | null {
	if (!raw || typeof raw !== "object") return null;
	const envelope = raw as { data?: { id?: string }; id?: string };
	if (typeof envelope.id === "string") return envelope.id;
	if (envelope.data && typeof envelope.data.id === "string") {
		return envelope.data.id;
	}
	return null;
}

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

export default function NewJobPage() {
	const router = useRouter();
	const create = useCreateJob();

	const [values, setValues] = useState<JobFormValues>(EMPTY);
	const [touched, setTouched] = useState(false);
	const [skillDraft, setSkillDraft] = useState("");
	const [serverError, setServerError] = useState<string | null>(null);

	const errors = useMemo(
		() => (touched ? validate(values) : {}),
		[touched, values],
	);

	function set<K extends keyof JobFormValues>(key: K, value: JobFormValues[K]) {
		setValues((v) => ({ ...v, [key]: value }));
	}

	function addSkill(raw: string) {
		const skill = raw.trim().replace(/,+/g, "");
		if (!skill) return;
		if (
			values.requiredSkills.some((s) => s.toLowerCase() === skill.toLowerCase())
		) {
			setSkillDraft("");
			return;
		}
		if (values.requiredSkills.length >= 15) {
			toast.warning("Keep it to 15 skills or fewer.");
			return;
		}
		setValues((v) => ({ ...v, requiredSkills: [...v.requiredSkills, skill] }));
		setSkillDraft("");
	}

	const budgetPreview =
		Number.isFinite(Number(values.budgetMin)) &&
		Number.isFinite(Number(values.budgetMax)) &&
		Number(values.budgetMin) > 0 &&
		Number(values.budgetMax) > 0
			? `$${Number(values.budgetMin).toLocaleString()} – $${Number(values.budgetMax).toLocaleString()}`
			: "—";

	const deadlinePreview = (() => {
		if (!values.deadline) return "No date yet";
		const d = new Date(`${values.deadline}T00:00:00`);
		if (Number.isNaN(d.getTime())) return "No date yet";
		return d.toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	})();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setTouched(true);
		setServerError(null);
		const errs = validate(values);
		if (Object.keys(errs).length > 0) {
			document
				.querySelector<HTMLElement>(
					"[data-invalid='true'] input, [data-invalid='true'] textarea",
				)
				?.focus();
			return;
		}
		create.mutate(
			{
				title: values.title.trim(),
				description: values.description.trim(),
				requiredSkills: values.requiredSkills,
				budgetMin: Number(values.budgetMin),
				budgetMax: Number(values.budgetMax),
				deadline: new Date(`${values.deadline}T00:00:00Z`).toISOString(),
				duration: values.duration.trim(),
				experienceLevel: values.experienceLevel,
			},
			{
				onSuccess: (raw) => {
					toast.success("Job posted — freelancers can pitch now.");
					const id = createdJobId(raw);
					router.push(
						id ? `/dashboard/client/jobs/${id}` : "/dashboard/client/jobs",
					);
				},
				onError: (error) => {
					setServerError(
						getErrorMessage(error, "Could not post the job. Try again."),
					);
				},
			},
		);
	}

	const today = new Date().toISOString().slice(0, 10);

	return (
		<JobDetailShell className="max-w-5xl">
			<JobDetailBack href="/dashboard/client/jobs" label="Back to My jobs" />

			<PageHeader
				title="Post a new job"
				description="Describe the outcome — strong briefs get sharper proposals."
				actions={
					<HeaderStat
						value={values.requiredSkills.length}
						label={
							values.requiredSkills.length === 1
								? "skill added"
								: "skills added"
						}
						loading={false}
					/>
				}
			/>

			<div className="grid items-start gap-5 lg:grid-cols-[1fr_360px]">
				<section className="rounded-3xl border border-border bg-card p-6 shadow-xs animate-rise motion-reduce:animate-none sm:p-7">
					<form
						onSubmit={handleSubmit}
						noValidate
						className="flex flex-col gap-5"
					>
						<Field data-invalid={Boolean(errors.title)}>
							<FieldLabel htmlFor="job-title">Job title</FieldLabel>
							<Input
								id="job-title"
								value={values.title}
								onChange={(e) => set("title", e.target.value)}
								onBlur={() => setTouched(true)}
								placeholder="e.g. Setup WordPress Blog"
								maxLength={120}
								aria-invalid={Boolean(errors.title)}
								className="h-10 rounded-xl shadow-xs"
							/>
							<FieldDescription>
								Lead with the outcome — “Build…”, “Design…”, “Set up…”.
							</FieldDescription>
							<FieldError>{errors.title}</FieldError>
						</Field>

						<Field data-invalid={Boolean(errors.description)}>
							<div className="flex items-baseline justify-between gap-3">
								<FieldLabel htmlFor="job-description">Description</FieldLabel>
								<span className="text-xs text-muted-foreground tabular-nums">
									{values.description.trim().length} chars
								</span>
							</div>
							<Textarea
								id="job-description"
								value={values.description}
								onChange={(e) => set("description", e.target.value)}
								onBlur={() => setTouched(true)}
								placeholder={
									"What needs doing, deliverables, and what “done” looks like.\n\nRequirements:\n- …\n- …"
								}
								rows={8}
								maxLength={8000}
								aria-invalid={Boolean(errors.description)}
								className="min-h-40 rounded-xl shadow-xs"
							/>
							<FieldDescription>
								Scope, milestones, integrations and handover docs get sharper
								proposals.
							</FieldDescription>
							<FieldError>{errors.description}</FieldError>
						</Field>

						<Field data-invalid={Boolean(errors.requiredSkills)}>
							<FieldLabel htmlFor="job-skills">Required skills</FieldLabel>
							<div className="rounded-xl border border-input bg-transparent p-2 shadow-xs transition-all focus-within:ring-2 focus-within:ring-ring/80">
								{values.requiredSkills.length > 0 && (
									<div className="flex flex-wrap gap-1.5 px-1 pt-1 pb-2">
										{values.requiredSkills.map((skill) => (
											<span
												key={skill}
												className="inline-flex items-center gap-1 rounded-lg border border-primary/25 bg-primary/8 py-1 pr-1.5 pl-2.5 text-xs font-semibold"
											>
												{skill}
												<button
													type="button"
													aria-label={`Remove ${skill}`}
													onClick={() =>
														setValues((v) => ({
															...v,
															requiredSkills: v.requiredSkills.filter(
																(s) => s !== skill,
															),
														}))
													}
													className="grid size-4 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
												>
													<X className="size-3" />
												</button>
											</span>
										))}
									</div>
								)}
								<Input
									id="job-skills"
									value={skillDraft}
									onChange={(e) => setSkillDraft(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === ",") {
											e.preventDefault();
											addSkill(skillDraft);
										} else if (
											e.key === "Backspace" &&
											!skillDraft &&
											values.requiredSkills.length > 0
										) {
											setValues((v) => ({
												...v,
												requiredSkills: v.requiredSkills.slice(0, -1),
											}));
										}
									}}
									onBlur={() => {
										if (skillDraft.trim()) addSkill(skillDraft);
									}}
									placeholder={
										values.requiredSkills.length === 0
											? "Type a skill and press Enter — e.g. WordPress"
											: "Add another skill…"
									}
									aria-invalid={Boolean(errors.requiredSkills)}
									className="border-0 shadow-none focus-visible:ring-0"
								/>
							</div>
							<FieldDescription>
								Press Enter after each skill. 1–15 skills, most jobs land around
								4–6.
							</FieldDescription>
							<FieldError>{errors.requiredSkills}</FieldError>
						</Field>

						<fieldset>
							<div className="flex items-center justify-between gap-3">
								<legend className="inline-flex items-center gap-1.5 text-sm font-medium">
									<CurrencyDollar className="size-4 text-primary" />
									Budget (USD)
								</legend>
								<span className="text-xs font-semibold tabular-nums">
									{budgetPreview}
								</span>
							</div>
							<div className="mt-2 grid gap-3 sm:grid-cols-2">
								<Field data-invalid={Boolean(errors.budgetMin)}>
									<FieldLabel
										htmlFor="job-budget-min"
										className="text-xs text-muted-foreground"
									>
										Minimum
									</FieldLabel>
									<Input
										id="job-budget-min"
										type="number"
										inputMode="numeric"
										min={1}
										max={1000000}
										value={values.budgetMin}
										onChange={(e) =>
											set("budgetMin", e.target.value as unknown as number)
										}
										onBlur={() => setTouched(true)}
										placeholder="500"
										className="h-10 rounded-xl shadow-xs tabular-nums"
									/>
									<FieldError>{errors.budgetMin}</FieldError>
								</Field>
								<Field data-invalid={Boolean(errors.budgetMax)}>
									<FieldLabel
										htmlFor="job-budget-max"
										className="text-xs text-muted-foreground"
									>
										Maximum
									</FieldLabel>
									<Input
										id="job-budget-max"
										type="number"
										inputMode="numeric"
										min={1}
										max={1000000}
										value={values.budgetMax}
										onChange={(e) =>
											set("budgetMax", e.target.value as unknown as number)
										}
										onBlur={() => setTouched(true)}
										placeholder="1200"
										className="h-10 rounded-xl shadow-xs tabular-nums"
									/>
									<FieldError>{errors.budgetMax}</FieldError>
								</Field>
							</div>
						</fieldset>

						<div className="grid gap-5 sm:grid-cols-2">
							<Field data-invalid={Boolean(errors.deadline)}>
								<FieldLabel
									htmlFor="job-deadline"
									className="inline-flex items-center gap-1.5"
								>
									<CalendarBlank className="size-4 text-primary" />
									Deadline
								</FieldLabel>
								<Input
									id="job-deadline"
									type="date"
									value={values.deadline}
									min={today}
									onChange={(e) => set("deadline", e.target.value)}
									onBlur={() => setTouched(true)}
									className="h-10 rounded-xl shadow-xs"
								/>
								<FieldError>{errors.deadline}</FieldError>
							</Field>
							<Field data-invalid={Boolean(errors.duration)}>
								<FieldLabel htmlFor="job-duration">Duration</FieldLabel>
								<Input
									id="job-duration"
									value={values.duration}
									onChange={(e) => set("duration", e.target.value)}
									onBlur={() => setTouched(true)}
									placeholder="1 week"
									maxLength={60}
									className="h-10 rounded-xl shadow-xs"
								/>
								<FieldDescription>
									e.g. 1 week, 2–3 weeks, 1 month.
								</FieldDescription>
								<FieldError>{errors.duration}</FieldError>
							</Field>
						</div>

						<Field data-invalid={Boolean(errors.experienceLevel)}>
							<FieldLabel className="inline-flex items-center gap-1.5">
								<Gauge className="size-4 text-primary" />
								Experience level
							</FieldLabel>
							<div className="grid grid-cols-3 gap-2">
								{EXPERIENCE_LEVELS.map((level) => {
									const active = values.experienceLevel === level;
									return (
										<label
											key={level}
											className={cn(
												"cursor-pointer rounded-xl border px-3 py-2.5 text-center text-xs font-semibold tracking-wide uppercase transition-all focus-within:ring-2 focus-within:ring-ring/60 focus-within:outline-none has-checked:border-primary/40 has-checked:bg-primary has-checked:text-primary-foreground has-checked:shadow-xs",
												!active &&
													"border-border bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground",
											)}
										>
											<input
												type="radio"
												name="experienceLevel"
												value={level}
												checked={active}
												onChange={() => set("experienceLevel", level)}
												className="sr-only"
											/>
											{level.charAt(0) + level.slice(1).toLowerCase()}
										</label>
									);
								})}
							</div>
							<FieldError>{errors.experienceLevel}</FieldError>
						</Field>

						{serverError && (
							<p
								role="alert"
								className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
							>
								{serverError}
							</p>
						)}

						<Separator />
						<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.push("/dashboard/client/jobs")}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={create.isPending} size="lg">
								{create.isPending ? (
									<span className="inline-flex items-center gap-2">
										<span
											aria-hidden
											className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
										/>
										Posting…
									</span>
								) : (
									<>
										<Briefcase className="size-4" data-icon="inline-start" />
										Post job
									</>
								)}
							</Button>
						</div>
					</form>
				</section>

				<div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6">
					<DetailSidebarCard
						title="Posting preview"
						description="What freelancers see at a glance, updated live."
					>
						<div className="grid gap-3">
							<DetailStat
								label="Budget range"
								value={budgetPreview}
								sub="Fixed price · USD"
							/>
							<DetailStat
								label="Deadline"
								value={deadlinePreview}
								sub={values.duration.trim() || "Add a duration estimate"}
							/>
							<DetailStat
								label="Level"
								value={
									values.experienceLevel.charAt(0) +
									values.experienceLevel.slice(1).toLowerCase()
								}
								sub={`${values.requiredSkills.length} ${values.requiredSkills.length === 1 ? "skill" : "skills"} listed`}
							/>
						</div>
					</DetailSidebarCard>
				</div>
			</div>
		</JobDetailShell>
	);
}
