import { z } from "zod";

export const loginSchema = z.object({
	email: z.email("Invalid email"),
	password: z.string().min(6, "Password must be at least 6 chars"),
});

export const registerSchema = z.object({
	name: z.string().min(2, "Name required"),
	email: z.email("Invalid email"),
	password: z.string().min(6, "Password must be at least 6 chars"),
	role: z.enum(["CLIENT", "FREELANCER"]),
});

export const userSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string(),
	role: z.enum(["CLIENT", "FREELANCER", "ADMIN"]),
	isBlocked: z.boolean(),
	isDeleted: z.boolean(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type User = z.infer<typeof userSchema>;
