import mongoose, { Document, Schema, Types } from "mongoose";

// Define the Booking interface
export interface Booking extends Document {
  bookerName: string;
  slotDate: Date;
  slotTime: number;
  amount: number;
  startTime: string;
  endTime: string;
  turfId: Types.ObjectId;
}

// Define the Mongoose schema
const bookingSchema: Schema = new Schema<Booking>(
  {
    bookerName: {
      type: String,
      required: true,
    },
    slotDate: {
      type: Date,
      required: true,
    },
    slotTime: {
      type: Number,
      required: true,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    turfId: {
      type: Schema.Types.ObjectId,
      ref: "Turf",
      required: true,}
  },
  { timestamps: true }
);

// Create the Mongoose model
const Booking = mongoose.model<Booking>("Booking", bookingSchema);

export default Booking;
