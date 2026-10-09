export type DemoRole = "admin" | "client" | "freelancer";

export const DEMO_ACCOUNTS: Record<
	DemoRole,
	{ label: string; email: string; password: string }
> = {
	admin: {
		label: "Admin",
		email: "admin@workmatch.com",
		password: "!123QWEe",
	},
	client: {
		label: "Client",
		email: "client@workmatch.com",
		password: "!123QWEe",
	},
	freelancer: {
		label: "Freelancer",
		email: "freelancer@workmatch.com",
		password: "!123QWEe",
	},
};

export const DEMO_ROLES: DemoRole[] = ["admin", "client", "freelancer"];

export function fakeAuthRequest(ms = 1500): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
