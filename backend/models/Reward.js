const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nameEs: {
    type: String,
    required: true,
    trim: true,
  },
  nameEn: {
    type: String,
    required: true,
    trim: true,
  },
  nameFr: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  descriptionEs: {
    type: String,
    required: true,
    trim: true,
  },
  descriptionEn: {
    type: String,
    required: true,
    trim: true,
  },
  descriptionFr: {
    type: String,
    required: true,
    trim: true,
  },
  pointsRequired: {
    type: Number,
    required: true,
    min: 1,
  },
  type: {
    type: String,
    enum: ['discount', 'service', 'upgrade', 'gift'],
    required: true,
  },
  discountPercent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  discountAmount: {
    type: Number,
    min: 0,
    default: 0,
  },
  serviceType: {
    type: String,
    enum: ['airport', 'intercity', 'hourly', 'custom', 'any'],
    default: 'any',
  },
  active: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    trim: true,
  },
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validUntil: {
    type: Date,
  },
  maxRedemptions: {
    type: Number,
    default: null, // null = ilimitado
  },
  currentRedemptions: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Índices
rewardSchema.index({ active: 1, pointsRequired: 1 });
rewardSchema.index({ type: 1, active: 1 });

module.exports = mongoose.model('Reward', rewardSchema);
