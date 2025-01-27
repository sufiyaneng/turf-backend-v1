import { Router } from "express";
import { checkAvailability, createBooking, deleteBooking, getAllBookings, getTurfName, updateBooking } from "../controllers/booking.controller";
import { auth } from "../middlewares/auth.middleware";


const router = Router();

// Define routes
router.post("/createbooking",auth, createBooking);
router.put('/updatebooking/:bookingId', auth,updateBooking);
router.delete('/deletebooking/:bookingId', auth,deleteBooking);
router.get('/turfname/:turfId',auth, getTurfName);
router.post('/bookings', auth,getAllBookings);
router.post('/check-availability', auth,checkAvailability);

export default router;
 