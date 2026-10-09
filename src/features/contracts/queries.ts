import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptProposal, getMyContracts, markContractComplete } from "./api";

export function useMyContracts() {
	return useQuery({
		queryKey: ["myContracts"],
		queryFn: getMyContracts,
	});
}

export function useMarkComplete() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: markContractComplete,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["myContracts"] });
			qc.invalidateQueries({ queryKey: ["myJobs"] });
		},
	});
}

export function useAcceptProposal(jobId: string) {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (proposalId: string) => acceptProposal({ jobId, proposalId }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["jobProposals", jobId] });
			qc.invalidateQueries({ queryKey: ["job", jobId] });
			qc.invalidateQueries({ queryKey: ["myJobs"] });
			qc.invalidateQueries({ queryKey: ["jobs"] });
		},
	});
}
