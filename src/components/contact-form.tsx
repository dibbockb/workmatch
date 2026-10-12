"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
	type ContactResult,
	sendContactMessage,
} from "@/app/actions/contact";
import { cn } from "@/lib/utils";

const initialState: ContactResult = { ok: false, message: "" };

const inputClass =
	"w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary";

export function ContactForm() {
	const [state, formAction, isPending] = useActionState(
		sendContactMessage,
		initialState,
	);
	const formRef = useRef<HTMLFormElement>(null);
	const announcedRef = useRef(false);

	useEffect(() => {
		if (state.ok && state.message && !announcedRef.current) {
			announcedRef.current = true;
			toast.success(state.message);
			formRef.current?.reset();
		} else if (!state.ok) {
			announcedRef.current = false;
		}
	}, [state]);

	const fieldErrors = state.fieldErrors ?? {};

	return (
		<form
			ref={formRef}
			action={formAction}
			className="mt-8 space-y-5 rounded-4xl border border-border bg-card p-7 shadow-[0_40px_100px_-40px_oklch(0.43_0.04_42/0.5)] sm:p-9"
		>
			<div
				aria-hidden="true"
				className="absolute left-[-9999px] h-px w-px overflow-hidden"
			>
				<label htmlFor="website">Website</label>
				<input
					id="website"
					name="website"
					type="text"
					tabIndex={-1}
					autoComplete="off"
				/>
			</div>

			<div className="space-y-1.5">
				<label htmlFor="name" className="text-sm font-medium">
					Name
				</label>
				<input
					id="name"
					name="name"
					type="text"
					autoComplete="name"
					required
					placeholder="John Dough"
					aria-invalid={Boolean(fieldErrors.name)}
					className={cn(inputClass, fieldErrors.name && "border-destructive")}
				/>
				{fieldErrors.name && (
					<p role="alert" className="text-[13px] text-destructive">
						{fieldErrors.name}
					</p>
				)}
			</div>

			<div className="space-y-1.5">
				<label htmlFor="email" className="text-sm font-medium">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					required
					placeholder="you@company.com"
					aria-invalid={Boolean(fieldErrors.email)}
					className={cn(inputClass, fieldErrors.email && "border-destructive")}
				/>
				{fieldErrors.email && (
					<p role="alert" className="text-[13px] text-destructive">
						{fieldErrors.email}
					</p>
				)}
			</div>

			<div className="space-y-1.5">
				<label htmlFor="message" className="text-sm font-medium">
					Message
				</label>
				<textarea
					id="message"
					name="message"
					rows={5}
					required
					placeholder="How can we help?"
					aria-invalid={Boolean(fieldErrors.message)}
					className={cn(
						inputClass,
						"resize-none",
						fieldErrors.message && "border-destructive",
					)}
				/>
				{fieldErrors.message && (
					<p role="alert" className="text-[13px] text-destructive">
						{fieldErrors.message}
					</p>
				)}
			</div>

			<button
				type="submit"
				disabled={isPending}
				className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-wait disabled:opacity-70"
			>
				{isPending ? "Sending…" : "Send message"}
			</button>

			{!state.ok && state.message && (
				<p role="alert" className="text-sm text-destructive">
					{state.message}
				</p>
			)}
		</form>
	);
}
