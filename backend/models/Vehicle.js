const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  }, // Ej: "Mercedes V-Class", "Mercedes Vito", "Mercedes Sprinter"
  type: {
    type: String,
    required: true,
    enum: ['v-class', 'vito', 'sprinter', 'other'],
  },
  capacity: {
    passengers: {
      type: Number,
      required: true,
      min: 1,
    },
    luggage: {
      type: String, // Ej: "2 maletas grandes"
      default: '',
    },
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String, // URL de la imagen
    default: '',
  },
  features: [
    {
      type: String, // Ej: "WiFi", "Aire acondicionado", "Asientos de cuero"
    },
  ],
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
