"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
	ArrowRight,
	Star,
	CheckCircle,
	ShieldCheck,
	Lightning,
	MagnifyingGlass,
	MapPin,
	Briefcase,
	Palette,
	Code,
	Megaphone,
	PenNib,
	ChartLineUp,
	VideoCamera,
	Headset,
	CaretDown,
	Plus,
	Minus,
} from "@phosphor-icons/react";

const CATEGORIES = [
	{ icon: Code, name: "Development" },
	{ icon: Palette, name: "Design" },
	{ icon: Megaphone, name: "Marketing" },
	{ icon: PenNib, name: "Writing" },
	{
		icon: VideoCamera,
		name: "Video & Motion",
	},
	{ icon: ChartLineUp, name: "Data & AI" },
];

const TALENT_PILLARS = [
	{
		title: "Reviewed craft",
		desc: "Portfolios and past work reviewed by a human, not just a form.",
		tags: ["Portfolio review", "References", "Work history"],
		initials: "RC",
	},
	{
		title: "Paid trial task",
		desc: "Start with a small scoped task before committing to a full project.",
		tags: ["Scoped trial", "Clear rates", "Defined timeline"],
		initials: "PT",
	},
	{
		title: "Ongoing quality",
		desc: "Milestones, revisions and IP transfer built into every project.",
		tags: ["Milestones", "Revisions", "IP transfer"],
		initials: "OQ",
	},
];

const FAQS = [
	{
		q: "How is WorkMatch different from Upwork or Fiverr?",
		a: "No bidding wars and no endless scrolling. Every expert is vetted, and matching is based on skills, timezone, budget and work style — so you see a small set of strong fits instead of hundreds of maybes. Payments, contracts and QA are built in.",
	},
	{
		q: "How fast can I hire?",
		a: "Post a job in 2 minutes, review curated matches, and start with a paid trial task before committing to the full project.",
	},
	{
		q: "How do payments and protection work?",
		a: "Funds sit in escrow and release on milestones you approve. Every project includes revision cover, IP transfer on payment, and a 14-day quality guarantee. No hidden marketplace fees for clients on Scale plans.",
	},
	{
		q: "How do I become a vetted expert?",
		a: "Apply with a portfolio, pass a live craft review and a paid test project. Top experts keep 100% of their rate on Pro — we monetize on the client side, not your craft.",
	},
];

function SectionBadge({ children }: { children: React.ReactNode }) {
	return (
		<span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
			<span className="size-1.5 rounded-full bg-primary" />
			{children}
		</span>
	);
}

