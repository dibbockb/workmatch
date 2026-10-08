import { z } from "zod";
import { jobSchema } from "../jobs/schemas";

export const PROPOSAL_STATUSES = [
	"PENDING",
	"ACCEPTED",
	"REJECTED",
	"WITHDRAWN",
] as const;

export type ProposalStatusValue = (typeof PROPOSAL_STATUSES)[number];

const counterOfferSchema = z.object({
	id: z.string(),
	proposedPrice: z.coerce.number(),
	proposedTimeline: z.coerce.number(),
	message: z.string().nullish(),
	status: z.string(),
	offeredBy: z.string().nullish(),
	createdAt: z.string().nullish(),
});

export const proposalSchema = z.object({
	id: z.string(),
	jobId: z.string(),
	proposedPrice: z.coerce.number(),
	proposedTimeline: z.coerce.number(),
	approachDescription: z.string(),
	status: z.string(),
	submittedAt: z.string(),
	respondedAt: z.string().nullish(),
	// `my-proposals` includes the full job + newest-first counter offers.
	job: jobSchema.optional(),
	counterOffers: z.array(counterOfferSchema).optional(),
});

export type Proposal = z.infer<typeof proposalSchema>;

export const proposalsResponseSchema = z.object({
	success: z.boolean(),
	statusCode: z.number(),
	message: z.string(),
	data: z.object({
		proposals: z.array(proposalSchema),
		pagination: z.object({
			page: z.number(),
			limit: z.number(),
			total: z.number(),
			totalPages: z.number(),
		}),
	}),
});

export type ProposalsResponse = z.infer<typeof proposalsResponseSchema>;
