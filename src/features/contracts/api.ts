import apiFetch from "@/lib/api-client";
import { type ContractsResponse, contractsResponseSchema } from "./schemas";

export type AcceptProposalBody = {
	jobId: string;
	proposalId: string;
};

export type AcceptProposalResponse = {
	success: boolean;
	statusCode: number;
	message: string;
	data: {
		checkoutUrl: string;
	};
};

export function acceptProposal(body: AcceptProposalBody) {
	return apiFetch<AcceptProposalResponse>("/v1/contracts/accept-proposal", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export function getCheckoutUrl(
	response: AcceptProposalResponse,
): string | null {
	const url = response?.data?.checkoutUrl;
	return typeof url === "string" && url.startsWith("https://") ? url : null;
}

export async function getMyContracts() {
	return await apiFetch<ContractsResponse>("/v1/contracts").then((response) =>
		contractsResponseSchema.parse(response),
	);
}

export function markContractComplete(contractId: string) {
	return apiFetch(`/v1/contracts/${contractId}/mark-complete`, {
		method: "PATCH",
	});
}
