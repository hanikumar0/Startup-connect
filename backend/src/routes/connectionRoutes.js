import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
    sendRequest, 
    respondToRequest, 
    getMyConnections, 
    getPendingRequests,
    getSentRequests,
    cancelRequest,
    removeConnection
} from "../controllers/connectionController.js";

const router = express.Router();

router.use(protect);

router.post("/request", sendRequest);
router.put("/respond/:id", respondToRequest);
router.get("/", getMyConnections);
router.get("/pending", getPendingRequests);
router.get("/sent", getSentRequests);
router.delete("/cancel/:id", cancelRequest);
router.delete("/:id", removeConnection);

export default router;
