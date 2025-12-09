import Note from "../models/Note.js";

// 1. 🌐 НОВАЯ ФУНКЦИЯ: Получить публичные заметки (БЕЗ аутентификации)
export const getPublicNotes = async (req, res) => {
  try {
    // Ищем заметки, где isPublic = true
    const publicNotes = await Note.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(20); // Ограничим вывод для главной страницы
      
    res.json(publicNotes);
  } catch (err) {
    console.error("Ошибка при получении публичных заметок:", err);
    res.status(500).json({ message: "Ошибка сервера при загрузке публичных заметок." });
  }
};

// 2. 🔒 Получить личные заметки пользователя (Требует аутентификации)
export const getNotes = async (req, res) => {
  // Ищем только заметки текущего пользователя
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notes);
};

export const getNoteById = async (req, res) => {
  console.log("Fetching note with ID:", req.params.id);
  if (!req.params.id) {
    return res.status(400).json({ message: "Note ID is required" });
  }
  // Ищем заметку по ID, принадлежащую текущему пользователю
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (note) res.json(note);
  else res.status(404).json({ message: "Note not found" });
};

// 3. 📝 Обновлена: Создать новую заметку
export const createNote = async (req, res) => {
  // 💡 Добавлено извлечение isPublic из тела запроса
  const { title, content, imageUrl, tags, isPublic } = req.body; 
  
  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }
  
  const note = await Note.create({
    title,
    content,
    user: req.user._id,
    imageUrl,
    tags: tags,
    // 💡 Сохраняем статус публичности
    isPublic: isPublic || false, 
  });
  res.status(201).json(note);
};

// 4. ✍️ Обновлена: Обновить заметку
export const updateNote = async (req, res) => {
  const { id } = req.params;
  const _id = id;

  // 💡 Извлекаем isPublic из тела запроса
  const { title, content, imageUrl, tags, isPublic } = req.body; 

  // Находим заметку, принадлежащую текущему пользователю
  const note = await Note.findOne({ _id, user: req.user._id });

  if (!note) return res.status(404).json({ message: "Note not found" });

  note.title = title !== undefined ? title : note.title;
  note.content = content !== undefined ? content : note.content;
  note.imageUrl = imageUrl !== undefined ? imageUrl : note.imageUrl;
  note.tags = tags !== undefined ? tags : note.tags;
  // 💡 Обновляем статус публичности, если он передан
  note.isPublic = isPublic !== undefined ? isPublic : note.isPublic; 

  const updated = await note.save();
  res.json(updated);
};

export const deleteNote = async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (!note) return res.status(404).json({ message: "Note not found" });

  await note.deleteOne();
  res.json({ message: "Note deleted" });
};