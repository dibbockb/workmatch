import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	getJobProposals,
	getMyProposals,
	rejectProposal,
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

export function useRejectProposal() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			jobId,
			proposalId,
		}: {
			jobId: string;
			proposalId: string;
		}) => rejectProposal(proposalId).then(() => ({ jobId, proposalId })),
		onSuccess: ({ jobId }) => {
			qc.invalidateQueries({ queryKey: ["jobProposals", jobId] });
			qc.invalidateQueries({ queryKey: ["myProposals"] });
		},
	});
}
