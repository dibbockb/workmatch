"use client";

import { useEffect, useRef, useState } from "react";
import { Briefcase, List, X, ArrowRight, Sparkle } from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import AuthActions, { DASHBOARD_HOME } from "./user-menu";
import { useMe } from "@/features/auth/queries";

const LINKS = [
	{ label: "Marketplace", href: "#marketplace" },
	{ label: "Talent", href: "#talent" },
	{ label: "Pricing", href: "#pricing" },
	{ label: "About", href: "/about" },
	{ label: "Contact", href: "/contact" },
];

import { usePathname, useRouter } from "next/navigation";

function isPageRoute(href: string) {
	return href.startsWith("/");
}

function scrollToId(id: string) {
	document
		.getElementById(id)
		?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function HashLink({
	href,
	className,
	style,
	children,
	onNavigate,
}: {
	href: string;
	className?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
	onNavigate?: () => void;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const id = href.slice(1);

	return (
		<a
			href={href}
			className={className}
			style={style}
			onClick={(e) => {
				e.preventDefault();
				onNavigate?.();
				if (pathname === "/") {
					scrollToId(id);
				} else {
					// Off the homepage: go home first — Next jumps to the
					// anchor, and the persistent layout keeps this smooth.
					router.push(`/#${id}`);
				}
			}}
		>
			{children}
		</a>
	);
}

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [progress, setProgress] = useState(0);
	const [open, setOpen] = useState(false);
	const { data: user } = useMe();
	const pathname = usePathname();

	// The navbar outlives page navigations now — never trap the user
	// behind an open mobile menu from the previous page.
	const prevPath = useRef(pathname);
	useEffect(() => {
		if (prevPath.current !== pathname) {
			prevPath.current = pathname;
			setOpen(false);
		}
	});

	useEffect(() => {
		let raf = 0;
		const onScroll = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				const y = window.scrollY;
				setScrolled(y > 24);
				const max = document.documentElement.scrollHeight - window.innerHeight;
				setProgress(max > 0 ? Math.min(1, y / max) : 0);
			});
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			cancelAnimationFrame(raf);
		};
	}, []);

	return (
		<div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 sm:px-6">
			<div
				className={cn(
					"navbar-morph mx-auto w-full",
					scrolled ? "max-w-5xl" : "max-w-6xl",
				)}
			>
				<header
					className={cn(
						"navbar-morph pointer-events-auto relative w-full rounded-full border backdrop-blur-lg backdrop-saturate-100",
						scrolled
							? "mt-3 border-white/30 bg-card/65 py-2.5 pr-2.5 pl-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.35),0_16px_50px_-16px_oklch(0.43_0.04_42/0.45),0_2px_12px_-2px_oklch(0_0_0/0.12)] dark:border-white/10 dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.08),0_16px_50px_-16px_oklch(0_0_0/0.8)]"
							: "mt-4 border-white/25 bg-background/55 py-3 pr-3 pl-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.3),0_8px_30px_-18px_oklch(0_0_0/0.25)] dark:border-white/10 dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06),0_8px_30px_-18px_oklch(0_0_0/0.8)]",
					)}
				>
					<nav className="flex flex-nowrap items-center justify-between gap-2">
						<Link
							href="/"
							onClick={(event) => {
								if (window.location.pathname === "/") {
									event.preventDefault();
									window.scrollTo({ top: 0, behavior: "smooth" });
								}
							}}
							className="flex min-w-0 shrink-0 items-center gap-2.5"
						>
							<span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
								<Briefcase weight="duotone" className="size-5" />
							</span>
							<span className="text-[16px] font-bold whitespace-nowrap tracking-tight text-foreground">
								WorkMatch
							</span>
						</Link>

						<div
							className={cn(
								"navbar-morph hidden min-w-0 flex-nowrap items-center gap-1 lg:flex",
								scrolled
									? "rounded-full border border-white/25 bg-foreground/6 p-1 backdrop-blur-md dark:border-white/10"
									: "rounded-full border border-transparent bg-transparent p-1",
							)}
						>
							{LINKS.map((l) =>
								isPageRoute(l.href) ? (
									<Link
										key={l.label}
										href={l.href}
										className="rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-300 ease-snappy hover:bg-secondary hover:text-secondary-foreground"
									>
										{l.label}
									</Link>
								) : (
									<HashLink
										key={l.label}
										href={l.href}
										className="rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-300 ease-snappy hover:bg-secondary hover:text-secondary-foreground"
									>
										{l.label}
									</HashLink>
								),
							)}
						</div>

						<div className="flex shrink-0 flex-nowrap items-center gap-2">
							<ThemeToggle />
							<AuthActions></AuthActions>
							<button
								type="button"
								onClick={() => setOpen((v) => !v)}
								aria-label="Toggle menu"
								aria-expanded={open}
								className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition-transform duration-500 ease-spring active:scale-95 lg:hidden"
							>
								<span
									key={open ? "x" : "list"}
									className="grid place-items-center"
								>
									{open ? (
										<X className="size-4" />
									) : (
										<List className="size-4" />
									)}
								</span>
							</button>
						</div>
					</nav>

					<div className="pointer-events-none absolute inset-x-8 bottom-1 h-0.5 overflow-hidden rounded-full">
						<div
							className={cn(
								"h-full rounded-full bg-primary transition-opacity duration-500",
								scrolled ? "opacity-100" : "opacity-0",
							)}
							style={{ width: `${progress * 100}%` }}
						/>
					</div>
				</header>

				<div
					className={cn(
						"grid transition-all duration-500 ease-snappy lg:hidden",
						open
							? "mt-2 grid-rows-[1fr] opacity-100"
							: "mt-0 grid-rows-[0fr] opacity-0",
					)}
				>
					<div className="overflow-hidden">
						<div
							className={cn(
								"pointer-events-auto rounded-3xl border border-white/25 bg-card p-2 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.3),0_24px_60px_-24px_oklch(0.43_0.04_42/0.45)] transition-all duration-00 ease-snappy dark:border-border dark:shadow-[0_24px_60px_-24px_oklch(0_0_0/0.8)]",
								open
									? "translate-y-0 scale-100"
									: "pointer-events-none -translate-y-3 scale-[0.98]",
							)}
						>
							{LINKS.map((l, i) => {
								const linkClass = cn(
									"flex items-center justify-between rounded-2xl px-4 py-3 text-[15px] font-semibold text-foreground transition-all duration-300 ease-snappy hover:bg-secondary hover:text-secondary-foreground",
									open
										? "translate-y-0 opacity-100"
										: "-translate-y-2 opacity-0",
								);
								return isPageRoute(l.href) ? (
									<Link
										key={l.label}
										href={l.href}
										onClick={() => setOpen(false)}
										style={{ transitionDelay: open ? `${i * 60}ms` : "0ms" }}
										className={linkClass}
									>
										{l.label}
										<ArrowRight className="size-4 opacity-40" />
									</Link>
								) : (
									<HashLink
										key={l.label}
										href={l.href}
										onNavigate={() => setOpen(false)}
										style={{ transitionDelay: open ? `${i * 60}ms` : "0ms" }}
										className={linkClass}
									>
										{l.label}
										<ArrowRight className="size-4 opacity-40" />
									</HashLink>
								);
							})}

							{user ? (
								<Link
									href={DASHBOARD_HOME[user.role]}
									onClick={() => setOpen(false)}
									className="mt-1 flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
								>
									Go to dashboard
								</Link>
							) : (
								<Link
									href="/login"
									onClick={() => setOpen(false)}
									style={{
										transitionDelay: open ? `${LINKS.length * 40}ms` : "0ms",
									}}
									className={cn(
										"mt-1 flex items-center justify-center rounded-2xl bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground transition-all duration-500 ease-snappy sm:hidden",
										open
											? "translate-y-0 opacity-100"
											: "-translate-y-2 opacity-0",
									)}
								>
									Sign in
								</Link>
							)}

							<Link
								href="/signup"
								onClick={() => setOpen(false)}
								style={{
									transitionDelay: open
										? `${(LINKS.length + 1) * 40}ms`
										: "0ms",
								}}
								className={cn(
									"group mt-1 flex items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-500 ease-snappy sm:hidden",
									open
										? "translate-y-0 opacity-100"
										: "-translate-y-2 opacity-0",
								)}
							>
								<Sparkle weight="fill" className="size-4" />
								Post a job
								<ArrowRight className="size-4" />
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
