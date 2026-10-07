"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useJob, useDeleteJob, useCloseJob } from "@/features/jobs/queries";
import { updateJob } from "@/features/jobs/api";

export default function ClientJobDetailPage() {
    const { jobId } = useParams<{ jobId: string }>();
    const router = useRouter();
    const qc = useQueryClient();
    const { data: job, isLoading } = useJob(jobId);
    const deleteJob = useDeleteJob();
    const closeJob = useCloseJob();

    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState("");

    const updateMutation = useMutation({
        mutationFn: () => updateJob(jobId, { title }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["job", jobId] });
            setEditing(false);
        },
    });

    if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
    if (!job) return <p className="text-muted-foreground text-center">No such job exists.</p>;

    return (
        <div className="space-y-6">
            {editing ? (
                <div className="flex gap-2">
                    <input
                        defaultValue={job.title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm"
                    />
                    <button
                        type="button"
                        onClick={() => updateMutation.mutate()}
                        className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                    >
                        Save
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="text-sm text-primary underline"
                    >
                        Edit
                    </button>
                </div>
            )}

            <p className="text-sm text-muted-foreground">
                ${job.budgetMin}–${job.budgetMax} · {job.status}
            </p>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => closeJob.mutate(jobId)}
                    disabled={job.status === "CLOSED"}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-40"
                >
                    Close job
                </button>
                <button
                    type="button"
                    onClick={() =>
                        deleteJob.mutate(jobId, {
                            onSuccess: () => router.push("/dashboard/client/jobs"),
                        })
                    }
                    className="rounded-lg border border-destructive px-3 py-1.5 text-sm text-destructive"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
