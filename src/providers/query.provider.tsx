"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,           // 1 minute
                gcTime: 5 * 60 * 1000,          // 5 minutes
                retry: 1,
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            },
            mutations: {
                retry: 1,
                retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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