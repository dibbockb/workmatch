"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { z } from "zod";
import { isRateLimited } from "@/lib/rate-limit";

const contactSchema = z.object({
	name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
	email: z.string().trim().email("Enter a valid email address."),
	message: z
		.string()
		.trim()
		.min(10, "Message must be at least 10 characters.")
		.max(2000, "Message must be under 2000 characters."),
});

export type ContactResult = {
	ok: boolean;
	message: string;
	fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};

export async function sendContactMessage(
	_prevState: ContactResult,
	formData: FormData,
): Promise<ContactResult> {
	void _prevState;

	if (String(formData.get("website") ?? "").trim() !== "") {
		return { ok: true, message: "Thanks for your message." };
	}

	const parsed = contactSchema.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
		message: formData.get("message"),
	});

	if (!parsed.success) {
		const fieldErrors: ContactResult["fieldErrors"] = {};
		for (const issue of parsed.error.issues) {
			const field = issue.path[0];
			if (
				(field === "name" || field === "email" || field === "message") &&
				!fieldErrors[field]
			) {
				fieldErrors[field] = issue.message;
			}
		}
		return {
			ok: false,
			message: "Please fix the highlighted fields.",
			fieldErrors,
		};
	}

	const headerStore = await headers();
	const ip =
		headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
		headerStore.get("x-real-ip") ??
		"unknown";
	if (isRateLimited(`contact:${ip}`)) {
		return {
			ok: false,
			message: "Too many messages. Please try again in 10 minutes.",
		};
	}

	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.CONTACT_FROM_EMAIL;
	if (!apiKey || !from) {
		return {
			ok: false,
			message:
				"Email is not configured yet. Please reach out directly instead.",
		};
	}

	const { name, email, message } = parsed.data;

	try {
		const resend = new Resend(apiKey);
		const { error } = await resend.emails.send({
			from,
			to: from,
			replyTo: email,
			subject: `WorkMatch::: ${name}`,
			text: [`Name: ${name}`, `Email: ${email}`, "", message].join("\n"),
		});
		if (error) {
			return {
				ok: false,
				message: "Could not send your message. Please try again later.",
			};
		}
		return {
			ok: true,
			message: "Thanks for your message. We'll get back to you soon.",
		};
	} catch {
		return {
			ok: false,
			message: "Could not send your message. Please try again later.",
		};
	}
}
