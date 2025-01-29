import { Router } from "express";
import { signup ,loginUser,refreshToken,verifyEmail, forgotPassword, resetPassword } from "../controllers/user.controller";

const router = Router();

// Define routes
router.post("/signup", signup);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword)
router.post("/reset-password",resetPassword)
router.post("/refresh-token", refreshToken);


export default router;
