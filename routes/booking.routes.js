import express from "express";
import { auth, authAdmin } from "../middleware/auth.js";
import { createBooking, getMyBookings, deleteBooking, getNextBooking, getPendingRequests, approveBooking, denyBooking, getRequestHistory } from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", auth, createBooking);
router.get("/mine", auth, getMyBookings);
router.delete("/:booking_id", auth, deleteBooking);
router.get("/next", auth, getNextBooking);
router.get("/admin/pending", authAdmin, getPendingRequests);
router.post("/:id/approve", authAdmin, approveBooking);
router.post("/:id/deny", authAdmin, denyBooking);
router.get("/admin/history", authAdmin, getRequestHistory);

export default router;