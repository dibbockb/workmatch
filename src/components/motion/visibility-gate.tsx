"use client";

import { useEffect } from "react";

/**
 * Entrance animations (`.animate-rise`) only run while the tab is actually
 * visible. Without this, opening the site in a background tab burns through
 * every staggered animation before the user ever looks at it.
 */
export function VisibilityGate() {
	useEffect(() => {
		const sync = () => {
			document.documentElement.classList.toggle("tab-live", !document.hidden);
		};
		sync();
		document.addEventListener("visibilitychange", sync);
		window.addEventListener("pageshow", sync);
		return () => {
			document.removeEventListener("visibilitychange", sync);
			window.removeEventListener("pageshow", sync);
		};
	}, []);

	return null;
}
