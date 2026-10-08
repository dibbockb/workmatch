"use client";

import {
	Briefcase,
	CalendarBlank,
	CurrencyDollar,
	Gauge,
	Plus,
	Trash,
	X,
} from "@phosphor-icons/react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUpdateJob } from "./queries";
import {
	EXPERIENCE_LEVELS,
	type JobFormValues,
	jobFormSchema,
} from "./schemas";
import type { DetailJob } from "./job-detail";

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

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

export function toDateInputValue(iso?: string | null) {
	if (!iso) return "";
	const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
	if (Number.isNaN(d.getTime())) return "";
	return d.toISOString().slice(0, 10);
}

function toDeadlineISO(dateInput: string) {
	// <input type="date"> gives YYYY-MM-DD — send midnight UTC like the API expects.
	return new Date(`${dateInput}T00:00:00Z`).toISOString();
}

function defaultValues(job?: DetailJob | null): JobFormValues {
	return {
		title: job?.title ?? "",
		description: job?.description ?? "",
		requiredSkills: job?.requiredSkills ?? [],
		budgetMin: Number(job?.budgetMin ?? 500) || 500,
		budgetMax: Number(job?.budgetMax ?? 1200) || 1200,
		deadline: toDateInputValue(job?.deadline),
		duration: job?.duration ?? "",
		experienceLevel: (EXPERIENCE_LEVELS as readonly string[]).includes(
			String(job?.experienceLevel ?? "").toUpperCase(),
		)
			? (String(
				job?.experienceLevel,
			).toUpperCase() as JobFormValues["experienceLevel"])
			: "BEGINNER",
	};
}

/* ------------------------------------------------------------------ *
 * Modal shell — same visual language as PageHeader / JobDetailHero
 * ------------------------------------------------------------------ */

export function JobModal({
	open,
	onClose,
	title,
	description,
	icon,
	children,
	wide,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
	wide?: boolean;
}) {
	const [mounted, setMounted] = useState(false);
	const [visible, setVisible] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => setMounted(true), []);

	useEffect(() => {
		if (!open) {
			setVisible(false);
			return;
		}
		setVisible(true);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const frame = requestAnimationFrame(() => {
			panelRef.current
				?.querySelector<HTMLElement>("input, textarea, select")
				?.focus({ preventScroll: true });
		});
		return () => {
			document.body.style.overflow = prevOverflow;
			cancelAnimationFrame(frame);
		};
	}, [open]);

	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!mounted || !open) return null;

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
			<button
				type="button"
				aria-label="Close dialog"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-black/55 backdrop-blur-[2px]"
			/>
			<div
				ref={panelRef}
				role="dialog"
				aria-modal="true"
				aria-label={title}
				className={cn(
					"relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-rise motion-reduce:animate-none",
					wide ? "max-w-2xl" : "max-w-md",
					visible && "opacity-100",
				)}
			>
				<div
					aria-hidden
					className="pointer-events-none absolute -top-24 -right-16 size-64 rounded-full bg-primary/15 blur-3xl"
				/>
				<div
					aria-hidden
					className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-primary/60 to-secondary"
				/>
				<div className="relative flex items-start gap-3 border-b border-border/70 p-5 sm:p-6">
					<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/60 text-secondary-foreground ring-1 ring-black/5">
						{icon}
					</span>
					<div className="min-w-0 flex-1">
						<h2 className="font-semibold tracking-tight">{title}</h2>
						{description && (
							<p className="mt-0.5 text-sm text-muted-foreground">
								{description}
							</p>
						)}
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
					>
						<X className="size-4" />
					</button>
				</div>
				<div className="relative min-h-0 flex-1 overflow-y-auto">
					{children}
				</div>
			</div>
		</div>,
		document.body,
	);
}

/* ------------------------------------------------------------------ *
 * Confirm dialog (delete / close)
 * ------------------------------------------------------------------ */

