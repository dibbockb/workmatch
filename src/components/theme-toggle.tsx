"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		return (
			<span
				aria-hidden
				className={cn(
					"size-9 shrink-0 rounded-full border border-border bg-card",
					className,
				)}
			/>
		);
	}

	const isDark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			onClick={() => setTheme(isDark ? "light" : "dark")}
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			title={isDark ? "Switch to light mode" : "Switch to dark mode"}
			className={cn(
				"grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-xs",
				"transition-all duration-300 ease-snappy hover:border-primary/40 hover:text-primary active:scale-90",
				"focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
				className,
			)}
		>
			<span className="relative grid size-4 place-items-center">
				<Sun
					aria-hidden
					className={cn(
						"absolute size-4 transition-all duration-500 ease-spring",
						isDark
							? "rotate-90 scale-0 opacity-0"
							: "rotate-0 scale-100 opacity-100",
					)}
				/>
				<Moon
					aria-hidden
					className={cn(
						"absolute size-4 transition-all duration-500 ease-spring",
						isDark
							? "rotate-0 scale-100 opacity-100"
							: "-rotate-90 scale-0 opacity-0",
					)}
				/>
			</span>
		</button>
	);
}
