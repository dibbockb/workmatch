import type { Metadata } from "next";
import { Geist_Mono, Hanken_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";
import Providers from "@/providers";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

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
      className={cn(
        "h-full antialiased",
        hankenGrotesk.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
