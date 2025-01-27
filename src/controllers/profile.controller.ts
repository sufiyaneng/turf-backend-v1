import BadRequestError from "../middlewares/BadRequestError";
import { Request, Response } from "express";
import User from "../models/user.model";
import Turf from "../models/turf.model";

// Get User Profile Details
export const getUserProfileDetails = async (req: Request, res: Response) => {
  try {
    // Ensure the user object exists in the request (provided by the auth middleware)
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
    };

    // Send the structured response
    res.status(200).json(profileDetails);
  } catch (err: any) {
    // Handle unexpected errors
    throw new BadRequestError({ code: 500, message: err.message });
  }
};

// Get Turf Details
export const getTurfDetails = async (req: Request, res: Response) => {
  try {
    // Ensure the user object exists in the request (provided by the auth middleware)
    if (!req.user || !req.user.userId) {
      throw new BadRequestError({
        code: 401,
        message: "User not authenticated.",
      });
    }

    const userId = req.user.userId;

    // Fetch the user's details to retrieve the turfId
    const fetchedUser = await User.findById(userId);

    if (!fetchedUser || !fetchedUser.turfId) {
      throw new BadRequestError({
        code: 404,
        message: "Turf not found for this user.",
      });
    }

    // Fetch the turf details using the turfId
    const turfDetails = await Turf.findById(fetchedUser.turfId);

    if (!turfDetails) {
      throw new BadRequestError({
        code: 404,
        message: "Turf details not found.",
      });
    }

    // Structure the turf details response
    const response = {
      name: turfDetails.name,
      address: turfDetails.address,
      openAt: turfDetails.openAt,
      closeAt: turfDetails.closeAt,
      daysOpen: turfDetails.daysOpen,
    };

    // Send the structured response
    res.status(200).json(response);
  } catch (err: any) {
    // Handle unexpected errors
    throw new BadRequestError({ code: 500, message: err.message });
  }
};

// Edit User Profile
export const editUserProfile = async (
  req: Request,
  res: Response
): Promise<boolean | any> => {
  try {
    const { userId } = req.user;
    const { name } = req.body;
    let userImagePath = "";

console.log(req.body ,"-----------")
console.log(req.body.name ,"-----------")
    if (req.file) {
      userImagePath = `/uploads/${req.file.filename}`;
    }

    // Find and update the user document
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name : name, userImage: userImagePath },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Profile updated successfully", updatedUser });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// Edit Turf Profile
export const editTurfProfile = async (
  req: Request,
  res: Response
): Promise<boolean | any> => {
  try {
    const { userId } = req.user;
    const { name,address,openAt,closeAt,daysOpen } = req.body;
    let imagePath = "";

    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Find and update the user document
    const updatedTurf = await Turf.findOneAndUpdate(
      { user: userId }, // Find the turf that belongs to the user
      { name: name,address,openAt,closeAt,daysOpen, turfImage: imagePath }, // Update turf image and name (if needed)
      { new: true }
    );
    if (!updatedTurf) {
      return res.status(404).json({ message: "Turf not found" });
    }

    return res
      .status(200)
      .json({ message: "Profile updated successfully", updatedTurf });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