export function ConfirmJobDialog({
	open,
	onClose,
	title,
	description,
	confirmLabel,
	pendingLabel,
	danger,
	loading,
	error,
	onConfirm,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	description: string;
	confirmLabel: string;
	pendingLabel: string;
	danger?: boolean;
	loading?: boolean;
	error?: string | null;
	onConfirm: () => void;
}) {
	return (
		<JobModal
			open={open}
			onClose={onClose}
			title={title}
			description={description}
			icon={
				<Trash
					className={cn("size-5", danger ? "text-destructive" : "text-primary")}
				/>
			}
		>
			<div className="flex flex-col gap-4 p-5 sm:p-6">
				{danger ? (
					<div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm leading-relaxed text-muted-foreground">
						This permanently removes the posting and its proposals. This
						can&rsquo;t be undone.
					</div>
				) : (
					<div className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
						The posting stays visible but stops accepting new proposals — ideal
						once shortlisting starts.
					</div>
				)}
				{error && (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				)}
				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Button type="button" variant="outline" onClick={onClose}>
						Keep it
					</Button>
					<Button
						type="button"
						variant={danger ? "destructive" : "default"}
						disabled={loading}
						onClick={onConfirm}
					>
						{loading ? pendingLabel : confirmLabel}
					</Button>
				</div>
			</div>
		</JobModal>
	);
}

/* ------------------------------------------------------------------ *
 * The form
 * ------------------------------------------------------------------ */

type FieldErrors = Partial<Record<keyof JobFormValues | "form", string>>;

function validate(values: JobFormValues): FieldErrors {
	const parsed = jobFormSchema.safeParse(values);
	if (parsed.success) return {};
	const errors: FieldErrors = {};
	for (const issue of parsed.error.issues) {
		const key = String(issue.path[0] ?? "form") as keyof JobFormValues;
		errors[key] ??= issue.message;
	}
	if (
		Number(values.budgetMin) > Number(values.budgetMax) &&
		!errors.budgetMax
	) {
		errors.budgetMax = "Maximum must be at least the minimum.";
	}
	return errors;
}

function FieldHint({ error, hint }: { error?: string; hint?: string }) {
	if (error) {
		return (
			<p role="alert" className="mt-1.5 text-xs text-destructive">
				{error}
			</p>
		);
	}
	if (hint) {
		return <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>;
	}
	return null;
}

