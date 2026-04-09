import express from "express";
import { startupOnboarding, investorOnboarding } from "../controllers/onboardingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validationMiddleware.js";
import { startupOnboardingSchema, investorOnboardingSchema } from "../utils/validation/index.js";

const router = express.Router();

router.post("/startup", protect, validateRequest(startupOnboardingSchema), startupOnboarding);
router.post("/investor", protect, validateRequest(investorOnboardingSchema), investorOnboarding);

export default router;
