import express from "express";
import { auth } from "../middleware/auth.js";
import { register, login, getMyProfile, updateMyProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMyProfile);
router.put("/me", auth, updateMyProfile);

export default router;