export default function Home() {
	const [query, setQuery] = useState("");
	const [openFaq, setOpenFaq] = useState<number | null>(0);
	const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

	return (
		<div
			id="top"
			className="min-h-full bg-background font-sans text-foreground"
		>
			<div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
				<div className="absolute inset-x-0 top-0 mx-auto h-160 max-w-5xl rounded-b-[4rem] bg-linear-to-b from-secondary/60 via-secondary/20 to-transparent" />
				<div className="absolute top-24 left-1/2 h-72 w-2xl -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
			</div>

			<section className="mx-auto max-w-5xl px-5 pt-36 text-center sm:pt-44">
				<h1
					className="animate-rise mx-auto mt-7 max-w-3xl text-[2.75rem] leading-[1.02] font-bold tracking-[-0.04em] text-balance sm:text-6xl md:text-7xl"
					style={{ animationDelay: "80ms" }}
				>
					Hire vetted experts, <br className="hidden sm:block" />
					<span className="relative inline-block text-primary">
						matched in hours
						<svg

							viewBox="0 0 320 14"
							className="absolute -bottom-2 left-0 w-full text-secondary"
							fill="none"
						>
							<path
								d="M4 10C80 3 220 3 316 8"
								stroke="currentColor"
								strokeWidth="7"
								strokeLinecap="round"
							/>
						</svg>
					</span>
					, not weeks.
				</h1>

				<p
					className="animate-rise mx-auto mt-7 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
					style={{ animationDelay: "160ms" }}
				>
					WorkMatch is the high-trust marketplace where vetted freelancers
					meet serious teams. Post a brief, get curated matches, pay
					safely in escrow.
				</p>

				<div
					className="animate-rise mx-auto mt-9 max-w-2xl"
					style={{ animationDelay: "240ms" }}
				>
					<div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-[0_20px_60px_-24px_oklch(0.43_0.04_42/0.4)] transition-all duration-500 ease-snappy sm:rounded-full">
						<div className="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
							<MagnifyingGlass className="size-5" weight="bold" />
						</div>
						<input
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Try “SaaS dashboard designer” or “Next.js + AI”…"
							className="w-full bg-transparent text-sm text-foreground outline-none sm:text-[15px]"
						/>
						<button type="button" className="group hidden shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-500 ease-snappy hover:bg-primary/90 active:scale-[0.97] sm:inline-flex">
							Find talent
							<ArrowRight className="size-4 transition-transform duration-500 ease-spring group-hover:translate-x-1" />
						</button>
					</div>
					<div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[13px]">
						<span className="text-muted-foreground">Popular:</span>
						{[
							"Logo + brand kit",
							"Landing page",
							"AI chatbot",
							"Pitch deck",
						].map((t) => (
							<button
								type="button"
								key={t}
								onClick={() => setQuery(t)}
								className="rounded-full border border-border bg-card px-3.5 py-1.5 font-medium text-foreground transition-all duration-300 ease-snappy hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary hover:text-secondary-foreground hover:shadow-md"
							>
								{t}
							</button>
						))}
					</div>
				</div>

				<div
					className="animate-rise mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row"
					style={{ animationDelay: "320ms" }}
				>
					<div className="flex items-center gap-2 text-sm">
						<span className="flex gap-0.5 text-primary">
							{Array.from({ length: 5 }).map((_, i) => (
								<Star key={i} weight="fill" className="size-4" />
							))}
						</span>
						<span className="text-muted-foreground">
							Vetted talent · Escrow-protected payments
						</span>
					</div>
				</div>

				<div
					className="animate-rise relative mx-auto mt-14 max-w-4xl"
					style={{ animationDelay: "400ms" }}
				>
					<div
						className="absolute -inset-4 rounded-[2.5rem] bg-linear-to-b from-secondary/50 to-transparent blur-2xl"
						aria-hidden
					/>
					<div className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card text-left shadow-[0_40px_100px_-40px_oklch(0.43_0.04_42/0.5)] sm:rounded-4xl">
						<div className="flex items-center justify-between border-b border-border bg-muted/50 px-5 py-3">
							<div className="flex gap-1.5">
								<span className="size-2.5 rounded-full bg-border" />
								<span className="size-2.5 rounded-full bg-secondary" />
								<span className="size-2.5 rounded-full bg-primary/60" />
							</div>
							<div className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground sm:flex">
								<ShieldCheck className="size-3.5 text-primary" weight="fill" />
								Escrow protected · workmatch.io
							</div>
							<div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
								<Lightning weight="fill" className="size-3.5" /> 3 matches ready
							</div>
						</div>

						<div className="grid gap-0 md:grid-cols-[1fr_280px]">
							<div className="border-b border-border p-5 sm:p-7 md:border-r md:border-b-0">
								<div className="flex items-center justify-between">
									<p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
										Your brief
									</p>
									<span className="rounded-full bg-secondary/60 px-2.5 py-1 text-[11px] font-bold text-secondary-foreground">
										98% match
									</span>
								</div>
								<h3 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
									SaaS analytics dashboard — React + charts
								</h3>
								<div className="mt-3 flex flex-wrap gap-2 text-xs">
									{["$4.5k fixed", "3 weeks", "Remote · CET ±3h"].map((t) => (
										<span
											key={t}
											className="rounded-full border border-border bg-background px-3 py-1 font-medium text-muted-foreground"
										>
											{t}
										</span>
									))}
								</div>
								<div className="mt-5 space-y-3">
									{[
										{ n: "Jonas W.", s: "Next.js · 6 yrs · 4.9★", m: 98 },
										{ n: "Priya S.", s: "Dashboards · d3 · 5.0★", m: 96 },
										{ n: "Leo M.", s: "Full-stack · Postgres · 4.8★", m: 94 },
									].map((r) => (
										<div
											key={r.n}
											className="group flex items-center gap-3 rounded-2xl border border-border bg-background p-3 transition-all duration-500 ease-snappy hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
										>
											<span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">
												{r.n
													.split(" ")
													.map((w) => w[0])
													.join("")}
											</span>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-bold">{r.n}</p>
												<p className="truncate text-xs text-muted-foreground">
													{r.s}
												</p>
												<div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
													<div
														className="h-full rounded-full bg-primary transition-all duration-1000 ease-snappy"
														style={{ width: `${r.m}%` }}
													/>
												</div>
											</div>
											<span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
												{r.m}%
											</span>
										</div>
									))}
								</div>
							</div>
							<div className="bg-muted/40 p-5 sm:p-6">
								<p className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
									Protected payment
								</p>
								<p className="mt-3 text-3xl font-bold tracking-tight">$4,500</p>
								<p className="text-xs text-muted-foreground">held in escrow</p>
								<div className="mt-4 space-y-2.5 text-[13px]">
									{[
										["Milestone 1 · Wireframes", "$1,200", true],
										["Milestone 2 · Build", "$2,100", true],
										["Milestone 3 · Polish + QA", "$1,200", false],
									].map(([t, v, done]) => (
										<div
											key={t as string}
											className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2"
										>
											<span className="flex items-center gap-2 font-medium">
												<CheckCircle
													weight="fill"
													className={cn(
														"size-4",
														done ? "text-primary" : "text-border",
													)}
												/>
												{t}
											</span>
											<span className="font-bold">{v}</span>
										</div>
									))}
								</div>
								<button type="button" className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-transform duration-500 ease-spring hover:scale-[1.02] active:scale-[0.98]">
									Approve & release
								</button>
								<p className="mt-2 text-center text-[11px] text-muted-foreground">
									14-day quality guarantee included
								</p>
							</div>
						</div>
					</div>



				</div>
			</section>

			<section
				id="marketplace"
				className="mx-auto mt-24 max-w-5xl scroll-mt-28 px-5"
			>
				<div className="rounded-4xl border border-border bg-card px-6 py-12 text-center shadow-[0_30px_80px_-50px_oklch(0_0_0/0.3)] sm:rounded-[2.5rem] sm:px-12 sm:py-16">
					<SectionBadge>Marketplace</SectionBadge>
					<h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance sm:text-5xl">
						One island for every skill your roadmap needs
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
						Browse live availability, verified rates and match scores. Every
						category is curated — no spam, no fake portfolios.
					</p>
					<div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
						{CATEGORIES.map((c) => (
							<a
								key={c.name}
								href="#talent"
								className="group rounded-2xl border border-border bg-background p-5 text-left transition-all duration-500 ease-snappy hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_20px_40px_-20px_oklch(0.43_0.04_42/0.5)]"
							>
								<span className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground transition-transform duration-500 ease-spring group-hover:scale-110 group-hover:-rotate-6">
									<c.icon className="size-5" weight="duotone" />
								</span>
								<p className="mt-4 text-[15px] font-bold">{c.name}</p>
							</a>
						))}
					</div>
				</div>
			</section>

			<section
				id="how"
				className="mx-auto mt-24 max-w-4xl scroll-mt-28 px-5 text-center"
			>
				<SectionBadge>How it works</SectionBadge>
				<h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance sm:text-5xl">
					From brief to kickoff in three steps
				</h2>
				<div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
					{[
						{
							n: "01",
							t: "Post your brief",
							d: "Two minutes. Budget, timeline, skills — our AI sharpens it into a hirable spec.",
							icon: PenNib,
						},
						{
							n: "02",
							t: "Meet 3 curated matches",
							d: "No bidding. We review vetted experts and hand you a shortlist with rates and availability.",
							icon: Lightning,
						},
						{
							n: "03",
							t: "Pay safely in escrow",
							d: "Milestones, IP transfer and a 14-day guarantee. Release funds only when you love it.",
							icon: ShieldCheck,
						},
					].map((s) => (
						<div
							key={s.n}
							className="group rounded-3xl border border-border bg-card p-6 transition-all duration-500 ease-snappy hover:-translate-y-1.5 hover:shadow-xl"
						>
							<div className="flex items-center justify-between">
								<span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground transition-transform duration-500 ease-spring group-hover:scale-110">
									<s.icon className="size-5" weight="duotone" />
								</span>
								<span className="text-sm font-bold text-border transition-colors duration-300 group-hover:text-secondary-foreground/40">
									{s.n}
								</span>
							</div>
							<h3 className="mt-5 text-lg font-bold tracking-tight">{s.t}</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{s.d}
							</p>
						</div>
					))}
				</div>
			</section>

			<section
				id="talent"
				className="mx-auto mt-24 max-w-5xl scroll-mt-28 px-5 text-center"
			>
				<SectionBadge>Top talent</SectionBadge>
				<h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance sm:text-5xl">
					Work with experts who take craft seriously
				</h2>
				<p className="mx-auto mt-4 max-w-xl text-muted-foreground">
					Every expert is vetted. Every project includes clear rates,
					availability and revision cover.
				</p>
				<div className="mt-10 grid gap-4 text-left md:grid-cols-3">
					{TALENT_PILLARS.map((t) => (
						<article
							key={t.title}
							className="group rounded-3xl border border-border bg-card p-6 transition-all duration-500 ease-snappy hover:-translate-y-2 hover:shadow-[0_30px_60px_-30px_oklch(0.43_0.04_42/0.45)]"
						>
							<div className="flex items-start justify-between">
								<span className="grid size-14 place-items-center rounded-2xl bg-secondary text-lg font-bold text-secondary-foreground">
									{t.initials}
								</span>
							</div>
							<h3 className="mt-4 text-lg font-bold">{t.title}</h3>
							<p className="text-sm text-muted-foreground">{t.desc}</p>
							<div className="mt-4 flex flex-wrap gap-1.5">
								{t.tags.map((tag) => (
									<span
										key={tag}
										className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground"
									>
										{tag}
									</span>
								))}
							</div>

						</article>
					))}
				</div>
				<a
					href="/dashboard/client/jobs/new"
					className="group mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary"
				>
					Post a brief to get matched
					<ArrowRight className="size-4 transition-transform duration-500 ease-spring group-hover:translate-x-1.5" />
				</a>
			</section>

			<section className="mx-auto mt-24 max-w-5xl px-5">
				<div className="relative overflow-hidden rounded-4xl bg-primary px-6 py-14 text-center text-primary-foreground sm:rounded-[2.5rem] sm:px-12">
					<div
						aria-hidden
						className="absolute -top-24 left-1/2 h-64 w-xl -translate-x-1/2 rounded-full bg-white/10 blur-[80px]"
					/>
					<p className="text-xs font-bold tracking-[0.2em] uppercase opacity-70">
						Why teams switch
					</p>
					<h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance sm:text-5xl">
						Built for trust, not bidding wars
					</h2>
					<div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
						{[
							["Curated matches", "a shortlist, not endless scrolling"],
							["Escrow protection", "funds release on approval"],
							["Human review", "craft checked by people"],
							["Clear ownership", "IP transfer on payment"],
						].map(([v, l]) => (
							<div key={v}>
								<p className="text-xl font-bold tracking-tight sm:text-2xl">
									{v}
								</p>
								<p className="mt-1 text-[13px] opacity-70">{l}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section
				id="pricing"
				className="mx-auto mt-24 max-w-5xl scroll-mt-28 px-5 text-center"
			>
				<SectionBadge>Pricing</SectionBadge>
				<h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance sm:text-5xl">
					Simple pricing that scales with you
				</h2>
				<div className="mt-6 inline-flex rounded-full border border-border bg-card p-1 text-sm font-semibold">
					{(["monthly", "yearly"] as const).map((b) => (
						<button
							type="button"
							key={b}
							onClick={() => setBilling(b)}
							className={cn(
								"rounded-full px-5 py-2 capitalize transition-all duration-500 ease-snappy",
								billing === b
									? "bg-primary text-primary-foreground shadow"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{b}
							{b === "yearly" && " · −20%"}
						</button>
					))}
				</div>

				<div className="mx-auto mt-8 grid max-w-4xl gap-4 text-left md:grid-cols-3">
					{[
						{
							name: "Pay per hire",
							price: billing === "monthly" ? "$0" : "$0",
							per: " + 5% per hire",
							desc: "For trying WorkMatch on a single project.",
							feats: [
								"3 curated matches",
								"Escrow + IP transfer",
								"14-day guarantee",
							],
							cta: "Post a job free",
							href: "/dashboard/client/jobs/new",
							hot: false,
						},
						{
							name: "Scale",
							price: billing === "monthly" ? "$149" : "$119",
							per: "/mo · 0% hire fees",
							desc: "For teams hiring monthly. Our most loved plan.",
							feats: [
								"Unlimited briefs + priority matching",
								"Dedicated hiring concierge",
								"Team seats + approvals",
								"Advanced QA + revisions",
							],
							cta: "Start 14-day trial",
							href: "/signup",
							hot: true,
						},
						{
							name: "Enterprise",
							price: "Custom",
							per: " · SSO + MSA",
							desc: "For orgs with compliance and volume needs.",
							feats: [
								"Private talent pools",
								"SSO, SOC2 + custom DPA",
								"Procurement + invoicing",
								"SLA + success manager",
							],
							cta: "Talk to sales",
							href: "/contact",
							hot: false,
						},
					].map((p) => (
						<div
							key={p.name}
							className={cn(
								"relative rounded-3xl border p-7 transition-all duration-500 ease-snappy hover:-translate-y-1.5",
								p.hot
									? "border-primary/50 bg-primary text-primary-foreground shadow-[0_30px_70px_-30px_oklch(0.43_0.04_42/0.7)]"
									: "border-border bg-card hover:shadow-xl",
							)}
						>
							{p.hot && (
								<span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold whitespace-nowrap text-secondary-foreground">
									MOST POPULAR
								</span>
							)}
							<h3 className="text-sm font-bold tracking-wide uppercase opacity-70">
								{p.name}
							</h3>
							<p className="mt-3 text-4xl font-bold tracking-tight">
								{p.price}
								<span className="text-sm font-medium opacity-70">{p.per}</span>
							</p>
							<p
								className={cn(
									"mt-2 text-sm",
									p.hot ? "opacity-80" : "text-muted-foreground",
								)}
							>
								{p.desc}
							</p>
							<ul className="mt-5 space-y-2.5 text-sm">
								{p.feats.map((f) => (
									<li key={f} className="flex items-start gap-2">
										<CheckCircle
											weight="fill"
											className={cn(
												"mt-0.5 size-4 shrink-0",
												p.hot ? "" : "text-primary",
											)}
										/>
										{f}
									</li>
								))}
							</ul>
							<a
								href={p.href}
								className={cn(
									"mt-6 block w-full rounded-xl py-3 text-center text-sm font-bold transition-transform duration-500 ease-spring hover:scale-[1.02] active:scale-[0.98]",
									p.hot
										? "bg-primary-foreground text-primary"
										: "bg-primary text-primary-foreground",
								)}
							>
								{p.cta}
							</a>
						</div>
					))}
				</div>
			</section>

			<section className="mx-auto mt-24 max-w-2xl px-5 text-center">
				<SectionBadge>FAQ</SectionBadge>
				<h2 className="mt-5 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
					Questions, answered
				</h2>
				<div className="mt-8 space-y-3 text-left">
					{FAQS.map((f, i) => {
						const open = openFaq === i;
						return (
							<div
								key={f.q}
								className={cn(
									"overflow-hidden rounded-2xl border transition-all duration-500 ease-snappy",
									open
										? "border-primary/40 bg-card shadow-lg"
										: "border-border bg-card",
								)}
							>
								<button
									type="button"
									onClick={() => setOpenFaq(open ? null : i)}
									className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-bold"
								>
									{f.q}
									<span
										className={cn(
											"grid size-8 shrink-0 place-items-center rounded-full transition-all duration-500 ease-spring",
											open
												? "rotate-180 bg-primary text-primary-foreground"
												: "bg-muted text-foreground",
										)}
									>
										{open ? (
											<Minus className="size-4" />
										) : (
											<Plus className="size-4" />
										)}
									</span>
								</button>
								<div
									className={cn(
										"grid transition-all duration-500 ease-snappy",
										open
											? "grid-rows-[1fr] opacity-100"
											: "grid-rows-[0fr] opacity-0",
									)}
								>
									<div className="overflow-hidden">
										<p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
											{f.a}
										</p>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			<section id="cta" className="mx-auto mt-24 max-w-5xl scroll-mt-28 px-5">
				<div className="relative overflow-hidden rounded-4xl border border-border bg-secondary px-6 py-16 text-center text-secondary-foreground sm:rounded-[2.5rem] sm:px-12">
					<div
						className="absolute inset-x-0 top-0 mx-auto h-40 w-120 rounded-full bg-white/40 blur-[80px]"
						aria-hidden
					/>
					<Briefcase weight="duotone" className="mx-auto size-12" />
					<h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold tracking-[-0.03em] text-balance sm:text-5xl">
						Post your brief today. Meet your match tomorrow.
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-[15px] opacity-80 sm:text-base">
						Free to post — pay only when you hire someone you love.
					</p>
					<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
						<a
							href="/dashboard/client/jobs/new"
							className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-xl transition-transform duration-500 ease-spring hover:scale-[1.04] active:scale-[0.98]"
						>
							Post a job — it’s free
							<ArrowRight className="size-4 transition-transform duration-500 ease-snappy group-hover:translate-x-1" />
						</a>
						<a
							href="#talent"
							className="inline-flex items-center gap-2 rounded-full border border-secondary-foreground/25 px-7 py-3.5 text-sm font-bold transition-all duration-500 ease-snappy hover:bg-secondary-foreground hover:text-secondary"
						>
							<MapPin className="size-4" /> Browse talent
						</a>
					</div>
					<p className="mt-5 flex items-center justify-center gap-1.5 text-xs font-medium opacity-70">
						<CaretDown className="hidden" />
						<ShieldCheck weight="fill" className="size-4" /> No hire, no fee ·
						14-day guarantee · Cancel anytime
					</p>
				</div>
			</section>

			<footer className="mx-auto mt-20 max-w-5xl px-5 pb-10">
				<div className="rounded-4xl border border-border bg-card px-6 py-10 sm:px-10">
					<div className="flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
						<div className="flex items-center gap-2.5">
							<span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
								<Briefcase weight="duotone" className="size-5" />
							</span>
							<span className="text-[17px] font-bold tracking-tight">
								WorkMatch
							</span>
						</div>
						<div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-muted-foreground">
							{[
								{ label: "Marketplace", href: "#marketplace" },
								{ label: "How it works", href: "#how" },
								{ label: "Talent", href: "#talent" },
								{ label: "Pricing", href: "#pricing" },
							].map((l) => (
								<a
									key={l.label}
									href={l.href}
									className="transition-colors hover:text-foreground"
								>
									{l.label}
								</a>
							))}
						</div>
					</div>
					<div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
						<p>© 2026 WorkMatch Inc. The vetted work marketplace.</p>
						<p className="flex gap-4">
							<a href="#top" className="hover:text-foreground">
								Privacy
							</a>
							<a href="#top" className="hover:text-foreground">
								Terms
							</a>
							<a href="#top" className="hover:text-foreground">
								Trust & Safety
							</a>
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
