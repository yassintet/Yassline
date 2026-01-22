const mongoose = require('mongoose');

const circuitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true, // Para búsquedas rápidas
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: String, // Ej: "5 Días / 4 Noches"
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  priceLabel: {
    type: String, // Ej: "Desde 450€ / persona"
    default: '',
  },
  image: {
    type: String, // URL de la imagen
    default: '',
  },
  itinerary: [
    {
      day: {
        type: Number,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
  ],
  includes: [
    {
      type: String, // Ej: "Chofer privado", "Combustible", "Hoteles"
    },
  ],
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  }, // Para URLs amigables: /circuitos/imperial
  featured: {
    type: Boolean,
    default: false,
  }, // Circuito destacado
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // Crea createdAt y updatedAt automáticamente
});

// Crear índice de texto para búsqueda (compatible con Atlas Search)
circuitSchema.index({ name: 'text', title: 'text', description: 'text' });

// Middleware para generar slug automáticamente
circuitSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio/final
  }
  next();
});

module.exports = mongoose.model('Circuit', circuitSchema);
