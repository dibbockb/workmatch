import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/providers";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkMatch - Hire vetted experts, matched in hours",
  description:
    "WorkMatch is the high-trust marketplace where 24,000+ vetted freelancers meet serious teams. Post a brief, get 3 curated matches, pay safely in escrow.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistMono.variable, "font-sans",)}
    >
      <Providers>
        <body className="min-h-full flex flex-col">{children}</body>
      </Providers>
    </html>
  );
}
