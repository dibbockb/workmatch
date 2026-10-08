import { z } from "zod";

export const jobSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullish(),
	budgetMin: z.coerce.number(),
	budgetMax: z.coerce.number(),
	status: z.string(),
	// Display-only extras — every field is optional so a lean payload still parses.
	requiredSkills: z.array(z.string()).optional(),
	deadline: z.string().nullish(),
	duration: z.string().nullish(),
	experienceLevel: z.string().nullish(),
	proposalCount: z.coerce.number().optional(),
	createdAt: z.string().nullish(),
	updatedAt: z.string().nullish(),
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

export const EXPERIENCE_LEVELS = [
	"BEGINNER",
	"INTERMEDIATE",
	"EXPERT",
] as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const jobFormSchema = z.object({
	title: z
		.string()
		.trim()
		.min(8, "Give it a clear title — at least 8 characters.")
		.max(120, "Keep the title under 120 characters."),
	description: z
		.string()
		.trim()
		.min(
			30,
			"Describe the scope in at least 30 characters so proposals come back sharp.",
		)
		.max(8000, "Keep the brief under 8,000 characters."),
	requiredSkills: z
		.array(z.string().trim().min(1).max(40))
		.min(1, "Add at least one required skill.")
		.max(15, "Keep it to 15 skills or fewer."),
	budgetMin: z.coerce
		.number({ message: "Enter a minimum budget." })
		.min(1, "Budget must be at least $1.")
		.max(1_000_000, "Budget looks unusually large."),
	budgetMax: z.coerce
		.number({ message: "Enter a maximum budget." })
		.min(1, "Budget must be at least $1.")
		.max(1_000_000, "Budget looks unusually large."),
	deadline: z
		.string()
		.min(1, "Pick a deadline.")
		.refine((val) => {
			const d = new Date(val.length === 10 ? `${val}T00:00:00` : val);
			return !Number.isNaN(d.getTime());
		}, "Enter a valid date."),
	duration: z
		.string()
		.trim()
		.min(2, "Estimate the duration (e.g. “1 week”, “2–3 weeks”).")
		.max(60, "Keep the duration under 60 characters."),
	experienceLevel: z.enum(EXPERIENCE_LEVELS, {
		message: "Choose an experience level.",
	}),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;
