const BASE_URL = "http://localhost:5000/api";

async function checkEndpoint(name, path) {
    const start = Date.now();
    try {
        const res = await fetch(`${BASE_URL}${path}`);
        const duration = Date.now() - start;
        const status = res.status;
        let data = null;
        let error = null;

        if (res.ok) {
            data = await res.json();
        } else {
            error = await res.text();
        }

        return {
            name,
            path,
            status,
            duration: `${duration}ms`,
            success: res.ok,
            records: data?.data?.length || data?.length || 0,
            error
        };
    } catch (err) {
        return {
            name,
            path,
            status: "FETCH_ERROR",
            duration: "N/A",
            success: false,
            error: err.message
        };
    }
}

async function runTests() {
    console.log("=== STARTING API HEALTH CHECK ===");
    
    const results = [
        await checkEndpoint("Discover Investors", "/discover/investors"),
        await checkEndpoint("Discover Startups", "/discover/startups"),
        await checkEndpoint("All Investors", "/investor/all"),
        await checkEndpoint("All Startups", "/startup/all")
    ];

    // Get an ID for specific testing if available
    if (results[0].success && results[0].records > 0) {
        const id = results[0].name === "Discover Investors" 
            ? (results[0].records > 0 ? (Array.isArray(results[0].data) ? results[0].data[0]._id : "no-data") : "no-id") 
            : "no-id";
        // To keep it simple, I'll just check if they are okay for now.
    }

    console.table(results.map(r => ({
        Endpoint: r.name,
        Path: r.path,
        Status: r.status,
        Time: r.duration,
        Success: r.success ? "✅" : "❌",
        Count: r.records,
        Issues: r.error ? (r.error.length > 50 ? r.error.substring(0, 50) + "..." : r.error) : "None"
    })));

    process.exit(0);
}

runTests();
