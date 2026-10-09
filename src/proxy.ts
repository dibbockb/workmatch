import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

const secretValue = process.env.JWT_ACCESS_SECRET;
if (!secretValue) {
	throw new Error("JWT_ACCESS_SECRET is not set (add it to .env.local)");
}
const secret = new TextEncoder().encode(secretValue);

const AUTH_PAGES = ["/login", "/signup"];
const ROLE_HOME = {
	ADMIN: "/dashboard/admin",
	CLIENT: "/dashboard/client",
	FREELANCER: "/dashboard/freelancer",
} as const;
type Role = keyof typeof ROLE_HOME;

function isRole(value: unknown): value is Role {
	return typeof value === "string" && value in ROLE_HOME;
}

export async function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;
	const token = req.cookies.get("accessToken")?.value;
	const hasRefresh = req.cookies.has("refreshToken");

	let role: Role | null = null;
	if (token) {
		try {
			const { payload } = await jwtVerify(token, secret, {
				algorithms: ["HS256"],
			});
			if (isRole(payload.role)) role = payload.role;
		} catch {}
	}

	if (role && AUTH_PAGES.includes(pathname)) {
		return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
	}

	if (pathname.startsWith("/dashboard")) {
		if (!role && hasRefresh) return NextResponse.next();

		if (!role) {
			const url = new URL("/login", req.url);
			url.searchParams.set("next", pathname);
			return NextResponse.redirect(url);
		}

		if (pathname === "/dashboard") {
			return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
		}

		const section = pathname.split("/")[2]?.toUpperCase();
		if (isRole(section) && section !== role) {
			return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/dashboard/:path*", "/login", "/signup"],
};
