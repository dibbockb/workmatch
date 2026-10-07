import type { Metadata } from "next";
import Navbar from "@/components/landing/navbar";

export const metadata: Metadata = {
  title: "Contact | WorkMatch",
  description: "Get in touch with the WorkMatch team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-full bg-background font-sans text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-md px-5 pt-32 pb-24">
        <h1 className="text-4xl font-bold tracking-[-0.03em]">Contact us</h1>
        <p className="mt-3 text-muted-foreground">
          Questions, feedback, or something broken? Send us a note.
        </p>

        <form className="mt-8 space-y-5 rounded-4xl border border-border bg-card p-7 shadow-[0_40px_100px_-40px_oklch(0.43_0.04_42/0.5)] sm:p-9">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="jane@example.com"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
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
              className="w-full resize-none rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Send message
          </button>
        </form>

        <p className="mt-6 text-sm text-muted-foreground">
          Prefer email? Reach the founder directly at{" "}
          <a href="mailto:dibbo@dibbockb.com" className="text-primary underline underline-offset-2">
            dibbo@dibbockb.com
          </a>
          .
        </p>
      </main>
    </div>
  );
}
