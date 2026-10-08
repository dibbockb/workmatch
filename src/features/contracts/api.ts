import apiFetch from "@/lib/api-client";

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
