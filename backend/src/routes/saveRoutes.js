import express from "express";
import { 
    toggleSave, 
    toggleFavorite,
    getSavedItems,
    createWatchlist,
    getWatchlists,
    addToWatchlist,
    trackRecent,
    getRecentItems
} from "../controllers/saveController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// Save / Bookmark
router.post("/", toggleSave);
router.get("/", getSavedItems);
router.put("/:id/favorite", toggleFavorite);

// Watchlist
router.post("/watchlist", createWatchlist);
router.get("/watchlist", getWatchlists);
router.post("/watchlist/:id/add", addToWatchlist);

// Recently Viewed
router.post("/recent", trackRecent);
router.get("/recent", getRecentItems);

export default router;
