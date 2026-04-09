# Implementation Plan - Auto Data Ingestion System

Build a complete auto data ingestion system that imports startups and investors from Product Hunt, GitHub, Hacker News, OpenVC, and Investor websites.

## 1. Database Model Updates
- [ ] Update `backend/src/models/Startup.js` with missing fields (`githubStars`, `source`, `sourceUrl`, `isClaimed`, `lastUpdated`).
- [ ] Update `backend/src/models/Investor.js` with missing fields (`firm`, `checkSizeMin`, `checkSizeMax`, `portfolio`, `thesis`, `source`, `isClaimed`, `lastUpdated`).

## 2. Enrichment & Deduplication Services
- [ ] Create `backend/src/services/enrichmentService.js` (Clearbit Logo, Microlink/OpenGraph).
- [ ] Create `backend/src/services/deduplicationService.js` (Match by domain/website/name).

## 3. Scraper Services
- [ ] Create `backend/src/scrapers/producthunt.js`.
- [ ] Create `backend/src/scrapers/github.js`.
- [ ] Create `backend/src/scrapers/hackernews.js`.
- [ ] Create `backend/src/scrapers/openvc.js`.
- [ ] Create `backend/src/scrapers/investorWebsite.js`.

## 4. Import Routes & Controller
- [ ] Create `backend/src/controllers/importController.js`.
- [ ] Create `backend/src/routes/importRoutes.js` and register it in `app.js`.

## 5. Scheduler
- [ ] Create `backend/src/services/schedulerService.js` using `node-cron`.
- [ ] Initialize scheduler in `server.js`.

## 6. Admin Panel / Logging
- [ ] Implement simple logging for import activities.
- [ ] Add admin routes to trigger imports manually.

## 7. Matching Service Integration
- [ ] Ensure `matchingService.recalculateMatches()` is called after imports.

## Environment Variables Needed:
- `PRODUCTHUNT_TOKEN`
- `GITHUB_TOKEN`
- `CLEARBIT_URL=https://logo.clearbit.com`
- `MICROLINK_API=https://api.microlink.io`
- `CRON_IMPORT=0 */12 * * *`
