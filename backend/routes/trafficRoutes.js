import express from "express";
import { listPendingReports, verifyReport, getReport, getAllReports } from "../controllers/trafficController.js";
import { trafficAuth } from "../middleware/trafficAuth.js";
import { trafficLogin } from "../controllers/trafficController.js";
import { cache } from "../middleware/cacheMiddleware.js";

const router = express.Router();

router.get("/reports", trafficAuth, cache("traffic_reports", 3600), getAllReports);
router.get("/reports/pending", trafficAuth, cache("traffic_reports", 3600), listPendingReports);
router.get("/reports/:id", trafficAuth, getReport);
router.post("/reports/:id/verify", trafficAuth, verifyReport);
// router.post("/login", trafficLogin);

export default router;
