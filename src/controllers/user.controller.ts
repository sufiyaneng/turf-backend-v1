import mongoose, { Types } from 'mongoose';
import { AccessToken } from './../../node_modules/mongodb/src/cmap/auth/mongodb_oidc/machine_workflow';
import { Request, Response } from "express";
import User,{ IUser } from "../models/user.model";
import Turf from "../models/turf.model";
import otpGenerator from "otp-generator";
import { userSchema } from "../validation/user.schema";
import BadRequestError from "../middlewares/BadRequestError";
import { generateTokens } from "../utils";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      throw new BadRequestError({code : 400, message: error.details[0].message });
    }



    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) {
      throw new BadRequestError({code : 400, message : "User already exists"});
    }

    const newUser = new User({...value, turfId: new mongoose.Types.ObjectId()});
    console.log(newUser);
    await newUser.save();

    const newTurf = new Turf({
      name: newUser.turfName,
      address: "Default Address",
      openAt: "08:00 AM",
      closeAt: "10:00 PM",
      daysOpen: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      user: newUser._id,
    });

    await newTurf.save();

    await newUser.updateOne({ turfId: newTurf._id });

    const { password, ...userResponse } = newUser.toObject();

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (err: any) {
    throw new BadRequestError({code : 500, message : err.message});
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { email, code } = req.body;
  
    try {
      const user = await User.findOne({ email, verificationCode: code }) as IUser;
  
      if (!user) {
        res.status(400).json({ message: "Invalid verification code or email." });
        return;
      }
  
      user.isVerified = true;
      user.verificationCode = '';
      await user.save();
  
      res.status(200).json({ message: "Email verified successfully." });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  };

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email }) as IUser;
  
      if (!user) {
        throw new BadRequestError({code : 404, message : "User does not exist, Please register first."});
      }
  
      const isMatch = await user.comparePassword(password);
  
      if (!isMatch) {
      throw new BadRequestError({code : 400, message : "Invalid  password."});
      }
      
      const {accessToken, refreshToken} :{accessToken:string; refreshToken:string } = generateTokens({turfId: user.turfId as Types.ObjectId, email: user.email, userId: user._id as Types.ObjectId});   

      res.status(201).json({ message: `Welcome back, ${user.name}!`, token:{accessToken, refreshToken}});
    } catch (err) {
      throw new BadRequestError({code : 500, message : "Server error"});
    }
  };
