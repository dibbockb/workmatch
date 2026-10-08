import apiFetch from "@/lib/api-client";
import { Job, JobsResponse, jobsResponseSchema } from "./schemas";
import { useQuery } from "@tanstack/react-query";

export async function getJobs(params: { search?: string; page?: number }) {
	const qs = new URLSearchParams();
	if (params.search) {
		qs.set("search", params.search);
	}
	qs.set("page", String(params.page ?? 1));

	return await apiFetch<JobsResponse>(`/v1/jobs?${qs.toString()}`).then(
		(response) => jobsResponseSchema.parse(response),
	);
}

export async function getMyJobs(params: { page?: number }) {
	const qs = new URLSearchParams();
	qs.set("page", String(params.page ?? 1));
	return apiFetch<JobsResponse>(`/v1/jobs/my-posted?${qs.toString()}`);
}

export async function getJobById(jobId: string) {
	return apiFetch<Job>(`/v1/jobs/${jobId}`);
}

export async function createJob(body: Record<string, unknown>) {
	return apiFetch<Job>(`/v1/jobs`, {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export async function updateJob(jobId: string, body: Record<string, unknown>) {
	return apiFetch<Job>(`/v1/jobs/${jobId}`, {
		method: "PATCH",
		body: JSON.stringify(body),
	});
}

export async function deleteJob(jobId: string) {
	return apiFetch<void>(`/v1/jobs/${jobId}`, { method: "DELETE" });
}

export async function closeJob(jobId: string) {
	return apiFetch<void>(`/v1/jobs/${jobId}/close`, { method: "POST" });
}
