"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  List,
  X,
  ArrowRight,
  Sparkle,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Marketplace", href: "#marketplace" },
  { label: "How it works", href: "#how" },
  { label: "Talent", href: "#talent" },
  { label: "Pricing", href: "#pricing" },
  { label: "Stories", href: "#stories" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

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
      {/* Morph column: width animates 6xl -> 5xl on scroll, navbar + mobile island shrink together */}
      <div
        className={cn(
          "navbar-morph mx-auto w-full",
          scrolled ? "max-w-5xl" : "max-w-6xl"
        )}
      >
        <header
          className={cn(
            "navbar-morph pointer-events-auto relative w-full rounded-full border backdrop-blur-xl",
            scrolled
              ? "mt-3 border-border/80 bg-card/85 py-2.5 pr-2.5 pl-5 shadow-[0_16px_50px_-16px_oklch(0.43_0.04_42/0.45),0_2px_12px_-2px_oklch(0_0_0/0.12)]"
              : "mt-4 border-border/60 bg-background/70 py-3 pr-3 pl-5 shadow-[0_8px_30px_-18px_oklch(0_0_0/0.25)]"
          )}
        >
          <nav className="flex flex-nowrap items-center justify-between gap-2">
            {/* Logo — single line, fixed size */}
            <a
              href="#top"
              className="flex min-w-0 shrink-0 items-center gap-2.5"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Briefcase weight="duotone" className="size-5" />
              </span>
              <span className="text-[16px] font-bold whitespace-nowrap tracking-tight text-foreground">
                WorkMatch
              </span>
            </a>

            {/* Desktop links — fixed padding/type, never wraps */}
            <div
              className={cn(
                "navbar-morph hidden min-w-0 flex-nowrap items-center gap-1 lg:flex",
                scrolled
                  ? "rounded-full border border-border/70 bg-muted/70 p-1"
                  : "rounded-full border border-transparent bg-transparent p-1"
              )}
            >
              {LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-secondary hover:text-secondary-foreground"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="flex shrink-0 flex-nowrap items-center gap-2">
              <a
                href="#pricing"
                className="hidden rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                Sign in
              </a>
              <a
                href="#cta"
                className="group hidden shrink-0 items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold whitespace-nowrap text-primary-foreground shadow-[0_8px_20px_-10px_oklch(0.43_0.04_42/0.8)] transition-colors duration-300 hover:bg-primary/90 sm:inline-flex"
              >
                <Sparkle
                  weight="fill"
                  className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-90 group-hover:scale-125"
                />
                Post a job
                <ArrowRight className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
              </a>
              <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Toggle menu"
                aria-expanded={open}
                className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 lg:hidden"
              >
                <span
                  key={open ? "x" : "list"}
                  className="grid place-items-center"
                >
                  {open ? <X className="size-4" /> : <List className="size-4" />}
                </span>
              </button>
            </div>
          </nav>

          {/* Scroll progress — clipped inside the pill so it never affects layout */}
          <div className="pointer-events-none absolute inset-x-8 bottom-1 h-[2px] overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full bg-primary transition-opacity duration-500",
                scrolled ? "opacity-100" : "opacity-0"
              )}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </header>

        {/* Mobile menu — separate floaty island below the navbar, same morph ease.
            It never stretches the navbar itself, so the pill stays one line. */}
        <div
          className={cn(
            "grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
            open
              ? "mt-2 grid-rows-[1fr] opacity-100"
              : "mt-0 grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div
              className={cn(
                "pointer-events-auto rounded-3xl border border-border/80 bg-card/95 p-2 shadow-[0_24px_60px_-24px_oklch(0.43_0.04_42/0.45)] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                open
                  ? "translate-y-0 scale-100"
                  : "pointer-events-none -translate-y-3 scale-[0.98]"
              )}
            >
              {LINKS.map((l, i) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  style={{ transitionDelay: open ? `${i * 40}ms` : "0ms" }}
                  className={cn(
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-[15px] font-semibold text-foreground transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-secondary hover:text-secondary-foreground",
                    open
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-2 opacity-0"
                  )}
                >
                  {l.label}
                  <ArrowRight className="size-4 opacity-40" />
                </a>
              ))}
              <a
                href="#pricing"
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${LINKS.length * 40}ms` : "0ms" }}
                className={cn(
                  "mt-1 flex items-center justify-center rounded-2xl bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:hidden",
                  open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                )}
              >
                Sign in
              </a>
              <a
                href="#cta"
                onClick={() => setOpen(false)}
                style={{
                  transitionDelay: open ? `${(LINKS.length + 1) * 40}ms` : "0ms",
                }}
                className={cn(
                  "group mt-1 flex items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:hidden",
                  open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                )}
              >
                <Sparkle weight="fill" className="size-4" />
                Post a job — it’s free
                <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
