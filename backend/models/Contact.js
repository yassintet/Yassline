const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
  },
  phone: {
    type: String,
    trim: true,
  },
  serviceType: {
    type: String,
    enum: ['transporte', 'circuito', 'hotel', 'otro'],
    default: 'otro',
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new',
  },
  notes: {
    type: String, // Notas internas del equipo
    default: '',
  },
}, {
  timestamps: true,
});

// Índice para búsquedas por estado y fecha
contactSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
