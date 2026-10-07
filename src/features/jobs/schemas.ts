import { z } from "zod";

export const jobSchema = z.object({
	id: z.string(),
	title: z.string(),
	budgetMin: z.coerce.number(),
	budgetMax: z.coerce.number(),
	status: z.string(),
	// Display-only extras — every field is optional so a lean payload still parses.
	requiredSkills: z.array(z.string()).optional(),
	deadline: z.string().nullish(),
	proposalCount: z.coerce.number().optional(),
	client: z
		.object({
			name: z.string().optional(),
			profileImageUrl: z.string().nullish(),
		})
		.optional(),
});

export type Job = z.infer<typeof jobSchema>;

export const jobsResponseSchema = z.object({
	success: z.boolean(),
	statusCode: z.number(),
	message: z.string(),
	data: z.object({
		jobs: z.array(jobSchema),
		pagination: z.object({
			page: z.number(),
			limit: z.number(),
			total: z.number(),
			totalPages: z.number(),
		}),
	}),
});

export type JobsResponse = z.infer<typeof jobsResponseSchema>;
