"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
	CheckCircleIcon,
	InfoIcon,
	WarningIcon,
	XCircleIcon,
	SpinnerIcon,
} from "@phosphor-icons/react";

// Surface, accents and radii all resolve to site tokens — see the
// "Sonner toasts" block in src/app/globals.css. No inline theming here.
const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			icons={{
				success: <CheckCircleIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <WarningIcon className="size-4" />,
				error: <XCircleIcon className="size-4" />,
				loading: <SpinnerIcon className="size-4 animate-spin" />,
			}}
			{...props}
		/>
	);
};

export { Toaster };
