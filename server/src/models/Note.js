import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String], // array of tags
  category: String, // optional
  imageUrl: String, // optional
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true // Рекомендуется, чтобы заметка всегда была привязана к пользователю
  },
  // 💡 НОВОЕ ПОЛЕ: Определяет, видна ли заметка без регистрации
  isPublic: {
    type: Boolean,
    default: false, // По умолчанию все заметки приватны
  }
});

const Note = mongoose.model("Note", noteSchema);
export default Note;