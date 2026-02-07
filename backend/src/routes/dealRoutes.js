import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getMyDeals,
    createDeal,
    updateDealStage,
    deleteDeal
} from "../controllers/dealController.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyDeals);
router.post("/", createDeal);
router.put("/:dealId/stage", updateDealStage);
router.delete("/:dealId", deleteDeal);

export default router;
