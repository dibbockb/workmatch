import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "About | WorkMatch",
	description: "Learn what WorkMatch is and why we built it.",
};

export default function AboutPage() {
	return (
		<div className="min-h-full bg-background font-sans text-foreground">
			<main className="animate-rise mx-auto w-full max-w-3xl px-5 pt-32 pb-24">
				<h1 className="text-4xl font-bold tracking-[-0.03em]">
					About WorkMatch
				</h1>
				<p className="mt-4 text-muted-foreground">
					WorkMatch is a marketplace that connects clients with vetted
					freelancers. Clients post jobs, freelancers submit proposals, and both
					sides manage the work through a single dashboard.
				</p>

				<h2 className="mt-10 text-2xl font-semibold tracking-tight">
					Our mission
				</h2>
				<p className="mt-3 text-muted-foreground">
					We want hiring great freelance talent to feel as simple as posting a
					job and reading a few proposals &mdash; no endless back-and-forth, no
					guesswork on who&apos;s actually available.
				</p>

				<h2 className="mt-10 text-2xl font-semibold tracking-tight">
					How it works
				</h2>
				<ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground">
					<li>A client posts a job with scope, budget, and timeline.</li>
					<li>Freelancers browse open jobs and submit proposals.</li>
					<li>The client reviews proposals and starts a contract.</li>
					<li>
						Work happens, payment is handled securely through the platform.
					</li>
				</ol>

				<h2 className="mt-10 text-2xl font-semibold tracking-tight">
					Who we are
				</h2>
				<p className="mt-3 text-muted-foreground">
					WorkMatch is an independent project built to make freelance hiring
					straightforward for small teams and solo clients alike.
				</p>

				<h2 className="mt-10 text-2xl font-semibold tracking-tight">Founder</h2>
				<p className="mt-3 text-muted-foreground">
					WorkMatch is founded by Dibbo Chakraborty. A self-taught dev who is
					inclined towards solving complex business problems. Contact :{" "}
					<a
						href="mailto:dibbo@dibbockb.com"
						className="text-primary underline underline-offset-2"
					>
						dibbo@dibbockb.com
					</a>
				</p>
			</main>
		</div>
	);
}
