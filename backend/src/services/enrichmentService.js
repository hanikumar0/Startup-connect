import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Enrichment Service
 * Uses Clearbit for logos and Microlink for metadata enrichment.
 */
class EnrichmentService {
    constructor() {
        this.clearbitUrl = process.env.CLEARBIT_URL || "https://logo.clearbit.com";
        this.microlinkApi = "https://api.microlink.io";
    }

    /**
     * Get logo from Clearbit
     */
    async getLogo(website) {
        if (!website) return null;
        try {
            const domain = new URL(website).hostname.replace('www.', '');
            return `${this.clearbitUrl}/${domain}`;
        } catch (e) {
            return null;
        }
    }

    /**
     * Enrich data using Microlink
     */
    async enrichMetadata(url) {
        if (!url) return null;
        try {
            const response = await axios.get(`${this.microlinkApi}?url=${encodeURIComponent(url)}`);
            const { data } = response.data;
            
            return {
                description: data.description,
                logo: data.logo?.url || data.image?.url,
                title: data.title,
                publisher: data.publisher,
                lang: data.lang
            };
        } catch (error) {
            console.error(`Error enriching metadata for ${url}:`, error.message);
            return null;
        }
    }

    /**
     * Full enrichment for a startup or investor
     */
    async enrichRecord(record, type = 'startup') {
        const website = record.website;
        if (!website) return record;

        const metadata = await this.enrichMetadata(website);
        const clearbitLogo = await this.getLogo(website);

        if (metadata) {
            if (!record.description) record.description = metadata.description;
            if (!record.logo) record.logo = metadata.logo || clearbitLogo;
            if (type === 'startup' && !record.tagline) record.tagline = metadata.title;
        } else if (!record.logo) {
            record.logo = clearbitLogo;
        }

        return record;
    }
}

export default new EnrichmentService();
