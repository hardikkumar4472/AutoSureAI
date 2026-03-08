import express from "express";
import {
  registerUser,
  verifyRegisterOtp,
  initiateLogin,
  logoutUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  googleCallback
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";
import passport from "passport";

import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/verify-email", authLimiter, verifyRegisterOtp);
router.post("/login", authLimiter, initiateLogin);
router.post("/logout", logoutUser);

// Google OAuth Routes
router.get("/google", passport.authenticate("google", { 
  scope: ["profile", "email"],
  prompt: "select_account"
}));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

router.get("/profile", auth, getUserProfile);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

export default router;
