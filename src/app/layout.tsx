import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "@/providers";
import { ThemeProvider } from "@/components/theme-provider";
import { SiteChrome } from "@/components/landing/site-chrome";
import { VisibilityGate } from "@/components/motion/visibility-gate";
import { Toaster } from "@/components/ui/sonner";

const onest = Onest({
	variable: "--font-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "WorkMatch - Hire vetted experts, matched in hours",
	description:
		"WorkMatch is the high-trust marketplace where vetted freelancers meet serious teams. Post a brief, get curated matches, pay safely in escrow.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn("h-full", "antialiased", onest.variable, "font-sans")}
		>
			<Providers>
				<body className="min-h-full flex flex-col">
					<ThemeProvider>
						<VisibilityGate />
						<SiteChrome />
						{children}
					</ThemeProvider>
					<Toaster position="bottom-right" />
				</body>
			</Providers>
		</html>
	);
}
