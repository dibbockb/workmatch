import { z } from "zod";

export const jobSchema = z.object({
	id: z.string(),
	title: z.string(),
	budgetMin: z.coerce.number(),
	budgetMax: z.coerce.number(),
	status: z.string(),
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
