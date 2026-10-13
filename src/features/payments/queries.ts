import { useQuery } from "@tanstack/react-query";
import { verifyPaymentSession } from "./api";

function isAuthError(error: unknown): boolean {
	const status = (error as { response?: { status?: number } })?.response
		?.status;
	return status === 401 || status === 403;
}

export function useVerifyPaymentSession(sessionId: string | null) {
	return useQuery({
		queryKey: ["paymentVerify", sessionId],
		queryFn: () => verifyPaymentSession(sessionId as string),
		enabled: !!sessionId,
		retry: (failureCount, error) =>
			!isAuthError(error) && failureCount < 4,
		retryDelay: 2000,
		refetchOnWindowFocus: false,
		refetchInterval: (query) =>
			query.state.data?.data.status === "PENDING" ? 3000 : false,
	});
}
