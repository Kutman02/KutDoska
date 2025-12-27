// src/models/Category.js
import mongoose from "mongoose";

const { Schema } = mongoose;

// Функция для генерации slug из названия
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Удаляем спецсимволы
    .replace(/[\s_-]+/g, '-') // Заменяем пробелы и подчеркивания на дефисы
    .replace(/^-+|-+$/g, ''); // Удаляем дефисы в начале и конце
};

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true, // Позволяет null значениям быть уникальными
      trim: true,
    },
    icon: {
      type: String, 
      required: function() {
        return !this.parent; 
      },
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, 
    },
    subcategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Middleware для автоматической генерации slug перед сохранением
categorySchema.pre('save', async function(next) {
  // Генерируем slug только если его нет и есть name
  if (!this.slug && this.name) {
    let baseSlug = generateSlug(this.name);
    let slug = baseSlug;
    let counter = 1;
    
    // Проверяем уникальность slug
    while (await mongoose.model('Category').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = slug;
  }
  next();
});

// Middleware для автоматического обновления массива subcategories у родителя
categorySchema.pre('save', async function(next) {
    if (this.isNew && this.parent) {
        await mongoose.model('Category').findByIdAndUpdate(
            this.parent,
            { $addToSet: { subcategories: this._id } },
            { new: true }
        );
    }
    next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;