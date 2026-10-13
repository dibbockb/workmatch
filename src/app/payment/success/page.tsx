"use client";

import {
	ArrowRight,
	Briefcase,
	CheckCircle,
	CircleNotch,
	FileText,
	Receipt,
	ShieldCheck,
	Sparkle,
	Wallet,
	WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { useMyContracts } from "@/features/contracts/queries";
import { useVerifyPaymentSession } from "@/features/payments/queries";

const NEXT_STEPS = [
	{
		icon: FileText,
		title: "Contract is active",
		description: "Your agreement is signed and tracked in your dashboard.",
	},
	{
		icon: ShieldCheck,
		title: "Funds held in escrow",
		description: "Released to the freelancer only when milestones complete.",
	},
	{
		icon: Briefcase,
		title: "Work begins",
		description: "Your freelancer is notified and can start right away.",
	},
];

function toReference(sessionId: string) {
	return `WM-${sessionId.replace(/^cs_test_/, "").slice(0, 12).toUpperCase()}`;
}

function formatMoney(value: number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(value);
}

function formatDateTime(iso: string) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

function shortId(id: string, length = 8) {
	return id.length > length ? `${id.slice(0, length)}…` : id;
}

function ReceiptRow({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-4 py-2.5">
			<p className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
				{label}
			</p>
			<div className="min-w-0 text-right text-sm font-medium">{children}</div>
		</div>
	);
}

function SuccessSeal() {
	return (
		<span className="relative grid size-24 place-items-center sm:size-28">
			{/* ambient glow */}
			<span
				aria-hidden
				className="absolute inset-0 scale-150 rounded-full bg-primary/20 blur-3xl"
			/>
			{/* expanding rings */}
			<span
				aria-hidden
				className="animate-seal-ring absolute inset-0 rounded-full border border-primary/40"
			/>
			<span
				aria-hidden
				className="animate-seal-ring absolute inset-0 rounded-full border border-primary/30 [animation-delay:0.6s]"
			/>
			{/* seal */}
			<span className="animate-seal-pop relative grid size-24 place-items-center rounded-full bg-linear-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-[0_12px_40px_-8px_var(--color-emerald-500)] ring-4 ring-emerald-500/20 sm:size-28">
				<svg
					viewBox="0 0 24 24"
					fill="none"
					className="size-11 sm:size-12"
					aria-hidden
				>
					<path
						d="M4.5 12.75 10 18.25 19.5 6.75"
						stroke="white"
						strokeWidth={3}
						strokeLinecap="round"
						strokeLinejoin="round"
						className="animate-draw-check"
					/>
				</svg>
			</span>
		</span>
	);
}

function StatusCard({
	icon,
	iconTone,
	title,
	description,
	children,
}: {
	icon: React.ReactNode;
	iconTone?: "muted" | "danger";
	title: string;
	description: string;
	children?: React.ReactNode;
}) {
	return (
		<div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-xs animate-rise motion-reduce:animate-none">
			<span
				className={
					iconTone === "danger"
						? "grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive"
						: "grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground"
				}
			>
				{icon}
			</span>
			<h1 className="mt-4 text-xl font-bold tracking-tight">{title}</h1>
			<p className="mt-1.5 max-w-xs text-sm text-balance text-muted-foreground">
				{description}
			</p>
			{children}
		</div>
	);
}

function DashboardActions() {
	return (
		<div className="mt-6 flex flex-wrap justify-center gap-2">
			<Link
				href="/dashboard/client"
				className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
			>
				Go to dashboard
			</Link>
			<Link
				href="/contact"
				className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
			>
				Contact support
			</Link>
		</div>
	);
}

function PaymentSuccessInner() {
	const params = useSearchParams();
	const sessionId = params.get("session_id");
	const verification = useVerifyPaymentSession(sessionId);
	const toasted = useRef(false);

	const payment = verification.data?.data;
	const confirmed = payment?.status === "SUCCEEDED";
	const { data: contractsData } = useMyContracts();
	const contract = confirmed
		? contractsData?.data.find((c) => c.id === payment.contractId)
		: undefined;

	useEffect(() => {
		if (confirmed && !toasted.current) {
			toasted.current = true;
			toast.success("Payment successful", {});
		}
	}, [confirmed]);

	if (!sessionId) {
		return (
			<StatusCard
				icon={<Receipt className="size-5" />}
				title="Invalid payment link"
				description="This page needs a Stripe session reference. If you just paid, check your dashboard — your contract may already be active."
			>
				<DashboardActions />
			</StatusCard>
		);
	}

	// Still asking our backend whether this session really paid.
	if (verification.isPending || (verification.isFetching && !payment)) {
		return (
			<StatusCard
				icon={<CircleNotch className="size-5 animate-spin" />}
				title="Confirming your payment…"
				description="We're verifying this with our payment records. This usually takes a few seconds — don't close this tab."
			/>
		);
	}

	// Backend says no (unknown session, failed, or not yours). Never show
	// a success state for a payment we can't confirm.
	if (verification.isError) {
		return (
			<StatusCard
				icon={<WarningCircle className="size-5" />}
				iconTone="danger"
				title="We couldn't confirm this payment"
				description="We have no record of this checkout session. If money left your account, check your dashboard — or reach out and we'll sort it out."
			>
				<DashboardActions />
			</StatusCard>
		);
	}

	// Session exists but isn't paid yet (e.g. webhook still in flight).
	// We keep polling in the background; this fills the gap honestly.
	if (!confirmed) {
		return (
			<StatusCard
				icon={<CircleNotch className="size-5 animate-spin" />}
				title="Payment still processing…"
				description="Your checkout session is real but the payment hasn't cleared yet. This page will update automatically once it does."
			>
				<p className="mt-4 font-mono text-xs text-muted-foreground tabular-nums">
					{toReference(sessionId)}
				</p>
			</StatusCard>
		);
	}

	const reference = toReference(sessionId);

	return (
		<div className="mx-auto flex w-full max-w-xl flex-col items-center">
			<SuccessSeal />

			<p className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-[0.6875rem] font-semibold tracking-wider text-primary uppercase">
				<Sparkle className="size-3.5" />
				Payment confirmed
			</p>
			<h1 className="mt-3 text-center text-3xl font-bold tracking-tight text-balance sm:text-4xl">
				You&apos;re all set. Let the work begin.
			</h1>
			<p className="mt-2 max-w-md text-center text-sm text-balance text-muted-foreground sm:text-[0.9375rem]">
				Your payment cleared and the contract is now active. Stripe will email
				your receipt shortly.
			</p>

			<div className="mt-6 w-full rounded-2xl border border-border bg-card px-5 py-5 shadow-xs animate-rise motion-reduce:animate-none">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-center gap-3">
						<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/60 text-secondary-foreground ring-1 ring-black/5">
							<Wallet className="size-5" />
						</span>
						<div>
							<p className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
								Amount paid
							</p>
							<p className="text-3xl font-bold tracking-tight tabular-nums">
								{formatMoney(payment.amount)}
							</p>
						</div>
					</div>
					<span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[0.6875rem] font-semibold text-emerald-600 ring-1 ring-emerald-500/30 ring-inset dark:text-emerald-400">
						<CheckCircle className="size-3.5" />
						Paid
					</span>
				</div>
				{(contract?.job?.title || contract?.freelancer?.name) && (
					<p className="mt-2 max-w-full truncate text-sm text-muted-foreground">
						{contract?.job?.title}
						{contract?.job?.title && contract?.freelancer?.name && " · "}
						{contract?.freelancer?.name}
					</p>
				)}
				<Separator className="my-3" />
				<div className="divide-y divide-border/60">
					<ReceiptRow label="Date paid">
						<span className="tabular-nums">
							{formatDateTime(payment.updatedAt)}
						</span>
					</ReceiptRow>
					<ReceiptRow label="Contract">
						<Link
							href="/dashboard/client/contracts"
							title={payment.contractId}
							className="font-mono text-[13px] text-primary hover:underline"
						>
							{shortId(payment.contractId)}
						</Link>
					</ReceiptRow>
					<ReceiptRow label="Payment ID">
						<span title={payment.id} className="font-mono text-[13px]">
							{shortId(payment.id)}
						</span>
					</ReceiptRow>
					<ReceiptRow label="Reference">
						<span className="font-mono text-[13px] tabular-nums">
							{reference}
						</span>
					</ReceiptRow>
				</div>
			</div>

			{/* what happens next */}
			<div
				className="mt-4 w-full rounded-3xl border border-border bg-card p-6 shadow-xs animate-rise motion-reduce:animate-none sm:p-7"
				style={{ animationDelay: "120ms" }}
			>
				<h2 className="font-semibold tracking-tight">What happens next</h2>
				<ol className="mt-4 space-y-4">
					{NEXT_STEPS.map((step, i) => (
						<li key={step.title} className="flex gap-3.5">
							<span className="flex flex-col items-center">
								<span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary/60 text-secondary-foreground ring-1 ring-black/5">
									<step.icon className="size-4" />
								</span>
								{i < NEXT_STEPS.length - 1 && (
									<span aria-hidden className="mt-1.5 w-px flex-1 bg-border" />
								)}
							</span>
							<div className="pb-1">
								<p className="text-sm font-semibold">
									<span className="mr-1.5 text-muted-foreground tabular-nums">
										0{i + 1}
									</span>
									{step.title}
								</p>
								<p className="mt-0.5 text-sm text-muted-foreground">
									{step.description}
								</p>
							</div>
						</li>
					))}
				</ol>
				<Separator className="my-5" />
				<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
					<Link
						href="/dashboard/client/jobs"
						className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						View my jobs
					</Link>
					<Link
						href="/dashboard/client"
						className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						Back to dashboard
						<ArrowRight className="size-4" data-icon="inline-end" />
					</Link>
				</div>
			</div>

			<p className="mt-5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
				<ShieldCheck className="size-3.5 text-primary" />
				Protected by WorkMatch escrow · Full refund before work starts
			</p>
		</div>
	);
}

export default function PaymentSuccessPage() {
	return (
		<main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 pt-28 pb-12 sm:pt-36">
			{/* premium backdrop */}
			<div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-32 left-1/2 h-96 w-2xl -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
				<div className="absolute -bottom-40 left-[8%] size-96 rounded-full bg-secondary/50 blur-3xl" />
				<div className="absolute right-[6%] bottom-[12%] size-72 rounded-full bg-emerald-500/10 blur-3xl" />
			</div>
			<Suspense>
				<PaymentSuccessInner />
			</Suspense>
		</main>
	);
}
