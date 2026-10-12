import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
	title: "Contact | WorkMatch",
	description: "Get in touch with the WorkMatch team.",
};

export default function ContactPage() {
	return (
		<div className="min-h-full bg-background font-sans text-foreground">
			<main className="animate-rise mx-auto w-full max-w-md px-5 pt-32 pb-24">
				<h1 className="text-4xl font-bold tracking-[-0.03em]">Contact us</h1>
				<p className="mt-3 text-muted-foreground">
					Questions, feedback, or something broken? Send us a note.
				</p>

				<ContactForm />

				<p className="mt-6 text-sm text-muted-foreground">
					Prefer email? Reach the founder directly at{" "}
					<a
						href="mailto:dibbo@dibbockb.com"
						className="text-primary underline underline-offset-2"
					>
						dibbo@dibbockb.com
					</a>
					.
				</p>
			</main>
		</div>
	);
}
