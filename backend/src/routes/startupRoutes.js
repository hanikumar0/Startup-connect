import express from "express";
import {
    createStartup,
    getMyStartup,
    updateStartup,
    getStartupById,
    getAllStartups,
    uploadLogo,
    uploadPitch
} from "../controllers/startupController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/create", protect, authorizeRoles("startup"), createStartup);
router.get("/me", protect, authorizeRoles("startup"), getMyStartup);
router.put("/update", protect, authorizeRoles("startup"), updateStartup);
router.get("/all", getAllStartups);
router.get("/:id", getStartupById);

router.post("/upload-logo", protect, authorizeRoles("startup"), upload.single("logo"), uploadLogo);
router.post("/upload-pitch", protect, authorizeRoles("startup"), upload.single("pitch"), uploadPitch);

export default router;
