import express from "express";
import { discoverStartups, discoverInvestors, globalSearch } from "../controllers/discoverController.js";

const router = express.Router();

router.get("/startups", discoverStartups);
router.get("/investors", discoverInvestors);
router.get("/search", globalSearch);

export default router;
