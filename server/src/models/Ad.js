import mongoose from "mongoose";

const adSchema = new mongoose.Schema({ // ИЗМЕНЕНО: noteSchema -> adSchema
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: { // Описание объявления
    type: String,
    required: true,
  },
  
  // 💡 НОВЫЕ ПОЛЯ ДЛЯ ОБЪЯВЛЕНИЙ
  price: {
    type: Number,
    required: true, // Цена должна быть обязательной
    min: 0,
  },
  location: {
    type: String,
    trim: true,
    default: "Не указано",
  },
  
  tags: [String], // array of tags (ключевые слова для поиска)
  category: String, // optional (например, "Недвижимость", "Электроника")
  imageUrl: String, // optional (фотография товара/услуги)
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  // 💡 НОВОЕ ПОЛЕ: Определяет, является ли объявление черновиком
  isDraft: {
    type: Boolean,
    default: false, // По умолчанию объявление активно/публично (если его не создали через "Сохранить как черновик")
  }
}, {
    timestamps: true // Добавим автоматическое управление createdAt и updatedAt
});

const Ad = mongoose.model("Ad", adSchema); // ИЗМЕНЕНО: Note -> Ad
export default Ad;