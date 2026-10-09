import { z } from "zod";

export const ADMIN_USER_ROLES = ["CLIENT", "FREELANCER", "ADMIN"] as const;

export const adminUserSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	profileImageUrl: z.string().nullish(),
	role: z.string(),
	status: z.string(),
	emailVerified: z.boolean().nullish(),
	needPasswordChange: z.boolean().nullish(),
	isDeleted: z.boolean().nullish(),
	isBlocked: z.boolean().nullish(),
	createdAt: z.string().nullish(),
	updatedAt: z.string().nullish(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;

export const adminUsersResponseSchema = z.object({
	success: z.boolean(),
	statusCode: z.number(),
	message: z.string(),
	data: z.object({
		users: z.array(adminUserSchema),
		total: z.number(),
	}),
});

export type AdminUsersResponse = z.infer<typeof adminUsersResponseSchema>;

export const adminDashboardStatsSchema = z.object({
	success: z.boolean(),
	statusCode: z.number(),
	message: z.string(),
	data: z.object({
		totalUsers: z.coerce.number(),
		totalJobs: z.coerce.number(),
		totalContracts: z.coerce.number(),
		totalRevenue: z.object({
			_sum: z.object({
				platformCommission: z.coerce.number().nullish(),
			}),
		}),
	}),
});

export type AdminDashboardStats = z.infer<typeof adminDashboardStatsSchema>;

export const auditLogSchema = z.object({
	id: z.string(),
	// System-generated events (e.g. Stripe webhooks) carry no actor.
	userId: z.string().nullish(),
	action: z.string(),
	entityType: z.string(),
	entityId: z.string(),
	changes: z.unknown().nullish(),
	createdAt: z.string(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;

export const auditLogsResponseSchema = z.object({
	success: z.boolean(),
	statusCode: z.number(),
	message: z.string(),
	data: z.object({
		logs: z.array(auditLogSchema),
		total: z.number(),
	}),
});

export type AuditLogsResponse = z.infer<typeof auditLogsResponseSchema>;
