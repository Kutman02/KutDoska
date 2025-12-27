// routes/categoryRoutes.js
import express from "express";
import Category from "../models/Category.js";
import Ad from "../models/Ad.js"; // 💡 ДОБАВЛЕНО: Для проверки связанных объявлений
import mongoose from "mongoose"; // 💡 ДОБАВЛЕНО: Для проверки ObjectId
import { isAdmin, requireSignIn } from "../middleware/authMiddleware.js"; 

const categoryRouter = express.Router();

// 1. Создание категории (доступно только админам)
categoryRouter.post("/create", requireSignIn, isAdmin, async (req, res) => {
    try {
        const { name, icon, parent } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const categoryData = { name };
        
        if (parent) {
            // Если указан parent, это подкатегория
            if (!mongoose.Types.ObjectId.isValid(parent)) {
                 return res.status(400).json({ message: "Invalid parent ID format." });
            }
            categoryData.parent = parent;
        } else {
            // Если parent не указан, это главная категория, icon обязателен
            if (!icon) {
                return res.status(400).json({ message: "Icon is required for main category" });
            }
            categoryData.icon = icon;
        }
        
        // Создание автоматически добавит себя в subcategories родителя (благодаря middleware в Category.js)
        const category = await Category.create(categoryData); 
        res.status(201).json({ category, message: "Category created successfully" });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "Category name already exists" });
        }
        res.status(500).json({ message: "Internal server error" });
    }
});


// 2. Получение всех главных категорий (для отображения на доске)
categoryRouter.get("/", async (req, res) => {
    try {
        // Ищем только главные категории (parent: null) и заполняем subcategories
        const categories = await Category.find({ parent: null })
            .populate("subcategories", "name slug") // Заполняем имя и slug подкатегории
            .select("name slug icon subcategories")
            .sort({ name: 1 });

        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

// 2b. Получение категории по slug
categoryRouter.get("/slug/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await Category.findOne({ slug, parent: null })
            .populate("subcategories", "name slug")
            .select("name slug icon subcategories");

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


// 3. Получение всех подкатегорий для конкретной главной категории
categoryRouter.get("/:categoryId/subcategories", async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid category ID format." });
        }
        
        // Ищем подкатегории, где parent равен categoryId
        const subcategories = await Category.find({ parent: categoryId }).select("name");
        
        res.status(200).json(subcategories);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


// --- 4. Обновление и Удаление (Только для Админов) ---

categoryRouter.route("/:id")
  // 4a. Обновление категории (PUT /api/categories/:id)
  .put(requireSignIn, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, icon, parent } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Category ID is required" });
      }

      const updatedFields = { name, icon, parent };
      
      // Удаляем null или undefined поля, чтобы не перезаписывать их в базе
      Object.keys(updatedFields).forEach(key => updatedFields[key] === undefined && delete updatedFields[key]);

      // Проверяем наличие имени
      if (name !== undefined && name === "") { // Проверка, если name передано
         return res.status(400).json({ message: "Name cannot be empty" });
      }

      const category = await Category.findByIdAndUpdate(
        id,
        updatedFields,
        { new: true, runValidators: true } 
      );

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(200).json({ category, message: "Category updated successfully" });

    } catch (error) {
      console.error("Error updating category:", error);
      if (error.code === 11000) {
        return res.status(400).json({ message: "Category name already exists" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  })
  
  // 4b. Удаление категории (DELETE /api/categories/:id)
  .delete(requireSignIn, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Category ID is required" });
      }

      // 💡 КОРРЕКТИРОВКА: Проверяем, есть ли активные объявления, связанные с этой категорией
      const adCount = await Ad.countDocuments({ category: id, status: { $ne: 'Sold' } });
      if (adCount > 0) {
        return res.status(400).json({ message: `Невозможно удалить категорию: в ней ${adCount} активных объявлений. Сначала удалите или перенесите их.` });
      }

      // 💡 Дополнительная проверка: Если это главная категория, проверьте наличие подкатегорий
      const subcategoryCount = await Category.countDocuments({ parent: id });
      if (subcategoryCount > 0) {
          return res.status(400).json({ message: `Невозможно удалить категорию: в ней ${subcategoryCount} подкатегорий. Сначала удалите или перенесите их.` });
      }

      // Удаление
      const category = await Category.findByIdAndDelete(id);

      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(200).json({ message: "Category deleted successfully" });
      
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


export default categoryRouter;