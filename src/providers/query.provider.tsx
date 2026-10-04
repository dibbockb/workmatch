"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                gcTime: 5 * 60 * 1000, // 5 minutes
                retry: (failureCount, error) => {
                    const status = (error as { statusCode?: number }).statusCode;
                    if (status && status >= 400 && status < 500) return false;
                    return failureCount < 2;
                },
                retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
            },
            mutations: {
                retry: false,
            },
        },
    });
}

export default function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => makeQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
