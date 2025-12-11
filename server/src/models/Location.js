// src/models/Location.js
import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["city", "district"], // город или район
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      default: null, // Если null, то это город, иначе - район города
    },
    districts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Middleware для автоматического обновления массива districts у родителя
locationSchema.pre('save', async function(next) {
    if (this.isNew && this.parent && this.type === 'district') {
        await mongoose.model('Location').findByIdAndUpdate(
            this.parent,
            { $addToSet: { districts: this._id } },
            { new: true }
        );
    }
    next();
});

const Location = mongoose.model("Location", locationSchema);
export default Location;

