import express from "express";
import { auth, authAdmin } from "../middleware/auth.js";
import {
    createResource,
    getResources,
    addAvailability,
    addBlackout,
    getAvailability,
    getResourceAvailability,
    getResourceCount
} from "../controllers/resource.controller.js";

const router = express.Router();

router.post("/", auth, createResource);
router.get("/", auth, getResources);
router.post("/availability", auth, addAvailability);
router.get("/:resource_id/availability", auth, getAvailability);
router.get("/:resource_id/availability/date", auth, getResourceAvailability);
router.post("/blackout", auth, addBlackout);
router.get("/count", authAdmin, getResourceCount);

export default router;