import express from "express";
import { requestClaim, approveClaim } from "../controllers/claimController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/:type/:id", requestClaim);
router.put("/approve/:type/:id", authorizeRoles("admin", "superadmin"), approveClaim);

export default router;
