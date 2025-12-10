// src/utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
// ❌ Удаляем импорт fs, так как файл больше не сохраняется локально

import dotenv from "dotenv"
dotenv.config()

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


/**
 * @desc Загружает файл в Cloudinary, используя Data URI.
 * @param {Buffer} fileBuffer - Буфер файла, полученный от Multer memoryStorage.
 * @param {string} mimeType - MIME-тип файла (например, 'image/jpeg').
 */
const cloudinaryUpload = async (fileBuffer, mimeType) => {
  try {
    if (!fileBuffer || !mimeType) {
      return null;
    }
    
    // 1. Преобразование буфера в Data URI
    // Cloudinary принимает строку в формате: data:[<MIME-type>][;charset=<encoding>][;base64],<data>
    const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

    // 2. Загрузка Data URI в Cloudinary
    const response = await cloudinary.uploader.upload(dataUri, {
      resource_type: "auto",
      folder: "adboard-images", // Рекомендуется указать папку
    });
    
    return response;

  } catch (error) {
    console.error("Error occurs while uploading file on cloudinary", error);
    return null;
  }
};

export default cloudinaryUpload;