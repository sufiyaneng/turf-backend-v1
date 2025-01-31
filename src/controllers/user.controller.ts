import mongoose, { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User, { IUser } from "../models/user.model";
import Turf from "../models/turf.model";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
} from "../validation/user.schema";
import BadRequestError from "../middlewares/BadRequestError";
import { generateTokens, generateVerificationCode, sendEmail } from "../utils";

export const signup = async (req: Request, res: Response) => {
  const { error, value } = signupSchema.validate(req.body);
  if (error) {
    throw new BadRequestError({
      code: 400,
      message: error.details[0].message,
    });
  }

  const existingUser = await User.findOne({ email: value.email });
  if (existingUser) {
    throw new BadRequestError({ code: 400, message: "User already exists" });
  }

  const newUser = new User({
    ...value,
    turfId: new mongoose.Types.ObjectId(),
  });
  await newUser.save();

  const newTurf = new Turf({
    name: newUser.turfName,
    address: "Default Address",
    openAt: "08:00",
    closeAt: "00:00",
    daysOpen: [1, 2, 3, 4, 5, 6, 7], //1 is monday
    user: newUser._id,
  });
  await newTurf.save();

  const verificationCode = generateVerificationCode(12);
  await newUser.updateOne({ turfId: newTurf._id, verificationCode });
  sendEmail(
    "makwork985@gmail.com",
    "Email Verification",
    `<html><a href="http://localhost:3000/auth/verify/${newUser._id}/${verificationCode}">Verify Now</a></html>`
  );
  const { password, ...userResponse } = newUser.toObject();

  res.status(201).json({
    user: userResponse,
  });
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { error, value } = verifyEmailSchema.validate(req.body);
  if (error) {
    throw new BadRequestError({
      code: 400,
      message: error.details[0].message,
    });
  }
  const { userId, verificationCode } = value;

  const user = (await User.findOne({
    _id: userId,
    verificationCode,
  })) as IUser;
  if (!user) {
    throw new BadRequestError({
      code: 400,
      message: "Invalid verification code.",
    });
  }

  user.isVerified = true;
  user.verificationCode = "";
  await user.save();

  res.status(200).json({ message: "Email verified!" });
};

export const login = async (req: Request, res: Response) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    throw new BadRequestError({
      code: 400,
      message: error.details[0].message,
    });
  }

  const { email, password } = value;

  const user = (await User.findOne({ email })) as IUser;
  if (!user) {
    throw new BadRequestError({
      code: 404,
      message: "User does not exist",
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new BadRequestError({ code: 400, message: "Invalid  password." });
  }

  if (!user.isVerified) {
    const verificationCode = generateVerificationCode(12);
    sendEmail(
      "makwork985@gmail.com",
      "Email Verification",
      `<html><a href="http://localhost:3000/auth/verify/${user._id}/${verificationCode}">Verify Now</a></html>`
    );
    throw new BadRequestError({
      code: 400,
      message: "Verification link has been sent to your mail",
    });
  }

  const {
    accessToken,
    refreshToken,
  }: { accessToken: string; refreshToken: string } = generateTokens({
    turfId: user.turfId as Types.ObjectId,
    email: user.email,
    userId: user._id as Types.ObjectId,
  });

  const { password: pwd, ...userResponse } = user.toObject();

  res.status(200).json({
    token: { accessToken, refreshToken },
    user: userResponse,
  });
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { error, value } = forgotPasswordSchema.validate(req.body);
  if (error) {
    throw new BadRequestError({ code: 400, message: error.details[0].message });
  }

  const { email } = value;

  const user = await User.findOne({ email });
  if (!user)
    throw new BadRequestError({
      code: 404,
      message: "User does not exist with this email.",
    });

  const resetPassCode = generateVerificationCode(12);
  user.resetPassCode = resetPassCode;
  await user.save();

  sendEmail(
    "makwork985@gmail.com",
    "Email Verification",
    `<html><a href="http://localhost:3000/auth/reset-password/${user._id}/${resetPassCode}">Reset Password</a></html>`
  );

  res.status(200).json({ message: "Password reset link sent to your mail." });
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { error, value }: { error: any; value: any } =
    resetPasswordSchema.validate(req.body);
  if (error) {
    throw new BadRequestError({ code: 400, message: error.details[0].message });
  }
  const { userId, password, resetPassCode } = value;
  try {
    const user = (await User.findOne({
      _id: userId,
      resetPassCode,
    })) as IUser;
    user.password = password;
    console.log(user);
    await user.save();
    res.status(200).json({ message: "Password reset successful." });
  } catch (err: any) {
    throw new BadRequestError({ code: 500, message: "Internal server error." });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new BadRequestError({
      code: 400,
      message: "Refresh token is required.",
    });
  }

  try {
    // Decode and verify the refresh token using SECRET_KEY
    const decoded = jwt.verify(refreshToken, process.env.SECRET_KEY!) as {
      turfId: string;
      email: string;
      userId: string;
    };

    // Check if the user exists in the database
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new BadRequestError({ code: 404, message: "User not found." });
    }

    // Generate new tokens using the existing payload
    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      turfId: user.turfId,
      email: user.email,
      userId: user._id as Types.ObjectId,
    });

    // Send the new tokens to the client
    res
      .status(200)
      .json({ token: { accessToken, refreshToken: newRefreshToken } });
  } catch (err) {
    throw new BadRequestError({
      code: 401,
      message: "Invalid or expired refresh token.",
    });
  }
};
