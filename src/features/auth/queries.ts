import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getMe, login, logout, register } from "./api"
import { useRouter } from "next/navigation";

export const authKeys = {
    all: ["auth"] as const,
    me: () => [...authKeys.all, "me"] as const,
}

export function useMe() {
    return useQuery({
        queryKey: authKeys.me(),
        queryFn: getMe,
        retry: false,
        staleTime: 5 * 6 * 1000
    }
    )
};

export function useLogin() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: login,
        onSuccess:
            () => {
                qc.invalidateQueries({ queryKey: authKeys.me() })
            }
    })
}

export function useRegister() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: register,
        onSuccess:
            () => {
                qc.invalidateQueries({ queryKey: authKeys.me() })
            }
    })
}

export function useLogout() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            qc.setQueryData(authKeys.me(), null)
        }
    })
}

export function useSignOut() {
    const router = useRouter();
    const qc = useQueryClient();
    const logout = useLogout();

    async function signOut() {
        try { await logout.mutateAsync(); }
        finally { qc.clear(); router.replace("/login"); router.refresh(); }
    }
    return { signOut, isPending: logout.isPending };
}