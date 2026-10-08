import apiFetch from "@/lib/api-client";
import { type ProposalsResponse, proposalsResponseSchema } from "./schemas";

// Matches the backend validation: unknown keys are stripped server-side,
// so only these four fields are sent.
export type SubmitProposalBody = {
	jobId: string;
	proposedPrice: number;
	proposedTimeline: number;
	approachDescription: string;
};

export function submitProposal(body: SubmitProposalBody) {
	return apiFetch("/v1/proposals", {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export async function getMyProposals(params: {
	status?: string;
	page?: number;
	limit?: number;
}) {
	const qs = new URLSearchParams();
	if (params.status) qs.set("status", params.status);
	qs.set("page", String(params.page ?? 1));
	qs.set("limit", String(params.limit ?? 20));

	return await apiFetch<ProposalsResponse>(
		`/v1/proposals/freelancer/my-proposals?${qs.toString()}`,
	).then((response) => proposalsResponseSchema.parse(response));
}

export function withdrawProposal(proposalId: string) {
	return apiFetch(`/v1/proposals/${proposalId}/withdraw`, {
		method: "POST",
	});
}

export async function getJobProposals(
	jobId: string,
	params: { page?: number; limit?: number } = {},
) {
	const qs = new URLSearchParams();
	qs.set("page", String(params.page ?? 1));
	qs.set("limit", String(params.limit ?? 50));

	return await apiFetch<ProposalsResponse>(
		`/v1/proposals/job/${jobId}?${qs.toString()}`,
	).then((response) => proposalsResponseSchema.parse(response));
}
