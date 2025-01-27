import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";


export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Use your email provider
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD, // Your email password or app password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

export const generateTokens = ({turfId,email,userId}:{turfId: Types.ObjectId; email: string; userId:Types.ObjectId;}) =>{
    if (!process.env.SECRET_KEY) {
        throw new Error("SECRET_KEY is not defined");
    }
    const accessToken = jwt.sign({turfId,email,userId}, process.env.SECRET_KEY, {expiresIn: process.env.ACCESS_TOKEN_EXPIRY});
    const refreshToken = jwt.sign({turfId,email,userId}, process.env.SECRET_KEY, {expiresIn: process.env.REFRESH_TOKEN_EXPIRY});
    return {accessToken, refreshToken};
}

export const formatDateTime = (dateStr:string) => {
  const date = new Date(dateStr);

  // 1. Return the date without time
  const currDate = new Date(date.setUTCHours(0, 0, 0, 0)).toISOString();

  // 2. Return the time with AM/PM, without minutes
  const hours = date.getUTCHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const currTime = `${(hours % 12 || 12)}${ampm}`;

  return {
      currDate,
      currTime
  };
}

export const convertUtcToIst = (utcIsoDate: string) => {
  // Parse the UTC ISO date
  const utcDate = new Date(utcIsoDate);

  // Get IST offset in milliseconds (+5:30 hours)
  const istOffset = 5.5 * 60 * 60 * 1000;

  // Convert UTC time to IST
  const istDate = new Date(utcDate.getTime() + istOffset);

  // Format IST date back to ISO format
  const istIsoDate = istDate.toISOString().replace('Z', '+05:30');

  return istIsoDate;
}