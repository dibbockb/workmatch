import apiFetch from "@/lib/api-client";
import { Job } from "./schemas";

type JobsResponse = { data: Job[]; meta: { total: number } };

export function getJobs(params: { search?: string; page?: number }) {
    const qs = new URLSearchParams();
    if (params.search) {
        qs.set("search", params.search)
    }
    qs.set("page", String(params.page ?? 1))

    return apiFetch<JobsResponse>(`/v1/jobs?${qs.toString()}`)
}