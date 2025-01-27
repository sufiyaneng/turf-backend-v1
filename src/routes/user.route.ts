import { Router } from "express";
import { createUser ,loginUser,refreshToken,verifyEmail } from "../controllers/user.controller";

const router = Router();

// Define routes
router.post("/users", createUser);
router.post("/login", loginUser);
router.post("/users/verify-email", verifyEmail);
router.post("/refresh-token", refreshToken);


export default router;
