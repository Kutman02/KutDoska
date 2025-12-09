import express from "express";
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  // 💡 Возможно, вам понадобится новая функция в контроллере для публичных заметок
  getPublicNotes, 
} from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

const notesrouter = express.Router();

// 1. 🌐 ПУБЛИЧНЫЙ МАРШРУТ (БЕЗ ЗАЩИТЫ)
// GET /api/notes/latest или GET /api/public-notes/latest
// Обратите внимание: он идет ПЕРВЫМ, и не использует 'protect'
notesrouter.route("/latest").get(getPublicNotes);

// 2. 🔒 ЛИЧНЫЕ МАРШРУТЫ (ЗАЩИЩЕНЫ)

// GET /api/notes (личные заметки пользователя) и POST /api/notes (создание)
notesrouter.route("/").get(protect, getNotes).post(protect, createNote);

// GET, PUT, DELETE /api/notes/:id (для конкретной заметки)
notesrouter
  .route("/:id")
  .get(protect, getNoteById)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

export default notesrouter;