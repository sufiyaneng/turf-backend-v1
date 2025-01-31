import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import CryptoJS from "crypto-js";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string
): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST as string,
    port: Number(process.env.MAILTRAP_PORT),
    auth: {
      user: process.env.MAILTRAP_USER as string,
      pass: process.env.MAILTRAP_PASS as string,
    },
  });

  const mailOptions = {
    from: '"Synkerhub" hello@demomailtrap.com',
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

export const generateTokens = ({
  turfId,
  email,
  userId,
}: {
  turfId: Types.ObjectId;
  email: string;
  userId: Types.ObjectId;
}) => {
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined");
  }
  const accessToken = jwt.sign(
    { turfId, email, userId },
    process.env.SECRET_KEY,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { turfId, email, userId },
    process.env.SECRET_KEY,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
  return { accessToken, refreshToken };
};

export const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);

  // 1. Return the date without time
  const currDate = new Date(date.setUTCHours(0, 0, 0, 0)).toISOString();

  // 2. Return the time with AM/PM, without minutes
  const hours = date.getUTCHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  const currTime = `${hours % 12 || 12}${ampm}`;

  return {
    currDate,
    currTime,
  };
};

export const convertUtcToIst = (utcIsoDate: string) => {
  // Parse the UTC ISO date
  const utcDate = new Date(utcIsoDate);

  // Get IST offset in milliseconds (+5:30 hours)
  const istOffset = 5.5 * 60 * 60 * 1000;

  // Convert UTC time to IST
  const istDate = new Date(utcDate.getTime() + istOffset);

  // Format IST date back to ISO format
  const istIsoDate = istDate.toISOString().replace("Z", "+05:30");

  return istIsoDate;
};

export const generateVerificationCode = (length = 6) => {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2, 15);
  const hash = CryptoJS.SHA256(timestamp + randomString).toString(
    CryptoJS.enc.Hex
  );

  return hash.substring(0, length).toUpperCase(); // Ensuring uppercase for readability
};
