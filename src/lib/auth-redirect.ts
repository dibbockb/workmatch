import { useEffect, useState } from "react";

function getSafeNext(search: string): string | null {
	const next = new URLSearchParams(search).get("next");
	if (
		next &&
		next.startsWith("/") &&
		!next.startsWith("//") &&
		!next.startsWith("/\\")
	) {
		return next;
	}
	return null;
}
export function getNextPath(search: string): string {
	return getSafeNext(search) ?? "/dashboard";
}

export function useAuthSwitchHref(base: "/login" | "/signup"): string {
	const [href, setHref] = useState<string>(base);
	useEffect(() => {
		const next = getSafeNext(window.location.search);
		if (next) setHref(`${base}?next=${encodeURIComponent(next)}`);
	}, [base]);
	return href;
}
