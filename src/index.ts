import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user.route";
import bookingRoutes from "./routes/booking.route";
import "express-async-errors"
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

const app = express();

app.use(express.json());

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error.";

  res.status(statusCode).json({ message });
});

app.use("/api", userRoutes);
app.use("/api", bookingRoutes);

mongoose
  .connect(
    process.env.MONGODB_URL || "",
  )
  .then(() => {
    app.listen(5000, () => {
      console.log("Database connected and server started..!");
    });
  })
  .catch((err) => console.log(err));
