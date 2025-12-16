// src/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRouter from "./routes/userRoute.js";
import adsRouter from "./routes/adsRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import locationRouter from "./routes/locationRoutes.js";
// 💡 НОВЫЙ ИМПОРТ МАРШРУТОВ ИЗБРАННОГО
import favoriteRouter from "./routes/favoriteRoutes.js"; 
import { upload } from "./middleware/multer.js";
import cloudinaryUpload from "./utils/cloudinary.js"; 

dotenv.config();

const app = express();

// CORS: разрешаем только доверенные фронтенды, иначе креды с origin="*" не работают.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",");
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true); // curl / local tools
            const isAllowed = allowedOrigins.includes(origin);
            return callback(isAllowed ? null : new Error("CORS: origin not allowed"), isAllowed);
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
    })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("AdBoard API is running...");
});

// Маршруты
app.use("/api/auth", userRouter);
app.use("/api/ads", adsRouter); 
app.use("/api/categories", categoryRouter);
app.use("/api/locations", locationRouter); 
// 💡 НОВЫЙ МАРШРУТ: Избранное
app.use("/api/favorites", favoriteRouter);


// Маршрут для загрузки изображений
app.post("/api/upload/ad-image", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    try {
        const result = await cloudinaryUpload(req.file.buffer, req.file.mimetype); 

        if (!result) {
            return res.status(500).json({ error: "Upload failed: Cloudinary returned null" });
        }
        
        console.log("File uploaded to Cloudinary", result);
        res.json({ imageUrl: result.secure_url });
    } catch (err) {
        console.error("Cloudinary Upload Error:", err);
        res.status(500).json({ error: "Upload failed" });
    }
});


mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(process.env.PORT || 8080, () =>
            console.log(`Server running on port ${process.env.PORT || 8080}`)
        );
    })
    .catch((err) => console.error("Mongo error", err));