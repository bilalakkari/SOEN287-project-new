import express from "express";
import { sendBroadcastEmail } from "../controllers/admin.controller.js";

const router = express.Router();
router.post("/broadcast", sendBroadcastEmail);

export default router;