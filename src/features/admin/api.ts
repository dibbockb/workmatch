import apiFetch from "@/lib/api-client";
import {
	type AdminDashboardStats,
	type AdminUsersResponse,
	adminDashboardStatsSchema,
	adminUsersResponseSchema,
} from "./schemas";

export async function getAdminUsers() {
	return await apiFetch<AdminUsersResponse>("/v1/admin/users").then(
		(response) => adminUsersResponseSchema.parse(response),
	);
}

export function blockUser(userId: string) {
	return apiFetch(`/v1/admin/users/${userId}/block`, { method: "PATCH" });
}

export function unblockUser(userId: string) {
	return apiFetch(`/v1/admin/users/${userId}/unblock`, { method: "PATCH" });
}

export async function getAdminDashboardStats() {
	return await apiFetch<AdminDashboardStats>("/v1/admin/dashboard").then(
		(response) => adminDashboardStatsSchema.parse(response),
	);
}
