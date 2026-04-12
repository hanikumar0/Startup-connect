/**
 * Debug Controller for UI Performance & Lead Intelligence Monitoring
 */
export const logRenderCount = async (req, res) => {
    try {
        const { page, role, fetched, filtered, rendered } = req.body;

        console.log("\n================================");
        console.log("🚀 UI RENDER DEBUG");
        console.log(`Page:      ${page || "N/A"}`);
        console.log(`Role:      ${role || "N/A"}`);
        console.log(`Fetched:   ${fetched}`);
        console.log(`Filtered:  ${filtered}`);
        console.log(`Rendered:  ${rendered}`);
        console.log("================================\n");

        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
};
