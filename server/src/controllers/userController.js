import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import ProfileSettings from "../models/ProfileSettings.js";
import Ad from "../models/Ad.js";

// Функция для генерации JWT-токена
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// 1. Регистрация пользователя
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
      return res.status(400).json({ message: "Пожалуйста, введите все обязательные поля" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Пользователь с таким адресом электронной почты уже существует" });

    // Создаем пользователя (хеширование пароля происходит в модели)
    const user = await User.create({ name, email, password });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        // Возвращаем данные, необходимые для фронтенда
        role: user.role, 
        phone: user.phone,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Неверные данные пользователя" });
    }
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    res.status(500).json({ message: "Ошибка сервера при регистрации" });
  }
};

// 2. Аутентификация пользователя (Вход)
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Недействительные учетные данные" });
    }

    // Сравнение хешированных паролей
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Недействительные учетные данные" });
    }

    // Возврат данных пользователя и токена
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, 
      phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Ошибка входа:", err);
    res.status(500).json({ message: "Ошибка сервера при входе в систему" });
  }
};

// 3. Получение/создание настроек профиля
export const getProfileSettings = async (req, res) => {
  try {
    let settings = await ProfileSettings.findOne({ user: req.user._id });

    if (!settings) {
      settings = await ProfileSettings.create({
        user: req.user._id,
        displayName: req.user.name || "",
        phone: req.user.phone || "",
      });
    }

    res.json(settings);
  } catch (err) {
    console.error("Ошибка получения настроек профиля:", err);
    res.status(500).json({ message: "Ошибка сервера при получении настроек профиля" });
  }
};

// 4. Обновление настроек профиля (и синхронизация name/phone в User)
export const updateProfileSettings = async (req, res) => {
  try {
    const { displayName, phone, about, profileImageUrl, website } = req.body;

    const settings = await ProfileSettings.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          displayName: displayName ?? "",
          phone: phone ?? "",
          about: about ?? "",
          profileImageUrl: profileImageUrl ?? "",
          website: website ?? "",
        },
      },
      { new: true, upsert: true }
    );

    // Синхронизируем ключевые данные в основной модели пользователя
    const userUpdates = {};
    if (displayName !== undefined) userUpdates.name = displayName;
    if (phone !== undefined) userUpdates.phone = phone;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, { $set: userUpdates }, { new: true });
    }

    res.json(settings);
  } catch (err) {
    console.error("Ошибка обновления настроек профиля:", err);
    res.status(500).json({ message: "Ошибка сервера при обновлении настроек профиля" });
  }
};

// 5. Получить публичный профиль пользователя по ID
/**
 * @desc Получить публичный профиль пользователя
 * @route GET /api/users/:id/profile
 * @access Public
 */
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Неверный формат ID пользователя." });
    }

    const user = await User.findById(id).select("name phone createdAt");
    
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден." });
    }

    // Получаем настройки профиля
    const profileSettings = await ProfileSettings.findOne({ user: id });
    
    // Объединяем данные пользователя и настроек профиля
    // Email не возвращаем для публичного профиля, вместо него показываем website
    const profile = {
      _id: user._id,
      name: profileSettings?.displayName || user.name,
      website: profileSettings?.website || "",
      phone: profileSettings?.phone || user.phone,
      about: profileSettings?.about || "",
      profileImageUrl: profileSettings?.profileImageUrl || "",
      createdAt: user.createdAt,
    };

    res.json(profile);
  } catch (err) {
    console.error("Ошибка получения профиля пользователя:", err);
    res.status(500).json({ message: "Ошибка сервера при получении профиля пользователя" });
  }
};

// 6. Получить объявления пользователя по ID
/**
 * @desc Получить объявления пользователя
 * @route GET /api/users/:id/ads
 * @access Public
 */
export const getUserAds = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Неверный формат ID пользователя." });
    }
    
    const ads = await Ad.find({ 
      user: id, 
      status: "Active" 
    })
      .sort({ createdAt: -1 })
      .populate("category", "name icon")
      .populate("subcategory", "name")
      .populate("locationId", "name")
      .exec();

    res.json(ads);
  } catch (err) {
    console.error("Ошибка получения объявлений пользователя:", err);
    res.status(500).json({ message: "Ошибка сервера при получении объявлений пользователя" });
  }
};