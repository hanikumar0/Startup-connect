import express from "express";
import {
    toggleSave,
    deleteSavedItem,
    toggleFavorite,
    togglePin,
    getSavedItems,
    getSavedStats,
    exportSavedItems,
    createWatchlist,
    getWatchlists,
    addToWatchlist,
    trackRecent,
    getRecentItems,
} from "../controllers/saveController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Stats & Export  (must be BEFORE /:id routes)
router.get("/stats", getSavedStats);
router.get("/export", exportSavedItems);

// Watchlist  (must be BEFORE /:id routes)
router.post("/watchlist", createWatchlist);
router.get("/watchlist", getWatchlists);
router.post("/watchlist/:id/add", addToWatchlist);

// Recently Viewed  (must be BEFORE /:id routes)
router.post("/recent", trackRecent);
router.get("/recent", getRecentItems);

// Save / Bookmark - dynamic /:id routes last
router.post("/", toggleSave);
router.get("/", getSavedItems);
router.delete("/:id", deleteSavedItem);
router.put("/:id/favorite", toggleFavorite);
router.put("/:id/pin", togglePin);

export default router;
