import type { Metadata } from "next";
import PageBackdrop from "@/components/shared/page-backdrop";
import NotFoundActions from "@/components/shared/not-found";

export const metadata: Metadata = { title: "Page not found | WorkMatch" };

export default function NotFound() {
	return (
		<div className="min-h-full bg-background font-sans text-foreground">
			<PageBackdrop />

			<main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 pt-32 pb-16">
				<div className="animate-rise rounded-4xl border border-border bg-card p-7 text-center shadow-[0_40px_100px_-40px_oklch(0.43_0.04_42/0.5)] motion-reduce:animate-none sm:p-9">
					<p className="text-6xl font-bold tracking-[-0.04em] text-primary">
						404
					</p>
					<h1 className="mt-4 text-2xl font-bold tracking-[-0.03em]">
						Page not found
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						The link may be broken, or the page may have been moved.
					</p>
					<NotFoundActions />
				</div>
			</main>
		</div>
	);
}
