import express from "express";
import {
    createInvestor,
    getMyInvestor,
    updateInvestor,
    getInvestorById,
    getAllInvestors,
    uploadInvestorLogo
} from "../controllers/investorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/create", protect, authorizeRoles("investor"), createInvestor);
router.get("/me", protect, authorizeRoles("investor"), getMyInvestor);
router.put("/update", protect, authorizeRoles("investor"), updateInvestor);
router.get("/all", getAllInvestors);
router.get("/:id", getInvestorById);

router.post("/upload-logo", protect, authorizeRoles("investor"), upload.single("logo"), uploadInvestorLogo);

export default router;
