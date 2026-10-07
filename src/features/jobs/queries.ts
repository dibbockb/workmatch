import { useQuery } from "@tanstack/react-query";
import { getJobs, getMyJobs } from "./api";

export function useJobs(params: { search?: string; page?: number }) {
	return useQuery({
		queryKey: ["jobs", params],
		queryFn: () => getJobs(params),
	});
}

export function useMyJobs(params: { page?: number }) {
	return useQuery({
		queryKey: ["myJobs", params],
		queryFn: () => getMyJobs(params),
	});
}
