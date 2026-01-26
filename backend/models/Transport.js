const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['airport', 'intercity', 'hourly', 'custom'],
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String, // Nombre del icono de lucide-react
    default: 'car',
  },
  price: {
    type: Number,
    min: 0,
  },
  priceLabel: {
    type: String, // Ej: "Desde 50€"
    default: '',
  },
  route: {
    from: {
      type: String,
      default: '',
    },
    to: {
      type: String,
      default: '',
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Transport', transportSchema);
