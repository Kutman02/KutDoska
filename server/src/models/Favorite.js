// src/models/Favorite.js
import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Ссылка на модель пользователя (предполагаем, что она называется 'User')
        required: true,
    },
    ad: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ad', // Ссылка на модель объявления (предполагаем, что она называется 'Ad')
        required: true,
    },
}, {
    timestamps: true 
});

// Добавляем индекс уникальности: один и тот же пользователь не может добавить одно и то же объявление дважды
favoriteSchema.index({ user: 1, ad: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;