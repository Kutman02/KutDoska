// src/routes/userRoute.js

import express from "express";
import { registerUser, authUser, getProfileSettings, updateProfileSettings } from "../controllers/userController.js"; 
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

export default router;