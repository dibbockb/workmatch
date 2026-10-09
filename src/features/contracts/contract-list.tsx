"use client";

import {
	ArrowRight,
	CalendarBlank,
	CheckCircle,
	CurrencyDollar,
	Handshake,
	ShieldCheck,
	Timer,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogContent,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { HeaderStat, PageHeader } from "@/components/shared/page-header";
import {
	JobListSkeleton,
	JobsEmpty,
	JobsError,
	JobsSearch,
} from "@/features/jobs/job-list";
import { useMarkComplete, useMyContracts } from "@/features/contracts/queries";
import type { Contract } from "@/features/contracts/schemas";
import { ContractStatusBadge } from "@/features/contracts/status";
import { cn } from "@/lib/utils";

export type ContractRole = "CLIENT" | "FREELANCER";

function getErrorMessage(error: unknown, fallback: string) {
	if (error && typeof error === "object") {
		const withResponse = error as {
			response?: { _data?: { message?: unknown } };
			data?: { message?: unknown };
		};
		const fromResponse = withResponse.response?._data?.message;
		if (typeof fromResponse === "string" && fromResponse.trim()) {
			return fromResponse;
		}
		if (Array.isArray(fromResponse) && fromResponse.length > 0) {
			return String(fromResponse[0]);
		}
		const fromData = withResponse.data?.message;
		if (typeof fromData === "string" && fromData.trim()) return fromData;
		if (error instanceof Error && error.message) return error.message;
	}
	return fallback;
}

function formatDate(iso?: string | null) {
	if (!iso) return null;
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function money(n: number) {
	return `$${Number(n).toLocaleString()}`;
}

function paymentOf(contract: Contract) {
	const paid = contract.payments?.[0];
	if (paid) {
		return {
			amount: paid.amount,
			fee: paid.platformCommission,
			earns: paid.freelancerEarns,
			status: paid.status,
		};
	}
	const amount = contract.agreedPrice;
	const fee = Math.round(amount * 0.1 * 100) / 100;
	return { amount, fee, earns: amount - fee, status: null };
}

function PaymentChip({ status }: { status: string | null }) {
	if (status === "PENDING") {
		return (
			<span className="inline-flex shrink-0 items-center rounded-full bg-amber-500/10 px-2.5 py-1 text-[0.6875rem] leading-none font-semibold tracking-wider whitespace-nowrap text-amber-600 uppercase ring-1 ring-amber-500/30 ring-inset dark:text-amber-400">
				Payment pending
			</span>
		);
	}
	return (
		<span className="inline-flex shrink-0 items-center rounded-full bg-muted px-2.5 py-1 text-[0.6875rem] leading-none font-semibold tracking-wider whitespace-nowrap text-muted-foreground uppercase ring-1 ring-border ring-inset">
			{status ? status.charAt(0) + status.slice(1).toLowerCase() : "Unfunded"}
		</span>
	);
}

function MarkCompleteDialog({
	contract,
	open,
	onClose,
}: {
	contract: Contract | null;
	open: boolean;
	onClose: () => void;
}) {
	const complete = useMarkComplete();
	const [error, setError] = useState<string | null>(null);

	function close() {
		setError(null);
		complete.reset();
		onClose();
	}

	function confirm() {
		if (!contract) return;
		setError(null);
		complete.mutate(contract.id, {
			onSuccess: () => {
				toast.success("Contract completed.");
				close();
			},
			onError: (err) => {
				setError(
					getErrorMessage(err, "Could not complete the contract. Try again."),
				);
			},
		});
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next) close();
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Mark contract complete?</DialogTitle>
					<DialogDescription>
						Only confirm when you have reviewed and accepted the deliverables.
					</DialogDescription>
				</DialogHeader>
				<DialogBody className="flex flex-col gap-4">
					{contract && (
						<div className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm leading-relaxed">
							<p className="font-semibold">{contract.job?.title}</p>
							<p className="mt-0.5 text-muted-foreground">
								{money(contract.agreedPrice)} agreed ·{" "}
								{contract.freelancer?.name ?? "Freelancer"}
							</p>
						</div>
					)}
					<div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-relaxed text-foreground/90">
						Completing closes the <strong>contract and the job</strong>. The
						escrowed funds stay allocated to this agreement — this can&apos;t be
						undone.
					</div>
					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}
				</DialogBody>
				<DialogFooter className="border-t-0 p-6 pt-0">
					<Button type="button" variant="outline" onClick={close}>
						Not yet
					</Button>
					<Button type="button" disabled={complete.isPending} onClick={confirm}>
						{complete.isPending ? (
							<span className="inline-flex items-center gap-2">
								<span
									aria-hidden
									className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
								/>
								Completing…
							</span>
						) : (
							<>
								<CheckCircle className="size-4" data-icon="inline-start" />
								Mark complete
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ContractCard({
	contract,
	role,
	index,
	onComplete,
}: {
	contract: Contract;
	role: ContractRole;
	index: number;
	onComplete: () => void;
}) {
	const counterpart = role === "CLIENT" ? contract.freelancer : contract.client;
	const name =
		counterpart?.name ?? (role === "CLIENT" ? "Freelancer" : "Client");
	const initial = name.trim().charAt(0).toUpperCase() || "W";
	const payment = paymentOf(contract);
	const started = formatDate(contract.startDate ?? contract.createdAt);
	const ended = formatDate(contract.endDate);
	const active = contract.status === "ACTIVE";
	const canComplete =
		role === "CLIENT" && active && payment.status === "SUCCEEDED";
	const jobHref =
		role === "CLIENT"
			? `/dashboard/client/jobs/${contract.jobId}`
			: `/dashboard/freelancer/jobs/${contract.jobId}`;

	return (
		<li
			className="animate-rise motion-reduce:animate-none"
			style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
		>
			<article
				className={cn(
					"rounded-2xl border bg-card p-5 shadow-xs transition-colors",
					contract.status === "COMPLETED"
						? "border-violet-500/30"
						: "border-border hover:border-primary/30",
				)}
			>
				<div className="flex items-start gap-3">
					<span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
						{initial}
					</span>
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<p className="font-semibold tracking-tight">{name}</p>
							<ContractStatusBadge status={contract.status} />
						</div>
						<Link
							href={jobHref}
							className="mt-0.5 block truncate text-sm text-muted-foreground transition-colors hover:text-primary"
						>
							{contract.job?.title ?? "Contract job"}
						</Link>
					</div>
				</div>

				<div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
					<span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
						<CurrencyDollar className="size-4 text-primary" />
						{money(contract.agreedPrice)}
					</span>
					<span className="inline-flex items-center gap-1.5 text-muted-foreground">
						<Timer className="size-4" />
						<span className="font-medium text-foreground tabular-nums">
							{contract.agreedTimeline}
						</span>
						<span className="text-xs">
							{contract.agreedTimeline === 1 ? "day" : "days"}
						</span>
					</span>
					{started && (
						<span className="inline-flex items-center gap-1.5 text-muted-foreground">
							<CalendarBlank className="size-4" />
							<span className="text-xs">Started</span>
							<span className="font-medium text-foreground">{started}</span>
						</span>
					)}
					{ended && (
						<span className="inline-flex items-center gap-1.5 text-muted-foreground">
							<CheckCircle className="size-4" />
							<span className="text-xs">Ended</span>
							<span className="font-medium text-foreground">{ended}</span>
						</span>
					)}
				</div>

				<div className="mt-3 flex items-center gap-2 rounded-xl border border-border/70 bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
					<ShieldCheck className="size-4 shrink-0 text-primary" />
					<span className="tabular-nums">
						{role === "CLIENT" ? (
							<>
								You paid{" "}
								<strong className="text-foreground">
									{money(payment.amount)}
								</strong>
								{" · "}
								{money(payment.fee)} platform fee
								{" · "}
								{name} receives{" "}
								<strong className="text-foreground">
									{money(payment.earns)}
								</strong>
							</>
						) : (
							<>
								You earn{" "}
								<strong className="text-foreground">
									{money(payment.earns)}
								</strong>
								{" · "}
								{money(payment.fee)} platform fee
								{" · "}
								{name} paid{" "}
								<strong className="text-foreground">
									{money(payment.amount)}
								</strong>
							</>
						)}
					</span>
				</div>

				<div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
					<Link
						href={jobHref}
						className="inline-flex h-7 items-center gap-1 rounded-lg px-2.5 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
					>
						View job
						<ArrowRight className="size-3.5" />
					</Link>
					{canComplete && (
						<Button
							type="button"
							size="sm"
							onClick={onComplete}
							className="ml-auto shadow-xs"
						>
							<CheckCircle className="size-3.5" data-icon="inline-start" />
							Mark complete
						</Button>
					)}
				</div>
			</article>
		</li>
	);
}

const STATUS_TABS = ["ALL", "ACTIVE", "COMPLETED", "CANCELLED"] as const;

export function MyContractsView({ role }: { role: ContractRole }) {
	const router = useRouter();
	const params = useSearchParams();
	const rawStatus = params.get("status") ?? "ALL";
	const status = (STATUS_TABS as readonly string[]).includes(rawStatus)
		? rawStatus
		: "ALL";
	const search = params.get("search") ?? "";

	const [query, setQuery] = useState(search);
	useEffect(() => setQuery(search), [search]);

	const [completingId, setCompletingId] = useState<string | null>(null);

	const { data, isLoading, isError, isFetching, refetch } = useMyContracts();
	const contracts = useMemo(() => data?.data ?? [], [data]);

	const active = useMemo(
		() => contracts.filter((c) => c.status === "ACTIVE"),
		[contracts],
	);
	const activeValue = useMemo(
		() => active.reduce((sum, c) => sum + c.agreedPrice, 0),
		[active],
	);

	const visible = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return contracts.filter((c) => {
			if (status !== "ALL" && c.status !== status) return false;
			if (!needle) return true;
			const counterpart =
				role === "CLIENT" ? c.freelancer?.name : c.client?.name;
			return `${c.job?.title ?? ""} ${counterpart ?? ""}`
				.toLowerCase()
				.includes(needle);
		});
	}, [contracts, status, query, role]);

	function setParam(key: string, value: string) {
		const next = new URLSearchParams(params);
		value ? next.set(key, value) : next.delete(key);
		router.push(`?${next.toString()}`);
	}

	function onSearch(value: string) {
		setQuery(value);
		setParam("search", value);
	}

	const completing =
		completingId != null
			? (contracts.find((c) => c.id === completingId) ?? null)
			: null;

	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
			<PageHeader
				title="Contracts"
				description={
					role === "CLIENT"
						? "Agreements funded through escrow — mark them complete when deliverables land."
						: "Your signed agreements — deliver great work and earnings release on approval."
				}
				actions={
					<>
						<HeaderStat
							value={active.length}
							label={active.length === 1 ? "active" : "active"}
							loading={isLoading}
						/>
						<HeaderStat
							value={activeValue}
							label="USD in motion"
							loading={isLoading}
						/>
					</>
				}
			/>

			<div className="flex flex-col gap-3">
				<div
					role="tablist"
					aria-label="Filter by status"
					className="flex flex-wrap gap-1.5"
				>
					{STATUS_TABS.map((tab) => {
						const isActive = status === tab;
						return (
							<button
								key={tab}
								type="button"
								role="tab"
								aria-selected={isActive}
								onClick={() => setParam("status", tab === "ALL" ? "" : tab)}
								className={cn(
									"rounded-full border px-3.5 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
									isActive
										? "border-primary/40 bg-primary text-primary-foreground shadow-xs"
										: "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
								)}
							>
								{tab.charAt(0) + tab.slice(1).toLowerCase()}
							</button>
						);
					})}
				</div>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<JobsSearch
						value={query}
						onChange={onSearch}
						placeholder="Search by job or name..."
						label="Search contracts"
					/>
					{isFetching && !isLoading && (
						<span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
							<span
								aria-hidden
								className="size-1.5 animate-pulse rounded-full bg-primary"
							/>
							Updating results…
						</span>
					)}
				</div>
			</div>

			{isError && <JobsError onRetry={() => refetch()} />}

			{isLoading ? (
				<JobListSkeleton />
			) : visible.length === 0 ? (
				query.trim() ? (
					<JobsEmpty
						title="No contracts match your search"
						description={`Nothing here matches “${query.trim()}”. Try another keyword.`}
						action={
							<Button variant="outline" size="sm" onClick={() => onSearch("")}>
								Clear search
							</Button>
						}
					/>
				) : (
					<JobsEmpty
						title={
							status === "ALL"
								? "No contracts yet"
								: `No ${status.charAt(0) + status.slice(1).toLowerCase()} contracts`
						}
						description={
							role === "CLIENT"
								? "Accept a proposal and complete checkout — the contract lands here."
								: "Get hired on a job and your contract lands here."
						}
						icon={<Handshake className="size-5" />}
						action={
							status === "ALL" ? (
								<Button
									size="sm"
									onClick={() =>
										router.push(
											role === "CLIENT"
												? "/dashboard/client/proposals"
												: "/dashboard/freelancer/proposals",
										)
									}
								>
									View proposals
								</Button>
							) : (
								<Button
									variant="outline"
									size="sm"
									onClick={() => setParam("status", "")}
								>
									Show all
								</Button>
							)
						}
					/>
				)
			) : (
				<ul className="grid gap-3">
					{visible.map((contract, index) => (
						<ContractCard
							key={contract.id}
							contract={contract}
							role={role}
							index={index}
							onComplete={() => setCompletingId(contract.id)}
						/>
					))}
				</ul>
			)}

			<MarkCompleteDialog
				contract={completing}
				open={completing !== null}
				onClose={() => setCompletingId(null)}
			/>
		</div>
	);
}