export function JobForm({
	initial,
	submitLabel,
	pendingLabel,
	serverError,
	pending,
	onSubmit,
}: {
	initial: JobFormValues;
	submitLabel: string;
	pendingLabel: string;
	serverError?: string | null;
	pending?: boolean;
	onSubmit: (payload: {
		title: string;
		description: string;
		requiredSkills: string[];
		budgetMin: number;
		budgetMax: number;
		deadline: string;
		duration: string;
		experienceLevel: string;
	}) => void;
}) {
	const titleId = useId();
	const descId = useId();
	const skillsId = useId();
	const minId = useId();
	const maxId = useId();
	const deadlineId = useId();
	const durationId = useId();
	const levelId = useId();

	const [values, setValues] = useState<JobFormValues>(initial);
	const [touched, setTouched] = useState(false);
	const [skillDraft, setSkillDraft] = useState("");

	// The dialog remounts this form via `key` whenever a different job (or
	// revision) is edited, so one-shot state init is enough — no sync effect.
	// (A sync effect keyed on a freshly-built `initial` object would wipe
	// typing on every parent re-render.)

	const errors = touched ? validate(values) : {};
	const invalid = Object.keys(validate(values)).length > 0;

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

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setTouched(true);
		const errs = validate(values);
		if (Object.keys(errs).length > 0) {
			const first = document.querySelector<HTMLElement>(
				"[data-invalid='true'] input, [data-invalid='true'] textarea, [data-invalid='true'] select",
			);
			first?.focus();
			return;
		}
		onSubmit({
			title: values.title.trim(),
			description: values.description.trim(),
			requiredSkills: values.requiredSkills,
			budgetMin: Number(values.budgetMin),
			budgetMax: Number(values.budgetMax),
			deadline: toDeadlineISO(values.deadline),
			duration: values.duration.trim(),
			experienceLevel: values.experienceLevel,
		});
	}

	const budgetPreview =
		Number.isFinite(Number(values.budgetMin)) &&
			Number.isFinite(Number(values.budgetMax)) &&
			Number(values.budgetMin) > 0 &&
			Number(values.budgetMax) > 0
			? `$${Number(values.budgetMin).toLocaleString()} – $${Number(values.budgetMax).toLocaleString()}`
			: "Set a range freelancers can trust";

	return (
		<form
			onSubmit={handleSubmit}
			noValidate
			className="flex flex-col gap-5 p-5 sm:p-6"
		>
			{/* Title */}
			<div data-invalid={Boolean(errors.title)}>
				<Label htmlFor={titleId}>Job title</Label>
				<Input
					id={titleId}
					value={values.title}
					onChange={(e) => set("title", e.target.value)}
					onBlur={() => setTouched(true)}
					placeholder="e.g. Setup WordPress Blog"
					maxLength={120}
					aria-invalid={Boolean(errors.title)}
					className="mt-2 h-10 rounded-xl shadow-xs"
				/>
				<FieldHint
					error={errors.title}
					hint="Lead with the outcome — “Build…”, “Design…”, “Set up…”."
				/>
			</div>

			{/* Description */}
			<div data-invalid={Boolean(errors.description)}>
				<div className="flex items-baseline justify-between gap-3">
					<Label htmlFor={descId}>Description</Label>
					<span className="text-xs text-muted-foreground tabular-nums">
						{values.description.trim().length} chars
					</span>
				</div>
				<textarea
					id={descId}
					value={values.description}
					onChange={(e) => set("description", e.target.value)}
					onBlur={() => setTouched(true)}
					placeholder={
						"What needs doing, deliverables, and what “done” looks like.\n\nRequirements:\n- …\n- …"
					}
					rows={7}
					maxLength={8000}
					aria-invalid={Boolean(errors.description)}
					className="mt-2 min-h-36 w-full rounded-xl border border-input bg-transparent px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-xs transition-all outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring/80"
				/>
				<FieldHint
					error={errors.description}
					hint="Scope, milestones, integrations and handover docs get sharper proposals."
				/>
			</div>

			{/* Skills */}
			<div data-invalid={Boolean(errors.requiredSkills)}>
				<Label htmlFor={skillsId}>Required skills</Label>
				<div className="mt-2 rounded-xl border border-input bg-transparent p-2 shadow-xs transition-all focus-within:ring-2 focus-within:ring-ring/80">
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
						id={skillsId}
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
				<FieldHint
					error={errors.requiredSkills}
					hint="Press Enter after each skill. 1–15 skills, most jobs land around 4–6."
				/>
			</div>

			{/* Budget */}
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
					<div data-invalid={Boolean(errors.budgetMin)}>
						<Label htmlFor={minId} className="text-xs text-muted-foreground">
							Minimum
						</Label>
						<Input
							id={minId}
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
							className="mt-1.5 h-10 rounded-xl shadow-xs tabular-nums"
						/>
						<FieldHint error={errors.budgetMin} />
					</div>
					<div data-invalid={Boolean(errors.budgetMax)}>
						<Label htmlFor={maxId} className="text-xs text-muted-foreground">
							Maximum
						</Label>
						<Input
							id={maxId}
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
							className="mt-1.5 h-10 rounded-xl shadow-xs tabular-nums"
						/>
						<FieldHint error={errors.budgetMax} />
					</div>
				</div>
			</fieldset>

			<div className="grid gap-3 sm:grid-cols-2">
				<div data-invalid={Boolean(errors.deadline)}>
					<Label
						htmlFor={deadlineId}
						className="inline-flex items-center gap-1.5"
					>
						<CalendarBlank className="size-4 text-primary" />
						Deadline
					</Label>
					<Input
						id={deadlineId}
						type="date"
						value={values.deadline}
						min={new Date().toISOString().slice(0, 10)}
						onChange={(e) => set("deadline", e.target.value)}
						onBlur={() => setTouched(true)}
						className="mt-2 h-10 rounded-xl shadow-xs"
					/>
					<FieldHint error={errors.deadline} />
				</div>
				<div data-invalid={Boolean(errors.duration)}>
					<Label htmlFor={durationId}>Duration</Label>
					<Input
						id={durationId}
						value={values.duration}
						onChange={(e) => set("duration", e.target.value)}
						onBlur={() => setTouched(true)}
						placeholder="1 week"
						maxLength={60}
						className="mt-2 h-10 rounded-xl shadow-xs"
					/>
					<FieldHint
						error={errors.duration}
						hint="e.g. 1 week, 2–3 weeks, 1 month."
					/>
				</div>
			</div>

			<div data-invalid={Boolean(errors.experienceLevel)}>
				<Label htmlFor={levelId} className="inline-flex items-center gap-1.5">
					<Gauge className="size-4 text-primary" />
					Experience level
				</Label>
				<div className="mt-2 grid grid-cols-3 gap-2">
					{EXPERIENCE_LEVELS.map((level) => {
						const active = values.experienceLevel === level;
						return (
							<button
								key={level}
								type="button"
								aria-pressed={active}
								onClick={() => set("experienceLevel", level)}
								className={cn(
									"rounded-xl border px-3 py-2.5 text-xs font-semibold tracking-wide uppercase transition-all focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
									active
										? "border-primary/40 bg-primary text-primary-foreground shadow-xs"
										: "border-border bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground",
								)}
							>
								{level.charAt(0) + level.slice(1).toLowerCase()}
							</button>
						);
					})}
				</div>
				<select
					id={levelId}
					value={values.experienceLevel}
					onChange={(e) =>
						set(
							"experienceLevel",
							e.target.value as JobFormValues["experienceLevel"],
						)
					}
					className="sr-only"
					aria-hidden
					tabIndex={-1}
				>
					{EXPERIENCE_LEVELS.map((l) => (
						<option key={l} value={l}>
							{l}
						</option>
					))}
				</select>
				<FieldHint error={errors.experienceLevel} />
			</div>

			{serverError && (
				<p
					role="alert"
					className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
				>
					{serverError}
				</p>
			)}

			<Separator />
			<div className="flex items-center justify-between gap-3">
				<p className="hidden text-xs text-muted-foreground sm:block">
					{invalid
						? "Finish the highlighted fields to post."
						: "Looks good — ready to post."}
				</p>
				<Button
					type="submit"
					disabled={pending}
					size="lg"
					className="w-full sm:w-auto"
				>
					{pending ? (
						<span className="inline-flex items-center gap-2">
							<span
								aria-hidden
								className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
							/>
							{pendingLabel}
						</span>
					) : (
						submitLabel
					)}
				</Button>
			</div>
		</form>
	);
}

