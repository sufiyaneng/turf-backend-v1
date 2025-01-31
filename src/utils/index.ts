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


//generate slots
export function generateTimeSlots(startTime: string, endTime: string, hours: number) {
  const slots = [];

  // Helper to convert 24hr format to UTC Date object
  function timeToDate(time: string) {
    const [hour, minute] = time.split(":").map(Number);
    return new Date(Date.UTC(1970, 0, 1, hour, minute)); // Force UTC time
  }

  // Helper to convert UTC Date object to 24hr format
  function format24(date: Date) {
    return date.toISOString().slice(11, 16);
  }

  // Helper to convert UTC Date object to 12hr format with AM/PM
  function format12(date: Date) {
    let hours = date.getUTCHours(); // Use UTC hours
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, "0")}:${minutes}${period}`;
  }

  let start = timeToDate(startTime);
  const end = timeToDate(endTime === "00:00" ? "24:00" : endTime); // Handle midnight as 24:00
  const increment = hours * 60 * 60 * 1000; // Convert hours to milliseconds

  while (start.getTime() + increment <= end.getTime()) {
    const next = new Date(start.getTime() + increment);
    const value = `${format24(start)}-${format24(next)}`;
    const label = `${format12(start)} - ${format12(next)}`;
    const startTime = `${format24(start)}`;
    const endTime = `${format24(next)}`;

    slots.push({ value, label, startTime, endTime });
    
    // Increment start time correctly in UTC
    start = new Date(start.getTime() + 60 * 60 * 1000);
  }

  return slots;
}

 // Convert time to a 24-hour format in minutes for easier comparison
export const convertTimeToMinutes = (time:any) => {
  const [hours, minutes] = time.split(':').map((num:any) => parseInt(num, 10));
  return hours * 60 + minutes;
 }
 // Function to check if two time ranges overlap considering midnight
 
 export const isOverlapping = (start1:any, end1:any, start2:any, end2:any) => {
  // Convert times to minutes for easier comparison
  let start1Minutes = convertTimeToMinutes(start1);
  let end1Minutes = convertTimeToMinutes(end1);
  let start2Minutes = convertTimeToMinutes(start2);
  let end2Minutes = convertTimeToMinutes(end2);
  // Handle midnight wraparound by comparing as 24-hour times
  if (end1Minutes < start1Minutes) end1Minutes += 1440; // Wrap around if
 
  if (end2Minutes < start2Minutes) end2Minutes += 1440; // Wrap around if
 
  return (start1Minutes < end2Minutes && start2Minutes < end1Minutes);
 }
