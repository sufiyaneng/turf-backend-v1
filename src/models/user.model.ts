import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";
import { CallbackError } from "mongoose";

// Interface for the User
export interface IUser extends Document {
  name: string;
  email: string;
  turfName: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  verificationCode:string;
  isVerified:boolean;
  turfId: Types.ObjectId;
  userImage: string;
}

// Mongoose Schema for User
const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  turfName: { type: String, required: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationCode: { type: String },
  turfId: { type: Schema.Types.ObjectId, ref: "Turf", },
  userImage: { type: String, required: false, default: "" },
});

// Pre-save middleware to hash the password
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password is not modified

  try {
    const saltRounds = 10; // Number of salt rounds
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as CallbackError);   }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
const User = mongoose.model<IUser>("User", UserSchema);
export default User;
