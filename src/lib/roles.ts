export const ROLE_HOME = {
	ADMIN: "/dashboard/admin",
	CLIENT: "/dashboard/client",
	FREELANCER: "/dashboard/freelancer",
} as const;
export type Role = keyof typeof ROLE_HOME;
