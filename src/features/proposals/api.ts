import apiFetch from "@/lib/api-client";

type SubmitProposalBody = {
    jobId: string;
    coverLetter: string;
    proposedPrice: number;
    proposedTimeline: number;
};

export function submitProposal(body: SubmitProposalBody) {
    return apiFetch("/v1/proposals", { method: "POST", body: JSON.stringify(body) });
}