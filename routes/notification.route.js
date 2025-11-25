import express from "express";
import { getMyNotifications } from "../controllers/notification.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getMyNotifications);

export default router;