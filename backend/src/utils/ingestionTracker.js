class IngestionTracker {
    constructor(sourceName) {
        this.sourceName = sourceName;
        this.startTime = Date.now();
        this.stats = {
            fetched: 0,
            inserted: 0,
            skipped: 0,
            error: 0
        };
    }

    track(status) {
        if (this.stats[status] !== undefined) {
            this.stats[status]++;
        }
    }

    setFetched(count) {
        this.stats.fetched = count;
    }

    finish() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
        console.log(`[${this.sourceName}] Ingestion Finished | Inserted: ${this.stats.inserted} | Skipped: ${this.stats.skipped} | Errors: ${this.stats.error} | Time: ${duration}s`);
        return this.stats;
    }
}

export default IngestionTracker;
