const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Usuario asociado (opcional, para usuarios registrados)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  
  // Información del cliente
  nombre: {
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
  telefono: {
    type: String,
    trim: true,
  },
  
  // Información del servicio
  serviceName: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['airport', 'intercity', 'hourly', 'custom', 'vehicle'],
  },
  serviceId: {
    type: String,
    ref: 'Transport',
  },
  
  // Detalles de la reserva
  fecha: {
    type: String,
  },
  hora: {
    type: String,
  },
  pasajeros: {
    type: Number,
    default: 1,
  },
  
  // Precio
  priceLabel: {
    type: String,
  },
  calculatedPrice: {
    type: Number,
  },
  proposedPrice: {
    type: Number,
  },
  priceStatus: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: null,
    required: false,
  },
  
  // Detalles adicionales (JSON para flexibilidad)
  details: {
    type: String,
  },
  mensaje: {
    type: String,
  },
  
  // Datos específicos por tipo de servicio
  customData: {
    type: mongoose.Schema.Types.Mixed,
  },
  airportData: {
    type: mongoose.Schema.Types.Mixed,
  },
  routeData: {
    from: String,
    to: String,
  },
  
  // Estado de la reserva
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  
  // Información de facturación
  reservationNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  total: {
    type: Number,
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null,
  },
  
  // Notas internas
  notes: {
    type: String,
  },
  
  // Control de recordatorios
  lastReminderSent: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Índices para búsquedas
bookingSchema.index({ email: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ userId: 1, createdAt: -1 }); // Para búsquedas por usuario
// Nota: reservationNumber e invoiceNumber tienen índices únicos definidos en los campos

// Generar número de reserva antes de guardar si está confirmada
// Nota: Cuando usas async, Mongoose no pasa el callback next
bookingSchema.pre('save', async function() {
  // Solo generar números si la reserva está confirmada
  if (this.status === 'confirmed') {
    if (!this.reservationNumber) {
      const count = await mongoose.model('Booking').countDocuments();
      this.reservationNumber = `RES-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    }
    if (!this.invoiceNumber) {
      const count = await mongoose.model('Booking').countDocuments({ invoiceNumber: { $exists: true } });
      this.invoiceNumber = `INV-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    }
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
