import Ad from "../models/Ad.js"; // Убедитесь, что путь к вашей модели Ad корректен

// 1. 🌐 Получить публичные объявления (БЕЗ аутентификации)
export const getPublicAds = async (req, res) => {
  try {
    // Ищем все объявления, кроме тех, которые помечены как черновики
    const publicAds = await Ad.find({ isDraft: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(20); 
      
    res.json(publicAds);
  } catch (err) {
    console.error("Ошибка при получении публичных объявлений:", err);
    res.status(500).json({ message: "Ошибка сервера при загрузке публичных объявлений." });
  }
};

// 2. 🔒 Получить личные объявления пользователя (Требует аутентификации - для /api/ads/my)
export const getMyAds = async (req, res) => { 
  try {
    // Ищем только объявления текущего пользователя по его ID
    const ads = await Ad.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
     console.error("Ошибка при получении личных объявлений:", err);
     // В случае ошибки (например, с БД) возвращаем 500
     res.status(500).json({ message: "Ошибка сервера при загрузке ваших объявлений." });
  }
};

// 3. 🔍 Получить объявление по ID (поддержка публичного и приватного доступа)
export const getAdById = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "Ad ID is required" });
  }

  const { id } = req.params;
  let findQuery = { _id: id };

  // Если req.user существует (даже если мидлвар protect использовался как опциональный),
  // мы пытаемся найти объявление, принадлежащее пользователю.
  if (req.user && req.user._id) {
    // Если пользователь авторизован, он может видеть даже свои черновики
    findQuery.user = req.user._id;
  } else {
    // Если пользователь НЕ авторизован (публичный доступ),
    // разрешаем поиск, но только если объявление НЕ черновик.
    findQuery.isDraft = { $ne: true };
  }
  
  try {
    const ad = await Ad.findOne(findQuery); 

    if (ad) res.json(ad);
    else res.status(404).json({ message: "Объявление не найдено, является черновиком или не принадлежит вам." }); 
  } catch (err) {
    console.error("Ошибка при получении объявления по ID:", err);
    res.status(500).json({ message: "Ошибка сервера при получении объявления." });
  }
};

// 4. 📝 Создать новое объявление (Требует аутентификации)
export const createAd = async (req, res) => {
  const { title, content, imageUrl, tags, price, location, isDraft = false } = req.body;
  
  if (!title || !content || !price) {
    return res.status(400).json({ message: "Title, content, and price are required" });
  }
  
  try {
    const ad = await Ad.create({
      title,
      content,
      price,
      location,
      user: req.user._id, // ID пользователя берется из токена (от protect)
      imageUrl,
      tags: tags,
      isDraft: isDraft,
    });
    res.status(201).json(ad);
  } catch (err) {
    console.error("Ошибка при создании объявления:", err);
    res.status(500).json({ message: "Ошибка сервера при создании объявления." });
  }
};

// 5. ✍️ Обновить объявление (Требует аутентификации и владения)
export const updateAd = async (req, res) => {
  const { id } = req.params;
  const _id = id;

  const { title, content, imageUrl, tags, price, location, isDraft } = req.body; 

  try {
    // Находим объявление, принадлежащее текущему пользователю
    const ad = await Ad.findOne({ _id, user: req.user._id });

    if (!ad) return res.status(404).json({ message: "Объявление не найдено или не принадлежит вам." });

    // Обновляем поля
    ad.title = title !== undefined ? title : ad.title;
    ad.content = content !== undefined ? content : ad.content;
    ad.imageUrl = imageUrl !== undefined ? imageUrl : ad.imageUrl;
    ad.tags = tags !== undefined ? tags : ad.tags;
    ad.price = price !== undefined ? price : ad.price;
    ad.location = location !== undefined ? location : ad.location;
    ad.isDraft = isDraft !== undefined ? isDraft : ad.isDraft;

    const updated = await ad.save();
    res.json(updated);
  } catch (err) {
    console.error("Ошибка при обновлении объявления:", err);
    res.status(500).json({ message: "Ошибка сервера при обновлении объявления." });
  }
};

// 6. 🗑️ Удалить объявление (Требует аутентификации и владения)
export const deleteAd = async (req, res) => {
  try {
    // Находим объявление, принадлежащее текущему пользователю
    const ad = await Ad.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!ad) return res.status(404).json({ message: "Объявление не найдено или не принадлежит вам." });

    await ad.deleteOne();
    res.json({ message: "Объявление успешно удалено" });
  } catch (err) {
    console.error("Ошибка при удалении объявления:", err);
    res.status(500).json({ message: "Ошибка сервера при удалении объявления." });
  }
};