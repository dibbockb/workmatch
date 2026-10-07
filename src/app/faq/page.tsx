import type { Metadata } from "next";
import Navbar from "@/components/landing/navbar";

export const metadata: Metadata = {
  title: "FAQ | WorkMatch",
  description: "Frequently asked questions about WorkMatch.",
};

const FAQS = [
  {
    q: "How does WorkMatch work?",
    a: "Clients post a job, freelancers send proposals, and the client picks who to hire. Once a contract starts, both sides manage it from their dashboard.",
  },
  {
    q: "Is it free to post a job?",
    a: "Yes, posting a job is free. Fees apply only once a contract is funded.",
  },
  {
    q: "How do payments work?",
    a: "Payments are processed securely through our payment provider. Funds are released to the freelancer once the client marks the work as complete.",
  },
  {
    q: "Can I switch between being a client and a freelancer?",
    a: "Each account has a single role for now. If you need both, you can create a second account with a different email.",
  },
  {
    q: "How do I contact support?",
    a: "Head over to the Contact page and send us a message \u2014 we typically reply within a business day.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-full bg-background font-sans text-foreground">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl px-5 pt-32 pb-24">
        <h1 className="text-4xl font-bold tracking-[-0.03em]">
          Frequently asked questions
        </h1>
        <p className="mt-3 text-muted-foreground">
          Can&apos;t find what you&apos;re looking for? Reach out on the{" "}
          <a href="/contact" className="text-primary underline underline-offset-2">
            Contact
          </a>{" "}
          page.
        </p>

        <div className="mt-8 divide-y divide-border rounded-4xl border border-border bg-card shadow-[0_40px_100px_-40px_oklch(0.43_0.04_42/0.5)]">
          {FAQS.map((item) => (
            <details key={item.q} className="group p-6 open:pb-6">
              <summary className="cursor-pointer list-none font-semibold tracking-tight marker:content-none">
                {item.q}
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </main>
    </div>
  );
}
