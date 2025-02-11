import { Router } from "express";
import {
  checkAvailability,
  createBooking,
  deleteBooking,
  getAllBookings,
  getBookingStats,
  getTurfName,
  updateBooking,
} from "../controllers/booking.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router();

// Define routes
router.post("/createbooking", auth, createBooking);
router.put("/updatebooking/:bookingId", auth, updateBooking);
router.delete("/deletebooking/:bookingId", auth, deleteBooking);
router.get("/turfname", auth, getTurfName);
router.post("/bookings", auth, getAllBookings);
router.post("/check-availability", auth, checkAvailability);
router.get("/statistics", auth, getBookingStats);

export default router;
