import Startup from "../models/Startup.js";
import Investor from "../models/Investor.js";

/**
 * Deduplication Service
 * Checks for existing records to avoid duplicates.
 */
class DeduplicationService {
    /**
     * Find existing startup by website, domain or name
     */
    async findExistingStartup(data) {
        const { website, startupName } = data;
        
        let query = [];
        
        if (website) {
            const domain = this.extractDomain(website);
            if (domain) {
                query.push({ website: { $regex: domain, $options: 'i' } });
            }
        }
        
        if (startupName) {
            query.push({ startupName: { $regex: `^${startupName}$`, $options: 'i' } });
        }
        
        if (query.length === 0) return null;
        
        return await Startup.findOne({ $or: query });
    }

    /**
     * Find existing investor by website, firm name or name
     */
    async findExistingInvestor(data) {
        const { website, investorName, firmName } = data;
        
        let query = [];
        
        if (website) {
            const domain = this.extractDomain(website);
            if (domain) {
                query.push({ website: { $regex: domain, $options: 'i' } });
            }
        }
        
        if (investorName) {
            query.push({ investorName: { $regex: `^${investorName}$`, $options: 'i' } });
        }
        
        if (firmName) {
            query.push({ firmName: { $regex: `^${firmName}$`, $options: 'i' } });
        }
        
        if (query.length === 0) return null;
        
        return await Investor.findOne({ $or: query });
    }

    /**
     * Extract domain from URL for comparison
     */
    extractDomain(url) {
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            return domain;
        } catch (e) {
            return null;
        }
    }
}

export default new DeduplicationService();
