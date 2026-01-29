const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  serviceType: {
    type: String,
    enum: ['transport', 'circuit'],
    required: true,
  },
  serviceId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Índice único para evitar duplicados
favoriteSchema.index({ userId: 1, serviceType: 1, serviceId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
