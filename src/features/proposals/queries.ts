import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getJobProposals,
	getMyProposals,
	submitProposal,
	withdrawProposal,
} from "./api";

export function useSubmitProposal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: submitProposal,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["myProposals"] });
		},
	});
}

export function useMyProposals(params: {
	status?: string;
	page?: number;
	limit?: number;
}) {
	return useQuery({
		queryKey: ["myProposals", params],
		queryFn: () => getMyProposals(params),
	});
}

export function useWithdrawProposal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: withdrawProposal,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["myProposals"] });
		},
	});
}

export function useJobProposals(jobId: string) {
	return useQuery({
		queryKey: ["jobProposals", jobId],
		queryFn: () => getJobProposals(jobId),
	});
}
