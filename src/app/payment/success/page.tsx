"use client";

import {
	ArrowRight,
	Briefcase,
	CheckCircle,
	FileText,
	Receipt,
	ShieldCheck,
	Sparkle,
	Wallet,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

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

function PaymentSuccessInner() {
	const params = useSearchParams();
	const sessionId = params.get("session_id");
	const toasted = useRef(false);

	useEffect(() => {
		if (sessionId && !toasted.current) {
			toasted.current = true;
			toast.success("Payment successful", {
				description: "Your contract is active and funds are in escrow.",
			});
		}
	}, [sessionId]);

	if (!sessionId) {
		return (
			<div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-xs animate-rise motion-reduce:animate-none">
				<span className="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
					<Receipt className="size-5" />
				</span>
				<h1 className="mt-4 text-xl font-bold tracking-tight">
					Invalid payment link
				</h1>
				<p className="mt-1.5 max-w-xs text-sm text-balance text-muted-foreground">
					This page needs a Stripe session reference. If you just paid, check
					your dashboard — your contract may already be active.
				</p>
				<div className="mt-6 flex flex-wrap justify-center gap-2">
					<Link
						href="/dashboard/client"
						className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						Go to dashboard
					</Link>
				</div>
			</div>
		);
	}

	const reference = `WM-${sessionId
		.replace(/^cs_test_/, "")
		.slice(0, 12)
		.toUpperCase()}`;

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

			{/* receipt strip */}
			<div className="mt-6 flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-xs animate-rise motion-reduce:animate-none">
				<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/60 text-secondary-foreground ring-1 ring-black/5">
					<Wallet className="size-5" />
				</span>
				<div className="min-w-0 flex-1">
					<p className="text-[0.6875rem] font-semibold tracking-wider text-muted-foreground uppercase">
						Payment reference
					</p>
					<p className="truncate font-mono text-sm font-semibold tabular-nums">
						{reference}
					</p>
				</div>
				<span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[0.6875rem] font-semibold text-emerald-600 ring-1 ring-emerald-500/30 ring-inset dark:text-emerald-400">
					<CheckCircle className="size-3.5" />
					Paid
				</span>
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
		<main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
			{/* premium backdrop */}
			<div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute top-[-8rem] left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
				<div className="absolute bottom-[-10rem] left-[8%] size-96 rounded-full bg-secondary/50 blur-3xl" />
				<div className="absolute right-[6%] bottom-[12%] size-72 rounded-full bg-emerald-500/10 blur-3xl" />
			</div>
			<Suspense>
				<PaymentSuccessInner />
			</Suspense>
		</main>
	);
}
