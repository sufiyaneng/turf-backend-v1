import dotenv from 'dotenv';
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import util from "util";
dotenv.config();
const unlinkFile = util.promisify(fs.unlink);
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Cloudinary Upload Image
  export const cloudinaryUploadImage = async (filePath: string) => {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        resource_type: "image",
      });
  
      // Delete the local file after uploading to Cloudinary
      await unlinkFile(filePath);
  
      return result.secure_url; // Return the Cloudinary URL
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new Error("Internal Server Error (Cloudinary)");
    }
  };