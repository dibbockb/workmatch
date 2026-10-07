import { z } from "zod";

export const jobSchema = z.object({
    id: z.string(),
    title: z.string(),
    budgetMin: z.number(),
    budgetMax: z.number(),
    experienceLevel: z.enum(["BEGINNER", "INTERMEDIATE", "EXPERT"]),
    status: z.string(),
});

export type Job = z.infer<typeof jobSchema>;