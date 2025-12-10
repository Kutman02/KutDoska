// src/controllers/adController.js
import Ad from "../models/Ad.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// --- 1. ПУБЛИЧНЫЕ МАРШРУТЫ ---

// 1.1. 🌐 Получить публичные объявления (С фильтрацией по категории)
/**
 * @desc Получить последние активные объявления (с опциональной фильтрацией по категории)
 * @route GET /api/ads/latest?category=...
 * @access Public
 */
export const getPublicAds = async (req, res) => {
    try {
        const { category } = req.query; 

        const filter = { status: "Active" }; 

        if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({ message: "Неверный формат ID категории." });
            }
            filter.category = category;
        }

        const publicAds = await Ad.find(filter)
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("user", "name") // Показываем имя пользователя
            .populate("category", "name icon") 
            .exec();
        
        res.json(publicAds);
    } catch (err) {
        res.status(500).json({ message: "Ошибка сервера при загрузке публичных объявлений." });
    }
};

// 1.2. 🔍 Поиск объявлений (Использует текстовый индекс)
export const searchAds = async (req, res) => {
    try {
        const { q } = req.query; 
        
        if (!q) {
            return res.status(400).json({ message: "Поисковый запрос 'q' обязателен." });
        }
        
        const ads = await Ad.find({
            $text: { $search: q },
            status: "Active" // Ищем только среди активных объявлений
        })
        .populate("category", "name icon")
        .sort({ score: { $meta: "textScore" } }) // Сортировка по релевантности
        .limit(20);

        res.json(ads);
    } catch (error) {
        console.error("Ошибка при поиске объявлений:", error);
        res.status(500).json({ message: "Ошибка сервера при выполнении поиска." });
    }
};

// 1.3. ⭐ Избранные/Продвигаемые объявления
export const getFeaturedAds = async (req, res) => {
    try {
        const featuredAds = await Ad.find({
            status: "Active",
            isFeatured: true 
        })
        .sort({ createdAt: -1 })
        .limit(5) // Выводим 5 избранных
        .populate("category", "name icon");

        res.json(featuredAds);
    } catch (error) {
        console.error("Ошибка при получении избранных объявлений:", error);
        res.status(500).json({ message: "Ошибка сервера при загрузке избранного." });
    }
};

// 1.4. 🔍 Получить объявление по ID
/**
 * @desc Получить одно объявление (Публичный доступ + проверка для владельца)
 * @route GET /api/ads/:id
 * @access Public/Private
 */
export const getAdById = async (req, res) => {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Неверный формат ID объявления." });
    }
    
    let findQuery = { _id: id };

  // Пытаемся определить пользователя, даже если маршрут публичный
  if (!req.user) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.split(" ")[1];
          try {
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const user = await User.findById(decoded.id).select("_id");
              if (user) {
                  req.user = user;
              }
          } catch (err) {
              // Токен невалиден — продолжаем как гостевой запрос
          }
      }
  }

  // Если пользователь авторизован, он может видеть свои неактивные
  if (req.user) {
      findQuery = { $or: [{ _id: id, user: req.user._id }, { _id: id, status: "Active" }] };
  } else {
      // Публичный доступ: только активные
      findQuery.status = "Active"; 
  }
    
    try {
        const ad = await Ad.findOne(findQuery)
            .populate("user", "name email phone") // Включаем контактные данные
            .populate("category", "name icon")
            .exec();

        if (ad) res.json(ad);
        else res.status(404).json({ message: "Объявление не найдено или неактивно." }); 
    } catch (err) {
        res.status(500).json({ message: "Ошибка сервера при получении объявления." });
    }
};


// --- 2. ЛИЧНЫЕ МАРШРУТЫ (С ЗАЩИТОЙ) ---

// 2.1. 🔒 Получить личные объявления пользователя 
export const getMyAds = async (req, res) => { 
  try {
    const ads = await Ad.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .populate("category", "name")
        .exec();
    res.json(ads);
  } catch (err) {
     res.status(500).json({ message: "Ошибка сервера при загрузке ваших объявлений." });
  }
};

// 2.2. 📝 Создать новое объявление
export const createAd = async (req, res) => {
  const { title, content, images, imageUrl, tags, price, location, phone, category, status, isPublic } = req.body;
  
  if (!title || !content || !price || !category) {
    return res.status(400).json({ message: "Title, content, price, and category are required" });
  }
  
  try {
    // Собираем массив изображений: если imageUrl передан, кладем его первым.
    const normalizedImages = Array.isArray(images) && images.length > 0
      ? images
      : imageUrl
        ? [imageUrl]
        : [];

    const computedStatus = status || (isPublic ? "Active" : "Draft");

    const ad = await Ad.create({
      title,
      content,
      price,
      location,
      phone: phone || "",
      user: req.user._id, // Берем ID из защищенного middleware
      images: normalizedImages,
      imageUrl: normalizedImages[0] || "",
      tags: tags,
      category,
      status: computedStatus,
    });

    const createdAd = await Ad.findById(ad._id).populate("category", "name icon");
    res.status(201).json(createdAd);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера при создании объявления." });
  }
};

// 2.3. ✍️ Обновить объявление
export const updateAd = async (req, res) => {
  const { id } = req.params;
  const { title, content, images, imageUrl, tags, price, location, phone, category, status, isPublic } = req.body; 

  try {
    // Находим объявление И проверяем, что оно принадлежит текущему пользователю
    const ad = await Ad.findOne({ _id: id, user: req.user._id });

    if (!ad) return res.status(404).json({ message: "Объявление не найдено или не принадлежит вам." });

    // Обновляем только предоставленные поля
    ad.title = title !== undefined ? title : ad.title;
    ad.content = content !== undefined ? content : ad.content;
    // Обновляем изображения: если пришел imageUrl, ставим его первым
    if (images !== undefined) {
      ad.images = images;
    }
    if (imageUrl !== undefined) {
      const baseImages = Array.isArray(ad.images) ? [...ad.images] : [];
      if (imageUrl) {
        ad.images = [imageUrl, ...baseImages.filter((img) => img !== imageUrl)];
        ad.imageUrl = imageUrl;
      } else if (!imageUrl && baseImages.length === 0) {
        ad.images = [];
        ad.imageUrl = "";
      }
    } else if (images !== undefined && images.length > 0) {
      ad.imageUrl = images[0];
    }
    ad.tags = tags !== undefined ? tags : ad.tags;
    ad.price = price !== undefined ? price : ad.price;
    ad.location = location !== undefined ? location : ad.location;
    ad.phone = phone !== undefined ? phone : ad.phone;
    ad.category = category !== undefined ? category : ad.category;
    if (status !== undefined) {
      ad.status = status;
    } else if (isPublic !== undefined) {
      ad.status = isPublic ? "Active" : "Draft";
    }

    const updated = await ad.save();
    
    const updatedPopulated = await Ad.findById(updated._id).populate("category", "name icon");
    res.json(updatedPopulated);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера при обновлении объявления." });
  }
};

// 2.4. 🗑️ Удалить объявление
export const deleteAd = async (req, res) => {
  try {
    // Находим объявление И проверяем, что оно принадлежит текущему пользователю
    const ad = await Ad.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!ad) return res.status(404).json({ message: "Объявление не найдено или не принадлежит вам." });

    // Используем deleteOne для триггера потенциальных хуков (хотя в Ad.js их нет)
    await ad.deleteOne(); 
    res.json({ message: "Объявление успешно удалено" });
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера при удалении объявления." });
  }
};