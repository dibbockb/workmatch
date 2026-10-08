import apiFetch from "@/lib/api-client";

export type AcceptProposalBody = {
	jobId: string;
	proposalId: string;
};

export function acceptProposal(body: AcceptProposalBody) {
	return apiFetch("/v1/contracts/accept-proposal", {
		method: "POST",
		body: JSON.stringify(body),
	});
}
