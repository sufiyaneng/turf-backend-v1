import BadRequestError from "../middlewares/BadRequestError";
import {
  bookingSchema,
  checkAvailabilitySchema,
  getAllBookingsSchema,
} from "../validation/booking.schema";
import Booking from "../models/booking.model";
import { Request, Response, NextFunction } from "express";
import { generateTimeSlots, isOverlapping } from "../utils";
import moment from "moment-timezone";
import Turf from "../models/turf.model";
import { ITurf } from "../models/turf.model";

// creating a booking
export const createBooking = async (req: Request, res: Response) => {
  const { error, value } = bookingSchema.validate(req.body);
  if (error) {
    throw new BadRequestError({ code: 400, message: error.message });
  }

  const newBooking = new Booking({ ...value, turfId: req.user.turfId });
  const savedBooking = await newBooking.save();

  res.status(201).json({
    message: "Booking created successfully",
    data: savedBooking,
  });
};

// Update Booking
export const updateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { bookingId } = req.params;
  const { error, value } = bookingSchema.validate(req.body);
  if (error) {
    throw new BadRequestError({ code: 400, message: error.message });
  }

  const updatedBooking = await Booking.findByIdAndUpdate(bookingId, value);
  if (!updatedBooking) {
    throw new BadRequestError({ code: 404, message: "Booking not found" });
  }

  res.status(201).json({
    message: "Booking updated successfully",
    data: updatedBooking,
  });
};

// Delete Booking
export const deleteBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  const deletedBooking = await Booking.findByIdAndDelete(bookingId);
  if (!deletedBooking) {
    throw new BadRequestError({ code: 404, message: "Booking not found" });
  }

  res.status(200).json({
    message: "Booking deleted successfully",
  });
};

export const getTurfName = async (req: Request, res: Response) => {
  const { turfId } = req.user;

  const turf = await Turf.findById(turfId);
  if (!turf) {
    throw new BadRequestError({ code: 404, message: "Turf not found" });
  }

  const { name } = turf as ITurf;
  res.status(200).json({
    data: {
      turfName: turf.name,
    },
  });
};

export const getAllBookings = async (req: Request, res: Response) => {
  const { error, value } = getAllBookingsSchema.validate(req.body);
  if (error) {
    throw new BadRequestError({ code: 400, message: error.details[0].message });
  }
  const { type, slotDate } = value;

  const isoDate = moment.utc(slotDate, "DD-MM-YYYY").toISOString();

  const query = {
    slotDate: isoDate,
  };

  const response = await Booking.find(query);
  const cTime = moment().format("HH:mm");

  const bookings = response?.filter((booking: any) => {
    if (type.toString().toUpperCase() === "UPCOMING") {
      return booking.startTime > cTime;
    } else {
      return booking.startTime < cTime;
    }
  });

  res.status(200).json(bookings);
};

export const checkAvailability = async (req: Request, res: Response) => {
  const { value, error } = checkAvailabilitySchema.validate(req.body);
  if (error)
    throw new BadRequestError({ code: 400, message: error.details[0].message });

  const allPossibleSlots = generateTimeSlots("08:00", "00:00", value.hours);
  const bookings = await Booking.find({
    slotDate: moment.utc(value.slotDate, "YYYY-MM-DD").toDate(),
  });

  const availableSlots = allPossibleSlots.filter((slot: any) => {
    return !bookings.some((booking) => {
      return isOverlapping(
        slot.startTime,
        slot.endTime,
        booking.startTime,
        booking.endTime
      );
    });
  });

  res.status(200).json({ slots: availableSlots });
};

export const getBookingStats = async (req: Request, res: Response) => {
  const todayDate = moment().tz("UTC").startOf("day").toDate();
  const tomorrowDate = moment()
    .tz("UTC")
    .add(1, "days")
    .startOf("day")
    .toDate();
  const yesterdayDate = moment()
    .tz("UTC")
    .subtract(1, "days")
    .startOf("day")
    .toDate();

  const [todaysBookings, tomorrowsBookings, yesterdaysBookings] =
    await Promise.all([
      Booking.countDocuments({ slotDate: { $eq: todayDate } }),
      Booking.countDocuments({ slotDate: { $eq: tomorrowDate } }),
      Booking.countDocuments({ slotDate: { $eq: yesterdayDate } }),
    ]);

  const now = moment().format("HH:mm");
  const liveBooking = await Booking.findOne({
    slotDate: todayDate,
    startTime: { $lte: now },
    endTime: { $gte: now },
  });
  const response: any[] = [
    { title: "Today's Booking", count: todaysBookings },
    { title: "Tomorrow Booking", count: tomorrowsBookings },
    { title: "Yesterday Booking", count: yesterdaysBookings },
  ];

  // Add live booking if exists
  if (liveBooking) {
    response.push({
      bookerName: liveBooking.bookerName,
      startTime: liveBooking.startTime,
      endTime: liveBooking.endTime,
      status: "Live",
    });
  }

  res.status(200).json(response);
};
