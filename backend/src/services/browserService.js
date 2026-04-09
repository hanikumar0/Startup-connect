import axios from "axios";
import logger from "../config/logger.js";

/**
 * Browser Service
 * Integrated with Browserless.io to handle JavaScript-heavy sites.
 * Enables deep-web scraping of SPA and dynamic investor platforms.
 */
class BrowserService {
    constructor() {
        this.apiKey = process.env.BROWSERLESS_API_KEY;
        this.baseUrl = "https://chrome.browserless.io";
    }

    /**
     * Executes a content extraction on a dynamic URL.
     * Uses Browserless 'content' endpoint to get fully rendered HTML.
     */
    async getRenderedContent(url) {
        if (!url) return null;
        if (!this.apiKey) {
            logger.warn("[BrowserService] API Key missing. Falling back to basic request.");
            const res = await axios.get(url);
            return res.data;
        }

        try {
            logger.info(`[BrowserService] Rendering dynamic content: ${url}`);
            
            const response = await axios.post(`${this.baseUrl}/content?token=${this.apiKey}`, {
                url,
                waitFor: 3000, // Wait for JS to settle
                gotoOptions: {
                    waitUntil: 'networkidle2'
                }
            });

            return response.data;
        } catch (error) {
            logger.error({ err: error }, `[BrowserService] Render failed for ${url}`);
            // Fallback to basic axios
            const fallback = await axios.get(url);
            return fallback.data;
        }
    }

    /**
     * Executes a scraping function on a remote browser.
     * Useful for complex data extraction via Pupeteer/Playwright logic.
     */
    async scrape(url, selector = "body") {
        try {
            const response = await axios.post(`${this.baseUrl}/scrape?token=${this.apiKey}`, {
                url,
                elements: [{ selector }]
            });
            return response.data;
        } catch (error) {
            logger.error({ err: error }, "[BrowserService] Scrape failed");
            return null;
        }
    }
}

export default new BrowserService();
