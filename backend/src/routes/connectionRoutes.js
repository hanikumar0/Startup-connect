import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
    sendRequest, 
    respondToRequest, 
    getMyConnections, 
    getPendingRequests 
} from "../controllers/connectionController.js";

const router = express.Router();

router.use(protect);

router.post("/request", sendRequest);
router.put("/respond/:id", respondToRequest);
router.get("/", getMyConnections);
router.get("/pending", getPendingRequests);

export default router;
