import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user.route";
import bookingRoutes from "./routes/booking.route";
import profileRoutes from "./routes/profile.route";
import cors from 'cors'
import "express-async-errors";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

const app = express();
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error.";

  res.status(statusCode).json({ message });
});

app.use("/api", userRoutes);
app.use("/api", bookingRoutes);
app.use("/api", profileRoutes);

mongoose
  .connect(process.env.MONGODB_URL || "")
  .then(() => {
    app.listen(5000, () => {
      console.log("Database connected and server started..!");
    });
  })
  .catch((err) => console.log(err));
