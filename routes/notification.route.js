import express from "express";
import { getMyNotifications, statistics } from "../controllers/notification.controller.js";
import { auth, authAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getMyNotifications);
router.get("/statistics", statistics)

export default router;