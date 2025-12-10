// src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt"; // Изменено на bcrypt (предполагаем, что он установлен)

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
    // 💡 ДОБАВЛЕНО: Роль для администрирования
    role: { 
        type: String, 
        enum: ["user", "admin"], // Только 'user' или 'admin'
        default: "user" 
    },
    // 💡 ДОБАВЛЕНО: Контактные данные для объявлений
    phone: { 
        type: String, 
        default: "" 
    },
    // isVerified: { type: Boolean, default: false }, // Опционально: можно добавить позже
}, {
    timestamps: true // 💡 ДОБАВЛЕНО: Включаем createdAt и updatedAt
});

// Хеширование пароля перед сохранением
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    // Используем bcrypt.genSalt() для генерации соли
    const salt = await bcrypt.genSalt(10); 
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Метод для сравнения паролей
userSchema.methods.matchPassword = async function(enteredPassword) {
    // Используем bcrypt.compare()
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;