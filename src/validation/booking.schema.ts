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

interface BookingPayload {
  type: "UPCOMING" | "PREVIOUS" | "CANCELLED";
  bookingId: string | null;
  limit:number;
  offset:number;
  slotDate: string | null;
  bookingDate: string | null;
}

export const getAllBookingsSchema = Joi.object<BookingPayload>({
  type: Joi.string()
    .valid("UPCOMING", "PREVIOUS", "CANCELLED")
    .required()
    .label("Type"),
    bookingId: Joi.alternatives().try(Joi.string(), Joi.valid(null)).label("Booking ID"),
    limit: Joi.number().integer().positive().required().label("Limit"),
    offset: Joi.number().integer().positive().required().label("Offset"),
    slotDate: Joi.alternatives().try(Joi.string(), Joi.valid(null)).label("Slot Date"),
    bookingDate: Joi.alternatives().try(Joi.string(), Joi.valid(null)).label("Booking Date"),
});
