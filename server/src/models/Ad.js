// src/models/Ad.js
import mongoose from "mongoose";

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false, // Теперь необязательно, генерируется из content
    trim: true,
    maxlength: 100,
    default: "",
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  price: {
    type: Number,
    required: false, 
    min: 0,
    default: 0, // 0 означает "Договорная"
  },
  location: {
    type: String,
    trim: true,
    default: "Не указано",
  },
  locationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  phone: {
    type: String,
    trim: true,
    default: "",
  },
  hidePhone: {
    type: Boolean,
    default: false,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", 
    required: true,
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: function() {
      // Подкатегория обязательна, если у категории есть подкатегории
      // Но это сложно проверить на уровне схемы, поэтому проверяем в контроллере
      return false; // Всегда необязательна на уровне схемы
    },
    default: null,
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
  
  views: { // Счетчик просмотров
    type: Number,
    default: 0,
    min: 0,
  },

}, {
    timestamps: true 
});

// Индексы для оптимизации поиска
adSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Ad = mongoose.model("Ad", adSchema);
export default Ad;