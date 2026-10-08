import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	closeJob,
	createJob,
	deleteJob,
	getJobById,
	getJobs,
	getMyJobs,
	updateJob,
} from "./api";

export function useJobs(params: { search?: string; page?: number }) {
	return useQuery({
		queryKey: ["jobs", params],
		queryFn: () => getJobs(params),
	});
}

export function useJob(jobId: string) {
	return useQuery({
		queryKey: ["job", jobId],
		queryFn: () => getJobById(jobId),
	});
}

export function useMyJobs(params: { page?: number; limit?: number }) {
	return useQuery({
		queryKey: ["myJobs", params],
		queryFn: () => getMyJobs(params),
	});
}

export function useCreateJob() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: createJob,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["myJobs"] });
			qc.invalidateQueries({ queryKey: ["jobs"] });
		},
	});
}

export function useUpdateJob(jobId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: Record<string, unknown>) => updateJob(jobId, body),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["job", jobId] });
			qc.invalidateQueries({ queryKey: ["myJobs"] });
			qc.invalidateQueries({ queryKey: ["jobs"] });
		},
	});
}

export function useDeleteJob() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: deleteJob,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["myJobs"] });
			qc.invalidateQueries({ queryKey: ["jobs"] });
		},
	});
}

export function useCloseJob() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: closeJob,
		onSuccess: (_, jobId) => {
			qc.invalidateQueries({ queryKey: ["job", jobId] });
			qc.invalidateQueries({ queryKey: ["myJobs"] });
		},
	});
}
