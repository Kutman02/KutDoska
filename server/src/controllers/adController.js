import Ad from "../models/Ad.js";

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

// 2. 🔒 Получить личные объявления пользователя (Требует аутентификации)
export const getAds = async (req, res) => {
  // Ищем только объявления текущего пользователя
  const ads = await Ad.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(ads);
};

// 3. 🔍 ОБНОВЛЕНО: Получить объявление по ID (поддержка публичного доступа)
export const getAdById = async (req, res) => {
  console.log("Fetching ad with ID:", req.params.id);
  if (!req.params.id) {
    return res.status(400).json({ message: "Ad ID is required" });
  }

  const { id } = req.params;
  let findQuery = { _id: id };

  // Если пользователь авторизован, ищем объявление, принадлежащее ему (приватный доступ)
  if (req.user && req.user._id) {
    findQuery.user = req.user._id;
  } else {
    // Если пользователь НЕ авторизован (публичный доступ),
    // разрешаем поиск, но только если объявление НЕ черновик.
    findQuery.isDraft = { $ne: true };
  }
  
  const ad = await Ad.findOne(findQuery); 

  if (ad) res.json(ad);
  // Обновленное сообщение об ошибке
  else res.status(404).json({ message: "Объявление не найдено, является черновиком или не принадлежит вам." }); 
};

// 4. 📝 Создать новое объявление
export const createAd = async (req, res) => {
  const { title, content, imageUrl, tags, price, location, isDraft = false } = req.body;
  
  if (!title || !content || !price) {
    return res.status(400).json({ message: "Title, content, and price are required" });
  }
  
  const ad = await Ad.create({
    title,
    content,
    price,
    location,
    user: req.user._id,
    imageUrl,
    tags: tags,
    isDraft: isDraft,
  });
  res.status(201).json(ad);
};

// 5. ✍️ Обновить объявление
export const updateAd = async (req, res) => {
  const { id } = req.params;
  const _id = id;

  const { title, content, imageUrl, tags, price, location, isDraft } = req.body; 

  // Находим объявление, принадлежащее текущему пользователю
  const ad = await Ad.findOne({ _id, user: req.user._id });

  if (!ad) return res.status(404).json({ message: "Ad not found" });

  ad.title = title !== undefined ? title : ad.title;
  ad.content = content !== undefined ? content : ad.content;
  ad.imageUrl = imageUrl !== undefined ? imageUrl : ad.imageUrl;
  ad.tags = tags !== undefined ? tags : ad.tags;
  ad.price = price !== undefined ? price : ad.price;
  ad.location = location !== undefined ? location : ad.location;
  ad.isDraft = isDraft !== undefined ? isDraft : ad.isDraft;

  const updated = await ad.save();
  res.json(updated);
};

// 6. 🗑️ Удалить объявление
export const deleteAd = async (req, res) => {
  const ad = await Ad.findOne({ _id: req.params.id, user: req.user._id });
  if (!ad) return res.status(404).json({ message: "Ad not found" });

  await ad.deleteOne();
  res.json({ message: "Ad deleted" });
};