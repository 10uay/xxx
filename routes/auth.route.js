import express from "express";
import {
  login,
  logout,
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  resendCode,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", verifyToken, logout);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/resend-code", resendCode);

router.post("/reset-password", resetPassword);

export default router;
