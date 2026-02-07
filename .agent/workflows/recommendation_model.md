---
description: AI Recommendation Model using MongoDB data
---

## Overview
Create an AI-powered recommendation engine for **Startup Connect** that pulls user and startup data from MongoDB, generates vector embeddings, computes similarity, and serves recommendations via a new API endpoint.

## Prerequisites
- Node.js (v18+) installed
- Existing MongoDB collections: `users`, `startupprofiles`, `investorprofiles`
- Optional: Python environment for advanced embeddings (e.g., `sentence-transformers`) or use a hosted service like OpenAI embeddings.

## Steps
1. **Install Dependencies**
   ```bash
   npm install mongoose @tensorflow/tfjs-node cosine-similarity dotenv
   # If using OpenAI embeddings
   npm install openai
   ```
   // turbo
2. **Create Embedding Utility**
   - Add a new file `backend/src/utils/embedding.js` that exports a function `getEmbedding(text)`.
   - If using OpenAI, call the embeddings API; otherwise, load a local TensorFlow model.
   // turbo
3. **Add Recommendation Service**
   - Create `backend/src/services/recommendationService.js`.
   - Implement:
     - `fetchProfiles()` – pull relevant fields from MongoDB.
     - `generateEmbeddings(profiles)` – compute embeddings for each profile and store them in a new collection `profileEmbeddings` (or cache in memory).
     - `findSimilar(userId, topK)` – compute cosine similarity between the target user’s embedding and others, return top‑K matches.
   // turbo
4. **Create Controller**
   - Add `backend/src/controllers/recommendationController.js` with an endpoint `GET /recommendations/:userId?limit=5` that calls the service and returns JSON.
   // turbo
5. **Register Route**
   - In `backend/src/routes/userRoutes.js` add:
     ```javascript
     import { getRecommendations } from "../controllers/recommendationController.js";
     router.get("/recommendations/:userId", protect, getRecommendations);
     ```
   // turbo
6. **Run a One‑Time Embedding Job**
   - Create a script `backend/scripts/generate_embeddings.js` that iterates over all profiles and populates the `profileEmbeddings` collection.
   - Add to `package.json`:
     ```json
     "scripts": { "embeddings": "node scripts/generate_embeddings.js" }
     ```
   // turbo
7. **Test the Endpoint**
   - Start the server (`npm run dev`).
   - Call `GET http://localhost:5000/api/recommendations/<userId>?limit=5` and verify JSON response.
   // turbo
8. **Add Frontend Integration**
   - In the dashboard component, fetch recommendations and display them with a card UI (use existing design system).
   // turbo
9. **Schedule Periodic Updates**
   - Use `node-cron` or a cloud scheduler to refresh embeddings nightly.
   // turbo
10. **Documentation & SEO**
    - Update API docs and add OpenAPI spec for the new endpoint.
    - Ensure the page that shows recommendations has proper `<title>` and meta description.

## Notes
- Keep embeddings in a separate collection to avoid heavy reads on the main profile collections.
- For a production‑grade system, consider vector databases like Pinecone or Milvus.
- Monitor latency; caching recent embeddings in Redis can improve response times.

---

*This workflow provides a complete end‑to‑end path to add an AI recommendation model powered by your MongoDB data.*
