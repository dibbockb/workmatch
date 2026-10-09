"use client";

import Link from "next/link";
import { DASHBOARD_HOME } from "@/components/landing/user-menu";
import { useMe } from "@/features/auth/queries";

export default function NotFoundActions() {
	const { data: user } = useMe();

	return (
		<div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
			<Link
				href="/"
				className="inline-flex justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90"
			>
				Back to home
			</Link>
			{user && (
				<Link
					href={DASHBOARD_HOME[user.role]}
					className="inline-flex justify-center rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-bold transition-colors hover:bg-secondary hover:text-secondary-foreground"
				>
					Go to dashboard
				</Link>
			)}
		</div>
	);
}
