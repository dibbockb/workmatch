import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	blockUser,
	getAdminDashboardStats,
	getAdminUsers,
	getAuditLogs,
	unblockUser,
} from "./api";

export function useAdminUsers() {
	return useQuery({
		queryKey: ["adminUsers"],
		queryFn: getAdminUsers,
	});
}

export function useAdminDashboardStats() {
	return useQuery({
		queryKey: ["adminDashboard"],
		queryFn: getAdminDashboardStats,
	});
}

export function useAuditLogs() {
	return useQuery({
		queryKey: ["adminAuditLogs"],
		queryFn: getAuditLogs,
	});
}

export function useBlockUser() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: blockUser,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["adminUsers"] });
		},
	});
}

export function useUnblockUser() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: unblockUser,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["adminUsers"] });
		},
	});
}
