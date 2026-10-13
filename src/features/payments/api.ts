import apiFetch from "@/lib/api-client";
import {
	type VerifyPaymentResponse,
	verifyPaymentResponseSchema,
} from "./schemas";

export async function verifyPaymentSession(sessionId: string) {
	return await apiFetch<VerifyPaymentResponse>(
		`/v1/payment/verify/${encodeURIComponent(sessionId)}`,
	).then((response) => verifyPaymentResponseSchema.parse(response));
}
