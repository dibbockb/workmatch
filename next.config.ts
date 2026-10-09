import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: true,

	async rewrites() {
		const origin = process.env.SERVER_URL;
		if (!origin) return [];
		return [{ source: "/api/:path*", destination: `${origin}/:path*` }];
	},
};

export default nextConfig;
