// src/controllers/locationController.js
import Location from "../models/Location.js";
import Ad from "../models/Ad.js";
import mongoose from "mongoose";

// 1. Создание локации (города или района)
export const createLocation = async (req, res) => {
  try {
    const { name, type, parent } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Имя и тип локации обязательны" });
    }

    if (type !== "city" && type !== "district") {
      return res.status(400).json({ message: "Тип должен быть 'city' или 'district'" });
    }

    // Если это район, проверяем наличие родителя
    if (type === "district") {
      if (!parent) {
        return res.status(400).json({ message: "Для района необходимо указать родительский город" });
      }
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({ message: "Неверный формат ID родителя" });
      }
      const parentLocation = await Location.findById(parent);
      if (!parentLocation || parentLocation.type !== "city") {
        return res.status(400).json({ message: "Родитель должен быть городом" });
      }
    }

    const location = await Location.create({ name, type, parent: parent || null });
    res.status(201).json({ location, message: "Локация успешно создана" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Локация с таким именем уже существует" });
    }
    res.status(500).json({ message: "Ошибка сервера при создании локации" });
  }
};

// 2. Получение всех городов
export const getCities = async (req, res) => {
  try {
    const cities = await Location.find({ type: "city", parent: null })
      .populate("districts", "name")
      .select("name districts")
      .sort({ name: 1 });

    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при загрузке городов" });
  }
};

// 3. Получение всех районов конкретного города
export const getDistrictsByCity = async (req, res) => {
  try {
    const { cityId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(cityId)) {
      return res.status(400).json({ message: "Неверный формат ID города" });
    }

    const districts = await Location.find({ type: "district", parent: cityId })
      .select("name")
      .sort({ name: 1 });

    res.status(200).json(districts);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при загрузке районов" });
  }
};

// 4. Получение всех локаций (города с районами)
export const getAllLocations = async (req, res) => {
  try {
    const cities = await Location.find({ type: "city", parent: null })
      .populate("districts", "name")
      .select("name districts")
      .sort({ name: 1 });

    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при загрузке локаций" });
  }
};

// 5. Обновление локации
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, parent } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Неверный формат ID" });
    }

    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ message: "Локация не найдена" });
    }

    const updatedFields = {};
    if (name !== undefined) updatedFields.name = name;
    if (type !== undefined) updatedFields.type = type;
    if (parent !== undefined) updatedFields.parent = parent;

    const updatedLocation = await Location.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true, runValidators: true }
    )
      .populate("districts", "name")
      .populate("parent", "name");

    res.status(200).json({ location: updatedLocation, message: "Локация успешно обновлена" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Локация с таким именем уже существует" });
    }
    res.status(500).json({ message: "Ошибка сервера при обновлении локации" });
  }
};

// 6. Удаление локации
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Неверный формат ID" });
    }

    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ message: "Локация не найдена" });
    }

    // Проверяем наличие объявлений с этой локацией
    const adCount = await Ad.countDocuments({ locationId: id, status: { $ne: 'Sold' } });
    if (adCount > 0) {
      return res.status(400).json({ 
        message: `Невозможно удалить локацию: в ней ${adCount} активных объявлений` 
      });
    }

    // Если это город, проверяем наличие районов
    if (location.type === "city") {
      const districtCount = await Location.countDocuments({ parent: id });
      if (districtCount > 0) {
        return res.status(400).json({ 
          message: `Невозможно удалить город: в нем ${districtCount} районов. Сначала удалите или перенесите их.` 
        });
      }
    }

    await Location.findByIdAndDelete(id);
    res.status(200).json({ message: "Локация успешно удалена" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера при удалении локации" });
  }
};

