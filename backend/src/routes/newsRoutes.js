import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
    getNews, 
    getTrendingNews, 
    getLatestNews 
} from "../controllers/newsController.js";
import { syncAllNewsRotated } from "../news/serpNews.service.js";

const router = express.Router();

router.get("/", protect, getNews);
router.get("/trending", protect, getTrendingNews);
router.get("/latest", protect, getLatestNews);
router.get("/category/:name", protect, (req, res) => {
    req.query.category = req.params.name;
    return getNews(req, res);
});
router.get("/search", protect, (req, res) => {
    return getNews(req, res);
});

// Admin Manual Sync
router.post("/sync", protect, async (req, res) => {
    try {
        if (req.user.role !== "ADMIN") return res.status(403).json({ success: false, message: "Unauthorized" });
        syncAllNewsRotated();
        res.status(200).json({ success: true, message: "Rotating news sync started in background" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default router;
