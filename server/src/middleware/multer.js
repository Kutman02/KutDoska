// src/middleware/multer.js
import multer from "multer";

// 1. Настройка хранилища
// Используем memoryStorage, чтобы хранить файл в буфере, 
// что удобнее для прямой загрузки в Cloudinary без сохранения на диск
const storage = multer.memoryStorage(); 

// 2. Фильтр для проверки типа файла (только изображения)
const fileFilter = (req, file, cb) => {
  // Проверяем, начинается ли MIME-тип с 'image'
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    // Отклоняем файл и возвращаем ошибку
    cb(new Error('Неверный формат файла. Разрешены только изображения.'), false);
  }
};

// 3. Инициализация Multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // Лимит 5MB на файл
});