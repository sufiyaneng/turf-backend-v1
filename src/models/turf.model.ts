import mongoose, { Schema, Document, Types } from "mongoose";

// Interface for Turf
export interface ITurf extends Document {
  name: string;
  address: string;
  openAt: string;
  closeAt: string;
  daysOpen: string[];
  user: Types.ObjectId; // Reference to User
}

// Mongoose Schema for Turf
const TurfSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  openAt: { type: String, required: true },
  closeAt: { type: String, required: true },
  daysOpen: { type: [String], required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Turf = mongoose.model<ITurf>("Turf", TurfSchema);
export default Turf;
