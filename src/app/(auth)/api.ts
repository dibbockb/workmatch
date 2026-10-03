import apiFetch from "@/lib/fetch";
import { loginSchema, registerSchema, userSchema } from "./_validation/schemas";

export async function login(data: { email: string; password: string }) {
    const validated = loginSchema.parse(data);

    return apiFetch("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(validated)
    });
}

export async function register(data: {
    name: string,
    email: string,
    password: string,
    role: "CLIENT" | "FREELANCER",
}) {
    const validated = registerSchema.parse(data);
    return apiFetch("/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(validated)
    })
}

export async function getMe() {
    const data = await apiFetch("/v1/auth/me")
    return userSchema.parse(data);
}

export async function logout() {
    return apiFetch("/v1/auth/logout", {
        method: "POST"
    })
}