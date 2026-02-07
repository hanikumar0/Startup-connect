export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

    const headers = {
        "Content-Type": "application/json",
        "bypass-tunnel-reminder": "true",
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    }).catch(err => {
        console.error(`API Fetch Error [${url}]:`, err);
        throw err;
    });

    if (!response.ok) {
        console.warn(`API Response Warning [${url}]: ${response.status} ${response.statusText}`);
    }

    return response;
}
