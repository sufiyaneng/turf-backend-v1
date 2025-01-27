import multer, { StorageEngine } from "multer";
import { Request, Response, NextFunction } from "express";

// Define the storage configuration
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: any) => {
    cb(null, "public/uploads"); // Set the destination folder
  },
  filename: (req: Request, file: Express.Multer.File, cb: any) => {
    const uniqueName = `${file.originalname}`; // Keep the original name
    cb(null, uniqueName);
  },
});

// Multer instance with file filter and storage configuration
const uploads = multer({
  storage: storage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only JPG, PNG, and JPEG files are allowed") as any,
        false
      );
    }
    cb(null, true);
  },
});

// Middleware for handling file upload
export const uploadImage = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  uploads.single("Image")(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};
