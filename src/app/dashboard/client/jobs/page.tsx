"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMyJobs } from "@/features/jobs/queries";
import Loading from "@/app/loading";

export default function MyJobsPage() {
    const router = useRouter();
    const params = useSearchParams();
    const search = params.get("search") ?? "";
    const page = Number(params.get("page") ?? 1);

    const { data, isLoading, isError, refetch } = useMyJobs({ page });
    const jobs = data?.data.jobs ?? [];
    const pagination = data?.data.pagination;

    function setParam(key: string, value: string) {
        const next = new URLSearchParams(params);
        value ? next.set(key, value) : next.delete(key);
        if (key !== "page") next.delete("page");
        router.push(`?${next.toString()}`);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Jobs</h1>

            <input
                defaultValue={search}
                onChange={(e) => setParam("search", e.target.value)}
                placeholder="Search jobs..."
                className="w-full max-w-sm rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
            />

            {isLoading && <Loading></Loading>}
            {isError && (
                <div className="text-sm text-destructive">
                    <p>Could not load jobs.</p>
                    <button type="button" onClick={() => refetch()} className="underline">
                        Try again
                    </button>
                </div>
            )}
            {!isLoading && !isError && jobs.length === 0 && (
                <p className="text-muted-foreground">No jobs found.</p>
            )}
            <ul className="divide-y divide-border rounded-2xl border border-border">
                {jobs.map((job) => (
                    <li key={job.id} className="p-4">
                        <p className="font-semibold">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                            Budget: ${job.budgetMin.toLocaleString()} – $
                            {job.budgetMax.toLocaleString()} · Status: {job.status}
                        </p>
                    </li>
                ))}
            </ul>

            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setParam("page", String(page - 1))}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                    Prev
                </button>
                <button
                    type="button"
                    disabled={pagination !== undefined && page >= pagination.totalPages}
                    onClick={() => setParam("page", String(page + 1))}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
}