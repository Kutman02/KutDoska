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


// Настройки подключения к MongoDB с увеличенными таймаутами
const mongooseOptions = {
    serverSelectionTimeoutMS: 30000, // 30 секунд для выбора сервера
    socketTimeoutMS: 45000, // 45 секунд для сокета
    connectTimeoutMS: 30000, // 30 секунд для подключения
    maxPoolSize: 10, // Максимальное количество соединений в пуле
    retryWrites: true,
    retryReads: true,
};

// Проверка наличия MONGO_URI
if (!process.env.MONGO_URI) {
    console.error("❌ ОШИБКА: MONGO_URI не установлен в переменных окружения!");
    process.exit(1);
}

console.log("🔄 Подключение к MongoDB...");

mongoose
    .connect(process.env.MONGO_URI, mongooseOptions)
    .then(() => {
        console.log("✅ MongoDB успешно подключен");
        
        // Обработчики событий подключения
        mongoose.connection.on('error', (err) => {
            console.error("❌ Ошибка MongoDB:", err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn("⚠️ MongoDB отключен. Попытка переподключения...");
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log("✅ MongoDB переподключен");
        });
        
        app.listen(process.env.PORT || 8080, () =>
            console.log(`🚀 Сервер запущен на порту ${process.env.PORT || 8080}`)
        );
    })
    .catch((err) => {
        console.error("❌ КРИТИЧЕСКАЯ ОШИБКА подключения к MongoDB:");
        console.error("Тип ошибки:", err.name);
        console.error("Сообщение:", err.message);
        
        if (err.message.includes('timeout')) {
            console.error("\n💡 Возможные причины:");
            console.error("1. Проблемы с сетью или файрволом");
            console.error("2. Неправильная строка подключения MONGO_URI");
            console.error("3. IP адрес не добавлен в whitelist MongoDB Atlas");
            console.error("4. Проблемы с DNS или доступностью серверов MongoDB");
        }
        
        if (err.message.includes('authentication')) {
            console.error("\n💡 Проверьте:");
            console.error("1. Правильность имени пользователя и пароля в MONGO_URI");
            console.error("2. Права доступа пользователя в MongoDB Atlas");
        }
        
        console.error("\n📋 Проверьте файл .env и убедитесь, что MONGO_URI установлен правильно");
        process.exit(1);
    });