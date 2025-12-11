// src/routes/locationRoutes.js
import express from "express";
import {
  createLocation,
  getCities,
  getDistrictsByCity,
  getAllLocations,
  updateLocation,
  deleteLocation,
} from "../controllers/locationController.js";
import { requireSignIn, isAdmin } from "../middleware/authMiddleware.js";

const locationRouter = express.Router();

// Публичные маршруты
locationRouter.get("/", getAllLocations); // Все города с районами
locationRouter.get("/cities", getCities); // Только города
locationRouter.get("/:cityId/districts", getDistrictsByCity); // Районы города

// Админские маршруты
locationRouter.post("/create", requireSignIn, isAdmin, createLocation);
locationRouter.put("/:id", requireSignIn, isAdmin, updateLocation);
locationRouter.delete("/:id", requireSignIn, isAdmin, deleteLocation);

export default locationRouter;

