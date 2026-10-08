import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acceptProposal } from "./api";

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
