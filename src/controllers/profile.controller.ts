import BadRequestError from "../middlewares/BadRequestError";
import { Request, Response } from "express";
import User from "../models/user.model";
import Turf from "../models/turf.model";
import { cloudinaryUploadImage } from "../utils/cloudnary";

// Get User Profile Details
export const getUserProfileDetails = async (req: Request, res: Response) => {
  if (!req.user || !req.user.userId) {
    throw new BadRequestError({
      code: 401,
      message: "User not authenticated.",
    });
  }

  const userId = req.user.userId;

  // Fetch the user's basic details
  const fetchedUser = await User.findById(userId);

  if (!fetchedUser) {
    throw new BadRequestError({
      code: 404,
      message: "User not found.",
    });
  }

  // Structure the profile details response
  const profileDetails = {
    name: fetchedUser.name,
    email: fetchedUser.email,
    turfName: fetchedUser.turfName,
    isVerified: fetchedUser.isVerified,
    userImage: fetchedUser.userImage,
  };

  // Send the structured response
  res.status(200).json(profileDetails);
};

// Get Turf Details
export const getTurfDetails = async (req: Request, res: Response) => {
  if (!req.user || !req.user.userId) {
    throw new BadRequestError({
      code: 401,
      message: "User not authenticated.",
    });
  }

  const userId = req.user.userId;
  const fetchedUser = await User.findById(userId);

  if (!fetchedUser || !fetchedUser.turfId) {
    throw new BadRequestError({
      code: 404,
      message: "Turf not found for this user.",
    });
  }

  const turfDetails = await Turf.findById(fetchedUser.turfId);

  if (!turfDetails) {
    throw new BadRequestError({
      code: 404,
      message: "Turf details not found.",
    });
  }

  const response = {
    name: turfDetails.name,
    address: turfDetails.address,
    openAt: turfDetails.openAt,
    closeAt: turfDetails.closeAt,
    daysOpen: turfDetails.daysOpen,
    turfImage: turfDetails.turfImage,
  };

  res.status(200).json(response);
};

// Edit User Profile
export const editUserProfile = async (
  req: Request,
  res: Response
): Promise<Response | any> => {
  const { userId } = req.user;
  const { name } = req.body;
  let userImageUrl = "";

  if (req.file) {
    userImageUrl = await cloudinaryUploadImage(req.file.path);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, userImage: userImageUrl },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    message: "Profile updated successfully",
    updatedUser,
  });
};

// Edit Turf Profile
export const editTurfProfile = async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { name, address, openAt, closeAt, daysOpen } = req.body;
  let turfImageUrl = "";

  if (req.file) {
    turfImageUrl = await cloudinaryUploadImage(req.file.path);
  }
  const updatedTurf = await Turf.findOneAndUpdate(
    { user: userId },
    { name, address, openAt, closeAt, daysOpen, turfImage: turfImageUrl },
    { new: true }
  );

  if (!updatedTurf) {
    res.status(404).json({ message: "Turf not found" });
  }

  res.status(200).json({
    message: "Profile updated successfully",
    updatedTurf,
  });
};
