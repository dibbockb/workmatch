import {
    useQuery,
    useMutation,
    type UseQueryOptions,
    type UseMutationOptions,
} from "@tanstack/react-query";
import $fetch from "@/lib/api-client";

export function useFetch<T>(
    url: string | null,
    options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">) {
    return useQuery({
        queryKey: [url],
        queryFn: async () => {
            if (!url) throw new Error("URL is required");
            return $fetch<T>(url);
        },
        enabled: !!url,
        ...options,
    });
}

export function useFetchMutation<
    TData,
    TVariables extends BodyInit | Record<string, any> | null | undefined = Record<string, any>
>(
    method: "POST" | "PUT" | "DELETE" | "PATCH",
    url: string | ((vars: TVariables) => string),
    options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
    return useMutation({
        mutationFn: async (variables: TVariables) => {
            const finalUrl = typeof url === "function" ? url(variables) : url;
            return $fetch<TData>(finalUrl, {
                method,
                body: variables,
            });
        },
        ...options,
    });
}
