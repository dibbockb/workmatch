import apiFetch from "@/lib/api-client";
import { JobsResponse, jobsResponseSchema } from "./schemas";
import { useQuery } from "@tanstack/react-query";

export async function getJobs(params: { search?: string; page?: number }) {
	const qs = new URLSearchParams();
	if (params.search) {
		qs.set("search", params.search);
	}
	qs.set("page", String(params.page ?? 1));

	return await apiFetch<JobsResponse>(`/v1/jobs?${qs.toString()}`).then((response) =>
		jobsResponseSchema.parse(response),
	);
}

export async function getMyJobs(params: { page?: number }) {
	const qs = new URLSearchParams();
	qs.set("page", String(params.page ?? 1));
	return apiFetch<JobsResponse>(`/v1/jobs/my-posted?${qs.toString()}`)
}