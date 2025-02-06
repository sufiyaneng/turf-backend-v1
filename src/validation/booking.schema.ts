import { off } from 'process';
import { getAllBookings } from './../controllers/booking.controller';
import Joi from "joi";

interface Booking {
  bookerName: string;
  slotDate: Date;
  slotTime: number;
  amount: number;
  startTime: string;
  endTime: string;
}

export const bookingSchema = Joi.object<Booking>({
  bookerName: Joi.string().required().label("Booker Name"),
  slotDate: Joi.date().required().label("Slot Date"),
  slotTime: Joi.number()
    .integer()
    .positive()
    .required()
    .label("Slot Time (hours)"),
  amount: Joi.number().integer().positive().required().label("Amount"),
  startTime: Joi.string().required().label("Start Time"),
  endTime: Joi.string().required().label("End Time"),
});

export const getAllBookingsSchema = Joi.object({
  type: Joi.string()
    // .valid("UPCOMING", "PREVIOUS", "CANCELLED")
    .required()
    .label("Type"),
    slotDate: Joi.alternatives().try(Joi.string(), Joi.valid(null)).label("Slot Date"),
})

interface BookingPayload {
  type: "UPCOMING" | "PREVIOUS" | "CANCELLED";
  bookingId: string | null;
  limit:number;
  offset:number;
  slotDate: string | null;
  bookingDate: string | null;
}


interface CheckAvailabilityPayload {
  slotDate: string;
  hours: number;
}
export const checkAvailabilitySchema = Joi.object<CheckAvailabilityPayload>({
  slotDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/) // Regex for "YYYY-MM-DD" format
    .required()
    .label("Slot Date")
    .messages({
      "any.required": "Slot Date is required.", // For missing value
      "string.pattern.base": "Slot Date must be in the format 'YYYY-MM-DD'.", // For pattern mismatch
    }),
  hours: Joi.number()
    .integer()
    .positive()
    .required()
    .label("Hours"),
});