/* ------------------------------------------------------------------ *
 * Wired dialog (edit — create lives at /dashboard/client/jobs/new)
 * ------------------------------------------------------------------ */

export function EditJobDialog({
	open,
	onClose,
	job,
}: {
	open: boolean;
	onClose: () => void;
	job: DetailJob;
}) {
	const update = useUpdateJob(job.id);
	const [serverError, setServerError] = useState<string | null>(null);

	// Memoized so the form keeps a stable `initial` across mutation
	// re-renders; the `key` below remounts the form per job revision.
	const initial = useMemo(() => defaultValues(job), [job]);

	function handleClose() {
		update.reset();
		setServerError(null);
		onClose();
	}

	return (
		<JobModal
			open={open}
			onClose={handleClose}
			wide
			title="Edit job"
			description="Everything freelancers see — keep scope, budget and timing honest."
			icon={<Briefcase className="size-5 text-primary" />}
		>
			<JobForm
				key={`${job.id}-${job.updatedAt ?? "new"}`}
				initial={initial}
				submitLabel="Save changes"
				pendingLabel="Saving…"
				pending={update.isPending}
				serverError={serverError}
				onSubmit={(payload) => {
					setServerError(null);
					update.mutate(payload, {
						onSuccess: () => {
							toast.success("Job updated.");
							handleClose();
						},
						onError: (error) => {
							setServerError(
								getErrorMessage(error, "Could not save changes. Try again."),
							);
						},
					});
				}}
			/>
		</JobModal>
	);
}

export function NewJobButton({
	onClick,
	className,
	label = "New job",
}: {
	onClick: () => void;
	className?: string;
	label?: string;
}) {
	return (
		<Button
			type="button"
			size="lg"
			onClick={onClick}
			className={cn("shadow-xs", className)}
		>
			<Plus className="size-4" data-icon="inline-start" />
			{label}
		</Button>
	);
}
