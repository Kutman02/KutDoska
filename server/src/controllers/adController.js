// src/controllers/adController.js
import Ad from "../models/Ad.js";
import User from "../models/User.js";
import ProfileSettings from "../models/ProfileSettings.js";
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
        const { category, subcategory, location } = req.query; 

        const filter = { status: "Active" }; 

        // Фильтр по категории или подкатегории
        if (subcategory) {
            if (!mongoose.Types.ObjectId.isValid(subcategory)) {
                return res.status(400).json({ message: "Неверный формат ID подкатегории." });
            }
            filter.subcategory = subcategory;
        } else if (category) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({ message: "Неверный формат ID категории." });
            }
            filter.category = category;
        }

        // Фильтр по локации
        if (location) {
            if (!mongoose.Types.ObjectId.isValid(location)) {
                return res.status(400).json({ message: "Неверный формат ID локации." });
            }
            filter.locationId = location;
        }

        const publicAds = await Ad.find(filter)
            .sort({ createdAt: -1 })
            .limit(20)
            .populate("user", "name email phone")
            .populate("category", "name icon")
            .populate("subcategory", "name")
            .populate("locationId", "name")
            .exec();
        
        // Добавляем информацию о профиле для каждого объявления
        const adsWithProfile = await Promise.all(
            publicAds.map(async (ad) => {
                if (ad.user && ad.user._id) {
                    const profileSettings = await ProfileSettings.findOne({ user: ad.user._id });
                    if (profileSettings) {
                        ad.user = {
                            ...ad.user.toObject(),
                            displayName: profileSettings.displayName || ad.user.name,
                            profileImageUrl: profileSettings.profileImageUrl || "",
                        };
                    }
                }
                return ad;
            })
        );
        
        res.json(adsWithProfile);
    } catch (err) {
        res.status(500).json({ message: "Ошибка сервера при загрузке публичных объявлений." });
    }
};

// 1.2. 🔍 Умный поиск объявлений
export const searchAds = async (req, res) => {
    try {
        const { q, category, subcategory, location, minPrice, maxPrice } = req.query; 
        
        if (!q || q.trim() === "") {
            return res.status(400).json({ message: "Поисковый запрос 'q' обязателен." });
        }

        // Очищаем поисковый запрос
        const searchQuery = q.trim();
        
        // Создаем базовый фильтр
        const filter = { status: "Active" };
        
        // Фильтр по категории
        if (category && mongoose.Types.ObjectId.isValid(category)) {
            filter.category = category;
        }
        
        // Фильтр по подкатегории
        if (subcategory && mongoose.Types.ObjectId.isValid(subcategory)) {
            filter.subcategory = subcategory;
        }
        
        // Фильтр по локации
        if (location && mongoose.Types.ObjectId.isValid(location)) {
            filter.locationId = location;
        }
        
        // Фильтр по цене
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        // Умный поиск: ищем в нескольких полях с учетом частичных совпадений
        // Разбиваем запрос на слова для более точного поиска
        const searchWords = searchQuery.split(/\s+/).filter(word => word.length > 0);
        
        // Создаем массив условий для поиска по каждому слову
        const searchConditions = searchWords.map(word => ({
            $or: [
                { content: { $regex: word, $options: 'i' } }, // Поиск в описании (без учета регистра)
                { tags: { $regex: word, $options: 'i' } }, // Поиск в тегах
                { location: { $regex: word, $options: 'i' } }, // Поиск в локации
            ]
        }));

        // Пытаемся использовать текстовый индекс, если он доступен
        let ads;
        try {
            // Пытаемся использовать текстовый индекс для лучшей производительности
            ads = await Ad.find({
                ...filter,
                $text: { $search: searchQuery }
            })
            .populate("user", "name email phone")
            .populate("category", "name icon")
            .populate("subcategory", "name")
            .populate("locationId", "name")
            .sort({ score: { $meta: "textScore" } })
            .limit(50)
            .exec();
        } catch (textIndexError) {
            // Если текстовый индекс не работает, используем regex поиск
            ads = await Ad.find({
                ...filter,
                $and: searchConditions.length > 0 ? searchConditions : [
                    { content: { $regex: searchQuery, $options: 'i' } }
                ]
            })
            .populate("user", "name email phone")
            .populate("category", "name icon")
            .populate("subcategory", "name")
            .populate("locationId", "name")
            .sort({ createdAt: -1 })
            .limit(50)
            .exec();
        }

        // Добавляем информацию о профиле для каждого объявления
        const ProfileSettings = (await import("../models/ProfileSettings.js")).default;
        const adsWithProfile = await Promise.all(
            ads.map(async (ad) => {
                if (ad.user && ad.user._id) {
                    const profileSettings = await ProfileSettings.findOne({ user: ad.user._id });
                    if (profileSettings) {
                        ad.user = {
                            ...ad.user.toObject(),
                            displayName: profileSettings.displayName || ad.user.name,
                            profileImageUrl: profileSettings.profileImageUrl || "",
                        };
                    }
                }
                return ad;
            })
        );

        res.json(adsWithProfile);
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
            .populate("user", "name email phone")
            .populate("category", "name icon")
            .populate("subcategory", "name")
            .populate("locationId", "name")
            .exec();

        if (ad) {
            // Увеличиваем счетчик просмотров (только для активных объявлений и не для владельца)
            if (ad.status === "Active" && (!req.user || ad.user._id.toString() !== req.user._id.toString())) {
                ad.views = (ad.views || 0) + 1;
                await ad.save();
            }
            
            // Добавляем информацию о профиле пользователя
            const ProfileSettings = (await import("../models/ProfileSettings.js")).default;
            if (ad.user && ad.user._id) {
                const profileSettings = await ProfileSettings.findOne({ user: ad.user._id });
                if (profileSettings) {
                    ad.user = {
                        ...ad.user.toObject(),
                        displayName: profileSettings.displayName || ad.user.name,
                        profileImageUrl: profileSettings.profileImageUrl || "",
                    };
                }
            }
            res.json(ad);
        } else {
            res.status(404).json({ message: "Объявление не найдено или неактивно." });
        }
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
        .populate("subcategory", "name")
        .populate("locationId", "name")
        .exec();
    res.json(ads);
  } catch (err) {
     res.status(500).json({ message: "Ошибка сервера при загрузке ваших объявлений." });
  }
};

