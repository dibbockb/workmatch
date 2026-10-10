"use client";

import {
	ArrowCounterClockwise,
	House,
	WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";
import PageBackdrop from "@/components/shared/page-backdrop";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Route error boundary caught:", error);
	}, [error]);

	return (
		<div className="min-h-full bg-background font-sans text-foreground">
			<PageBackdrop />

			<main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 pt-32 pb-16">
				<div className="animate-rise rounded-4xl border border-border bg-card p-7 text-center shadow-[0_40px_100px_-40px_oklch(0.43_0.04_42/0.5)] motion-reduce:animate-none sm:p-9">
					<span className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
						<WarningCircle className="size-6" />
					</span>
					<h1 className="mt-4 text-2xl font-bold tracking-[-0.03em]">
						Something went wrong
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						The page hit an unexpected error. Your data is safe — try again, or
						head back home.
					</p>
					{process.env.NODE_ENV === "development" && (
						<p className="mt-3 truncate rounded-xl bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
							{error.digest ?? error.message}
						</p>
					)}
					<div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
						<button
							type="button"
							onClick={() => reset()}
							className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
						>
							<ArrowCounterClockwise className="size-4" />
							Try again
						</button>
						<Link
							href="/"
							className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-bold transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
						>
							<House className="size-4" />
							Back to home
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
