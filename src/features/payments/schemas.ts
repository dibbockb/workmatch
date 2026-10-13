import { z } from "zod";

export const PAYMENT_STATUSES = [
	"PENDING",
	"SUCCEEDED",
	"FAILED",
	"REFUNDED",
] as const;

export type PaymentStatusValue = (typeof PAYMENT_STATUSES)[number];

export const paymentSchema = z.object({
	id: z.string(),
	contractId: z.string(),
	clientId: z.string(),
	freelancerId: z.string(),
	amount: z.coerce.number(),
	platformCommission: z.coerce.number(),
	freelancerEarns: z.coerce.number(),
	status: z.enum(PAYMENT_STATUSES),
	stripeSessionId: z.string().nullish(),
	reviewId: z.string().nullish(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type VerifiedPayment = z.infer<typeof paymentSchema>;

export const verifyPaymentResponseSchema = z.object({
	success: z.boolean(),
	statusCode: z.number(),
	message: z.string(),
	data: paymentSchema,
});

export type VerifyPaymentResponse = z.infer<
	typeof verifyPaymentResponseSchema
>;
