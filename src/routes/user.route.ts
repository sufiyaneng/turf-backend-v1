import { Router } from "express";
import { createUser ,loginUser,verifyEmail } from "../controllers/user.controller";

const router = Router();

// Define routes
router.post("/users", createUser);
router.post("/login", loginUser);
router.post("/users/verify-email", verifyEmail);


export default router;
