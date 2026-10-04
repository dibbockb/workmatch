"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { NAV } from "@/components/dashboard/nav-config";
import apiFetch from "@/lib/api-client";
import { useMe } from "@/features/auth/queries";

const ENDPOINTS = {
  jobs: "/v1/jobs/my-jobs",
  contracts: "/v1/contracts",
} as const;

const STATUS = {
  jobOpen: "OPEN",
  contractActive: "ACTIVE",
  contractDone: "COMPLETED",
} as const;

type Job = { id: string; title: string; status: string; proposalCount: number };
type Contract = { id: string; status: string };
type ListResponse<T> = { data?: T[]; meta?: { total?: number } };

function useList<T>(key: string, url: string) {
  return useQuery({
    queryKey: [key, "mine"],
    queryFn: () => apiFetch<ListResponse<T>>(url),
  });
}

function Stat({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="px-6 py-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 text-3xl font-semibold tracking-tight tabular-nums">
        {loading ? (
          <span className="inline-block h-9 w-12 animate-pulse rounded-md bg-muted" />
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

export default function ClientOverviewPage() {
  const { data: user } = useMe();
  const jobsQ = useList<Job>("jobs", ENDPOINTS.jobs);
  const contractsQ = useList<Contract>("contracts", ENDPOINTS.contracts);

  const jobs = jobsQ.data?.data ?? [];
  const contracts = contractsQ.data?.data ?? [];

  const openJobs = jobs.filter((j) => j.status === STATUS.jobOpen);
  const waiting = openJobs
    .filter((j) => j.proposalCount > 0)
    .sort((a, b) => b.proposalCount - a.proposalCount);

  const activeContracts = contracts.filter(
    (c) => c.status === STATUS.contractActive,
  ).length;
  const doneContracts = contracts.filter(
    (c) => c.status === STATUS.contractDone,
  ).length;

  const loading = jobsQ.isPending || contractsQ.isPending;
  const failed = jobsQ.isError || contractsQ.isError;
  const actions = NAV.CLIENT.flatMap((g) => g.items).slice(1);
  const firstName = user?.name.split(" ")[0];

  return (<div className="mx-auto w-full max-w-5xl space-y-8">
    <header>
      <h1 className="text-2xl font-semibold tracking-tight">
        {firstName ? `Welcome back, ${firstName}` : "Overview"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Your hiring at a glance.
      </p>
    </header>

    {failed && (
      <div
        role="alert"
        className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        <WarningCircle className="size-5 shrink-0" />
        <span className="flex-1">
          Couldn&apos;t load some of your data. Check your connection and try
          again.
        </span>
        <button
          type="button"
          onClick={() => {
            jobsQ.refetch();
            contractsQ.refetch();
          }}
          className="font-semibold underline underline-offset-4"
        >
          Retry
        </button>
      </div>
    )}

    <dl className="grid divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <Stat label="Open jobs" value={openJobs.length} loading={loading} />
      <Stat
        label="Active contracts"
        value={activeContracts}
        loading={loading}
      />
      <Stat
        label="Completed contracts"
        value={doneContracts}
        loading={loading}
      />
    </dl>

    <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
      <section aria-labelledby="attention-heading">
        <h2 id="attention-heading" className="text-base font-semibold">
          Waiting on you
        </h2>

        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
          {loading ? (
            <div className="space-y-px">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse bg-muted/50" />
              ))}
            </div>
          ) : waiting.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-medium">Nothing needs your attention.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Proposals show up here as soon as freelancers respond to your
                jobs.
              </p>
              <Link
                href="/dashboard/client/jobs/new"
                className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Post a job
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {waiting.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/dashboard/client/jobs/${job.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {job.title}
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {job.proposalCount}{" "}
                        {job.proposalCount === 1 ? "proposal" : "proposals"}{" "}
                        to review
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-primary">
                      Review
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <nav aria-labelledby="actions-heading">
        <h2 id="actions-heading" className="text-base font-semibold">
          Jump to
        </h2>
        <ul className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {actions.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
              >
                <a.icon className="size-4.5 text-muted-foreground" />
                {a.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </div>
  );
}
