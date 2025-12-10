// src/models/Category.js
import mongoose from "mongoose";

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
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

// Middleware для автоматического обновления массива subcategories у родителя
categorySchema.pre('save', async function(next) {
    if (this.isNew && this.parent) {
        await mongoose.model('Category').findByIdAndUpdate(
            this.parent,
            { $addToSet: { subcategories: this._id } },
            { new: true } // 💡 Убрана опция useFindAndModify: false, так как она устарела
        );
    }
    next();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;