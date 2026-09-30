import { environmentManager, QueryClient, QueryClientProvider, } from "@tanstack/react-query"
import { ReactNode } from "react"

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000
            }
        }
    })
}

let browserQueryCient: QueryClient | undefined = undefined

function getQueryClient() {
    if (environmentManager.isServer()) {
        return makeQueryClient()
    }
    else {
        if (!browserQueryCient) {
            browserQueryCient = makeQueryClient()
        }
    }
    return browserQueryCient;
}

export default function QueryProvider({ children }: { children: ReactNode }) {
    const queryClient = getQueryClient()

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}