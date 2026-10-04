import { type FetchError, type FetchOptions, ofetch } from "ofetch";
import { env } from "./env";

const client = ofetch.create({
    baseURL: env.NEXT_PUBLIC_SERVER_URL,
    credentials: "include",
    timeout: 60 * 1000,
    retry: 0,
    onResponse({ response }) {
        if (process.env.NODE_ENV === "development") {
            console.log(`[API] ${response.status} ${response.url}`);
        }
    },
    onResponseError({ response }) {
        console.log(`[API Error] ${response.status} @@@ ${response.url}`);
    },
});

// A 401 from these endpoints is a real answer, not an expired session.
const SKIP_REFRESH = new Set([
    "/v1/auth/login",
    "/v1/auth/register",
    "/v1/auth/refresh-token",
    "/v1/auth/logout",
]);

// Single-flight: if five requests 401 at once, only one refresh call is made
// and the other four wait for the same promise.
let refreshPromise: Promise<void> | null = null;

function refreshSession(): Promise<void> {
    refreshPromise ??= client("/v1/auth/refresh-token", { method: "POST" })
        .then(() => undefined)
        .finally(() => {
            refreshPromise = null;
        });
    return refreshPromise;
}

export async function apiFetch<T = any>(
    url: string,
    options?: FetchOptions<"json">
): Promise<T> {
    try {
        return await client<T>(url, options);
    } catch (error) {
        const status = (error as FetchError).response?.status;
        if (status !== 401 || SKIP_REFRESH.has(url)) throw error;

        try {
            await refreshSession();
        } catch {
            // Refresh failed: the session is really gone. Surface the original
            // 401 so useMe treats the user as logged out. No hard redirect
            // here, it would loop on /login.
            throw error;
        }
        return client<T>(url, options); // retry the original request once
    }
}

export default apiFetch;