// 2.2. 📝 Создать новое объявление
export const createAd = async (req, res) => {
  const { title, content, images, imageUrl, tags, price, location, locationId, phone, category, subcategory, status, isPublic, hidePhone } = req.body;
  
  // Валидация обязательных полей
  if (!content || !category || !locationId) {
    return res.status(400).json({ message: "Описание, категория и город обязательны" });
  }

  // Проверка наличия главного изображения
  const normalizedImages = Array.isArray(images) && images.length > 0
    ? images
    : imageUrl
      ? [imageUrl]
      : [];

  if (normalizedImages.length === 0) {
    return res.status(400).json({ message: "Необходимо загрузить хотя бы одно изображение" });
  }

  // Проверка телефона
  if (!phone || phone.trim() === "") {
    return res.status(400).json({ message: "Номер телефона обязателен" });
  }

  // Обработка цены: если 0 или не указана, ставим 0 (будет отображаться как "Договорная")
  const finalPrice = price && parseFloat(price) > 0 ? parseFloat(price) : 0;
  
  try {
    const computedStatus = status || (isPublic ? "Active" : "Draft");
    
    // Генерируем title из content, если не передан
    const generatedTitle = title || content.trim().substring(0, 100) || "Объявление";

    const ad = await Ad.create({
      title: generatedTitle,
      content,
      price: finalPrice,
      location: location || "",
      locationId: locationId,
      phone: phone.trim(),
      hidePhone: hidePhone || false,
      user: req.user._id,
      images: normalizedImages,
      imageUrl: normalizedImages[0] || "",
      tags: tags || [],
      category,
      subcategory: subcategory || null,
      status: computedStatus,
    });

    const createdAd = await Ad.findById(ad._id)
      .populate("category", "name icon")
      .populate("subcategory", "name")
      .populate("locationId", "name");
    res.status(201).json(createdAd);
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера при создании объявления." });
  }
};

// 2.3. ✍️ Обновить объявление
export const updateAd = async (req, res) => {
  const { id } = req.params;
  const { title, content, images, imageUrl, tags, price, location, locationId, phone, category, subcategory, status, isPublic, hidePhone } = req.body; 

  try {
    // Находим объявление И проверяем, что оно принадлежит текущему пользователю
    const ad = await Ad.findOne({ _id: id, user: req.user._id });

    if (!ad) return res.status(404).json({ message: "Объявление не найдено или не принадлежит вам." });

    // Валидация обязательных полей при обновлении
    if (content !== undefined && !content.trim()) {
      return res.status(400).json({ message: "Описание не может быть пустым" });
    }
    if (locationId !== undefined && !locationId) {
      return res.status(400).json({ message: "Город обязателен" });
    }
    if (phone !== undefined && (!phone || phone.trim() === "")) {
      return res.status(400).json({ message: "Номер телефона обязателен" });
    }

    // Обновляем только предоставленные поля
    // Если обновляется content, обновляем и title из него
    if (content !== undefined) {
      ad.content = content;
      ad.title = title || content.trim().substring(0, 100) || ad.title;
    }
    if (title !== undefined) {
      ad.title = title;
    }
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
    // Обработка цены: если 0 или не указана, ставим 0 (будет отображаться как "Договорная")
    if (price !== undefined) {
      ad.price = price && parseFloat(price) > 0 ? parseFloat(price) : 0;
    }
    ad.location = location !== undefined ? location : ad.location;
    ad.locationId = locationId !== undefined ? locationId : ad.locationId;
    ad.phone = phone !== undefined ? phone.trim() : ad.phone;
    ad.hidePhone = hidePhone !== undefined ? hidePhone : ad.hidePhone;
    ad.category = category !== undefined ? category : ad.category;
    ad.subcategory = subcategory !== undefined ? subcategory : ad.subcategory;
    if (status !== undefined) {
      ad.status = status;
    } else if (isPublic !== undefined) {
      ad.status = isPublic ? "Active" : "Draft";
    }

    const updated = await ad.save();
    
    const updatedPopulated = await Ad.findById(updated._id)
      .populate("category", "name icon")
      .populate("subcategory", "name")
      .populate("locationId", "name");
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