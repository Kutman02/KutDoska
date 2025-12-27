// src/routes/userRoute.js

import express from "express";
import { 
  registerUser, 
  authUser, 
  getProfileSettings, 
  updateProfileSettings,
  getUserProfile,
  getUserAds
} from "../controllers/userController.js"; 
import { requireSignIn } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. POST /api/auth/register
router.post("/register", registerUser); 

// 2. POST /api/auth/login
router.post("/login", authUser); 

// 3. GET /api/auth/profile/settings (защищенный)
router.get("/profile/settings", requireSignIn, getProfileSettings);

// 4. PUT /api/auth/profile/settings (защищенный)
router.put("/profile/settings", requireSignIn, updateProfileSettings);

// 5. GET /api/auth/users/:id/profile (публичный)
router.get("/users/:id/profile", getUserProfile);

// 6. GET /api/auth/users/:id/ads (публичный)
router.get("/users/:id/ads", getUserAds);

export default router;