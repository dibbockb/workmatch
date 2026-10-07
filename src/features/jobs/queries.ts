import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { closeJob, deleteJob, getJobs, getMyJobs } from "./api";

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

export function useDeleteJob() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteJob,
		onSuccess: () => qc.invalidateQueries({ queryKey: ["myJobs"] }),
	})
}

export function useCloseJob() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: closeJob,
		onSuccess: (_, jobId) => qc.invalidateQueries({ queryKey: ["job", jobId] }),
	});
}