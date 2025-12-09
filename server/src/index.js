import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import router from "./routes/userRoute.js";
import notesrouter from "./routes/notesRoutes.js"; // Используем его здесь
import { upload } from "./middleware/multer.js";
import cloudinaryUpload from "./utils/cloudinary.js";

dotenv.config();

const app = express();
console.log("Environment variables loaded");
console.log("MONGO_URI:", process.env.MONGO_URI);
app.use(cors(
  {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }
));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

// 1. Маршруты для аутентификации (вход, регистрация)
app.use("/api/auth", router);

// 2. Маршруты для личных заметок (требуют токена)
app.use("/api/notes", notesrouter);

// 💡 3. НОВЫЙ МАРШРУТ: Для публичных заметок
// Он будет использовать notesrouter, но мы должны убедиться,
// что в notesRoutes.js есть маршрут '/public-notes',
// который НЕ защищен middleware аутентификации.
app.use("/api/public-notes", notesrouter);


app.post("/api/upload",upload.single("file"), async (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
   
    const result = await cloudinaryUpload(req.file.path);
    console.log("File uploaded to Cloudinary", result);
    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("Mongo error", err));