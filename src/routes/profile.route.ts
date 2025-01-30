import { Router } from "express";
import { auth } from "../middlewares/auth.middleware";
import { editTurfProfile, editUserProfile, getTurfDetails, getUserProfileDetails } from "../controllers/profile.controller";
import { uploadImage } from "../utils/multer";


const router = Router();

// Define routes

router.get('/userprofile',auth, getUserProfileDetails);
router.get('/turfprofile',auth, getTurfDetails);
router.put('/edituserprofile',auth,uploadImage, editUserProfile);
router.put('/editturfprofile',auth,uploadImage, editTurfProfile);

export default router;
 