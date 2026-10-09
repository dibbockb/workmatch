import { z } from "zod";

export const CONTRACT_STATUSES = ["ACTIVE", "COMPLETED", "CANCELLED"] as const;

const personSchema = z.object({
	id: z.string(),
	name: z.string(),
	profileImageUrl: z.string().nullish(),
	email: z.string().optional(),
});

const contractPaymentSchema = z.object({
	id: z.string(),
	amount: z.coerce.number(),
	platformCommission: z.coerce.number(),
	freelancerEarns: z.coerce.number(),
	status: z.string(),
	createdAt: z.string().nullish(),
});

const contractJobSchema = z.object({
	id: z.string(),
	title: z.string(),
	status: z.string(),
	deadline: z.string().nullish(),
});

const contractProposalSchema = z.object({
	id: z.string(),
	proposedPrice: z.coerce.number(),
	proposedTimeline: z.coerce.number(),
	status: z.string(),
});

export const contractSchema = z.object({
	id: z.string(),
	jobId: z.string(),
	proposalId: z.string(),
	clientId: z.string(),
	freelancerId: z.string(),
	agreedPrice: z.coerce.number(),
	agreedTimeline: z.coerce.number(),
	status: z.string(),
	startDate: z.string().nullish(),
	endDate: z.string().nullish(),
	deliverables: z.string().nullish(),
	createdAt: z.string().nullish(),
	updatedAt: z.string().nullish(),
	job: contractJobSchema.optional(),
	proposal: contractProposalSchema.optional(),
	client: personSchema.optional(),
	freelancer: personSchema.optional(),
	payments: z.array(contractPaymentSchema).optional(),
});

export type Contract = z.infer<typeof contractSchema>;

export const contractsResponseSchema = z.object({
	success: z.boolean(),
	statusCode: z.number(),
	message: z.string(),
	// NOTE: the list endpoint returns a plain array — no pagination envelope.
	data: z.array(contractSchema),
});

export type ContractsResponse = z.infer<typeof contractsResponseSchema>;
