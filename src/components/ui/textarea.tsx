import * as React from "react";
import { cn } from "cn";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
	return (
		<textarea
			data-slot="textarea"
			className={cn(
				"field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-all outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/80 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
				className,
			)}
			{...props}
		/>
	);
}

export { Textarea };
