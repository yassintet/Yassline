const mongoose = require('mongoose');

const pointsHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },
  points: {
    type: Number,
    required: true,
  },
  pointsBefore: {
    type: Number,
    required: true,
  },
  pointsAfter: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    enum: ['booking_confirmed', 'booking_completed', 'booking_cancelled', 'reward_redeemed', 'admin_adjustment', 'bonus'],
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  bookingPrice: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Índices para consultas eficientes
pointsHistorySchema.index({ userId: 1, createdAt: -1 });
pointsHistorySchema.index({ bookingId: 1 });

module.exports = mongoose.model('PointsHistory', pointsHistorySchema);
