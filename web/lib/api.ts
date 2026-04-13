import { useAuthStore } from "./store";

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Simple in-memory response cache for GET requests.
 * Prevents redundant API calls for identical requests within the TTL.
 */
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds

function getCachedResponse(key: string): any | null {
    const cached = responseCache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > CACHE_TTL) {
        responseCache.delete(key);
        return null;
    }
    return cached.data;
}

function setCachedResponse(key: string, data: any): void {
    // Limit cache size to prevent memory leaks
    if (responseCache.size > 100) {
        const firstKey = responseCache.keys().next().value;
        if (firstKey) responseCache.delete(firstKey);
    }
    responseCache.set(key, { data, timestamp: Date.now() });
}

/** Clear all cached responses (useful after mutations) */
export function clearApiCache(): void {
    responseCache.clear();
}

/**
 * Production-ready API fetch wrapper with:
 * - Automatic token injection
 * - Retry logic with exponential backoff
 * - Timeout protection
 * - Graceful error handling (never crashes the UI)
 */
export async function apiFetch(
    endpoint: string,
    options: RequestInit & { timeout?: number } = {},
    retries: number = MAX_RETRIES
): Promise<Response> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

    const { token } = useAuthStore.getState();

    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        "bypass-tunnel-reminder": "true",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string>),
    };

    const abortController = new AbortController();
    if (options.signal) {
        options.signal.addEventListener("abort", () => abortController.abort(options.signal?.reason), { once: true });
        if (options.signal.aborted) abortController.abort(options.signal.reason);
    }
    const signal = abortController.signal;
    
    // Configurable timeout
    const timeoutDuration = options.timeout ?? 30000;
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (timeoutDuration > 0) {
        timeoutId = setTimeout(() => abortController.abort("timeout"), timeoutDuration);
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal,
        });

        if (timeoutId) clearTimeout(timeoutId);

        // Handle auth errors globally
        if (response.status === 401 && typeof window !== "undefined") {
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
                console.warn("Session expired, redirecting to login...");
                useAuthStore.getState().logout();
                window.location.href = "/login?expired=true";
            }
        }

        if (!response.ok) {
            console.warn(`API [${response.status}] ${endpoint}`);
        }

        return response;
    } catch (err: any) {
        if (timeoutId) clearTimeout(timeoutId);

        const isTimeout = err.name === "AbortError" && (err.reason === "timeout" || signal?.reason === "timeout");
        const isAbort = err.name === "AbortError";

        // Retry on network errors (not on intentional abort/timeout)
        if (retries > 0 && !isAbort) {
            console.warn(`Retrying ${endpoint} (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`);
            await new Promise((r) => setTimeout(r, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
            return apiFetch(endpoint, options, retries - 1);
        }

        if (isTimeout) {
            console.error(`API Timeout [${url}]: Request took longer than 30s.`);
        } else if (isAbort) {
            console.warn(`API Aborted [${url}]: Signal was cancelled (Reason: ${signal?.reason || "unspecified"}).`);
        } else {
            console.error(`API Error [${url}]:`, err.message || err);
        }

        // Return a mock Response so callers don't crash
        return new Response(
            JSON.stringify({
                success: false,
                message: isTimeout
                    ? "Request timed out. Please try again."
                    : isAbort 
                        ? "Request was cancelled."
                        : "Network error. Please check your connection.",
            }),
            {
                status: isTimeout ? 408 : isAbort ? 499 : 503,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}

/**
 * Convenience wrapper for safe JSON parsing.
 * Returns a default value if the response isn't valid JSON.
 * Supports built-in caching for GET requests.
 */
export async function apiFetchJSON<T = any>(
    endpoint: string,
    options: RequestInit & { timeout?: number } = {},
    defaultValue: T = { success: false } as T,
    useCache: boolean = false
): Promise<T> {
    try {
        // Check cache for GET requests
        const method = (options.method || "GET").toUpperCase();
        if (useCache && method === "GET") {
            const cached = getCachedResponse(endpoint);
            if (cached) return cached as T;
        }

        const response = await apiFetch(endpoint, options);
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
            const data = await response.json();

            // Cache successful GET responses
            if (useCache && method === "GET" && data?.success !== false) {
                setCachedResponse(endpoint, data);
            }

            return data;
        }

        return defaultValue;
    } catch {
        return defaultValue;
    }
}
