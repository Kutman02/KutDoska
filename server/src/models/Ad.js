// src/models/Ad.js
import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  price: {
    type: Number,
    required: true, 
    min: 0,
  },
  location: {
    type: String,
    trim: true,
    default: "Не указано",
  },
  phone: {
    type: String,
    trim: true,
    default: "",
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", 
    required: true,
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  imageUrl: {
    type: String,
    default: "",
  },
  images: [String], // Массив URL-адресов изображений (первый = imageUrl для совместимости)
  tags: [String],
  
  status: {
    type: String,
    enum: ["Active", "Sold", "Paused", "Draft"],
    default: "Draft",
  },
  
  isFeatured: { // Для платного продвижения
    type: Boolean,
    default: false,
  },

}, {
    timestamps: true 
});

// Индексы для оптимизации поиска
adSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Ad = mongoose.model("Ad", adSchema);
export default Ad;