import { ofetch } from "ofetch";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

export const $fetch = ofetch.create({
    baseURL: serverUrl,
    retry: 1,
    timeout: 60 * 1000,
    onResponse({ response }) {
        if (process.env.NODE_ENV === "development") {
            console.log(`[API] ${response.status} ${response.url}`);
        }
    },
    onResponseError({ response, request }) {
        console.error(
            `[API Error] ${response.status} @@@ ${response.url}`
        );

        if (response.status === 401) {
            if (typeof window !== "undefined") {
                // Clear auth & redirect to login
                // e.g., redirect('/login')
            }
        }
    },
});

export default $fetch;