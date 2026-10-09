"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/landing/navbar";

const HIDDEN_PREFIXES = ["/dashboard"];

/** Global navbar — mounted once in the root layout so it never remounts
 *  (and never flashes) while moving between public pages. Dashboards bring
 *  their own sidebar shell, so it stays hidden there. */
export function SiteChrome() {
	const pathname = usePathname();
	if (
		HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
	) {
		return null;
	}
	return <Navbar />;
}
