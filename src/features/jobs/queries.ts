import { useQuery } from "@tanstack/react-query";
import { getJobs } from "./api";

export function useJobs(params: { search?: string; page?: number }) {
	return useQuery({
		queryKey: ["jobs", params],
		queryFn: () => getJobs(params),
	});
}
