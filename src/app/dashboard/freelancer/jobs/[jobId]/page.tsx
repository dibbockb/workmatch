"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSubmitProposal } from "@/features/proposals/queries";
import { useJob } from "@/features/jobs/queries";

export default function JobDetailPage() {
    const { jobId } = useParams<{ jobId: string }>();
    const { data: job, isLoading } = useJob(jobId);
    const { mutate, isPending, isSuccess } = useSubmitProposal();

    const [coverLetter, setCoverLetter] = useState("");
    const [proposedPrice, setProposedPrice] = useState("");
    const [proposedTimeline, setProposedTimeline] = useState("");

    if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
    if (!job) return <p className="text-muted-foreground">Job not found.</p>;

    function handleApply(e: React.FormEvent) {
        e.preventDefault();
        mutate({ jobId, coverLetter, proposedPrice: Number(proposedPrice), proposedTimeline: Number(proposedTimeline) });
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-sm text-muted-foreground">
                ${job.budgetMin}–${job.budgetMax} · {job.status}
            </p>

            {isSuccess ? (
                <p className="text-sm text-primary">Proposal submitted.</p>
            ) : (
                <form onSubmit={handleApply} className="space-y-4 rounded-2xl border border-border p-5">
                    <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Cover letter"
                        rows={4}
                        required
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                    />
                    <input
                        type="number"
                        value={proposedPrice}
                        onChange={(e) => setProposedPrice(e.target.value)}
                        placeholder="Your price ($)"
                        required
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                    />
                    <input
                        type="number"
                        value={proposedTimeline}
                        onChange={(e) => setProposedTimeline(e.target.value)}
                        placeholder="Timeline (days)"
                        required
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                    >
                        {isPending ? "Submitting..." : "Apply"}
                    </button>
                </form>
            )}
        </div>
    );
}