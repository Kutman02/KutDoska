// Скрипт для генерации slug для существующих категорий
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import dotenv from 'dotenv';

dotenv.config();

// Функция для генерации slug из названия
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Удаляем спецсимволы
    .replace(/[\s_-]+/g, '-') // Заменяем пробелы и подчеркивания на дефисы
    .replace(/^-+|-+$/g, ''); // Удаляем дефисы в начале и конце
};

const generateSlugsForCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kutdoska');
    console.log('Connected to MongoDB');

    // Получаем все категории без slug
    const categories = await Category.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
    console.log(`Found ${categories.length} categories without slug`);

    for (const category of categories) {
      let baseSlug = generateSlug(category.name);
      let slug = baseSlug;
      let counter = 1;
      
      // Проверяем уникальность slug
      while (await Category.findOne({ slug, _id: { $ne: category._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      category.slug = slug;
      await category.save();
      console.log(`Generated slug "${slug}" for category "${category.name}"`);
    }

    console.log('All slugs generated successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

generateSlugsForCategories();

