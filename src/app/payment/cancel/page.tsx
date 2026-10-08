"use client";

import { ArrowRight, Prohibit } from "@phosphor-icons/react";
import Link from "next/link";

export default function PaymentCancelPage() {
	return (
		<main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
			<div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute -top-32 left-1/2 h-96 w-2xl -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
				<div className="absolute -bottom-40 left-[8%] size-96 rounded-full bg-secondary/50 blur-3xl" />
			</div>
			<div className="mx-auto flex w-full max-w-md flex-col items-center rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-xs animate-rise motion-reduce:animate-none">
				<span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
					<Prohibit className="size-5" />
				</span>
				<h1 className="mt-4 text-xl font-bold tracking-tight">
					Payment cancelled
				</h1>
				<p className="mt-1.5 max-w-xs text-sm text-balance text-muted-foreground">
					No charge was made and the proposal is still pending. You can complete
					payment whenever you&apos;re ready.
				</p>
				<div className="mt-6 flex flex-wrap justify-center gap-2">
					<Link
						href="/dashboard/client/proposals"
						className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-all hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						Back to proposals
					</Link>
					<Link
						href="/dashboard/client"
						className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
					>
						Go to dashboard
						<ArrowRight className="size-4" data-icon="inline-end" />
					</Link>
				</div>
			</div>
		</main>
	);
}
