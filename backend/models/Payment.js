const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Reserva asociada
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    index: true,
  },
  
  // Usuario asociado (opcional)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  
  // Información del cliente
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  
  // Método de pago
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'bank_transfer', 'binance', 'redotpay', 'moneygram'],
    index: true,
  },
  
  // Monto y moneda
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  currency: {
    type: String,
    required: true,
    default: 'MAD',
    enum: ['MAD', 'EUR', 'USD', 'USDT', 'BTC', 'ETH'],
  },
  
  // Estado del pago
  status: {
    type: String,
    required: true,
    enum: ['pending', 'pending_review', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true,
  },
  
  // Detalles específicos por método de pago
  // Efectivo
  cash: {
    receivedBy: String,
    receivedAt: Date,
    notes: String,
  },
  
  // Transferencia bancaria
  bankTransfer: {
    reference: String,
    bankName: String,
    accountNumber: String,
    transferDate: Date,
    proofImage: String, // URL de la imagen del comprobante
  },
  
  // Binance Pay
  binance: {
    transactionHash: String,
    walletAddress: String,
    network: String, // BSC, ETH, etc.
    currency: String, // USDT, BTC, ETH, etc.
    qrCode: String, // URL del código QR
    prepayId: String,
  },
  
  // Redotpay
  redotpay: {
    transactionId: String,
    paymentUrl: String,
    qrCode: String,
    orderId: String,
  },
  
  // MoneyGram
  moneygram: {
    referenceNumber: String,
    senderName: String,
    receiverName: String,
    country: String,
    amountSent: Number,
    currency: String,
    transactionDate: Date,
  },
  
  // Detalles adicionales (JSON flexible)
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  
  // Información de reembolso
  refund: {
    amount: Number,
    reason: String,
    refundedAt: Date,
    refundedBy: String,
  },
  
  // Notas internas
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Índices para búsquedas
paymentSchema.index({ bookingId: 1, status: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ paymentMethod: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

// Métodos del modelo
paymentSchema.methods.markAsCompleted = async function() {
  this.status = 'completed';
  await this.save();
  return this;
};

paymentSchema.methods.markAsFailed = async function(reason) {
  this.status = 'failed';
  if (reason) {
    this.notes = (this.notes || '') + `\nError: ${reason}`;
  }
  await this.save();
  return this;
};

paymentSchema.methods.markAsCancelled = async function(reason) {
  this.status = 'cancelled';
  if (reason) {
    this.notes = (this.notes || '') + `\nCancelado: ${reason}`;
  }
  await this.save();
  return this;
};

paymentSchema.methods.processRefund = async function(amount, reason, refundedBy) {
  this.status = 'refunded';
  this.refund = {
    amount: amount || this.amount,
    reason: reason || 'Reembolso solicitado',
    refundedAt: new Date(),
    refundedBy: refundedBy || 'Sistema',
  };
  await this.save();
  return this;
};

paymentSchema.methods.markAsPendingReview = async function() {
  this.status = 'pending_review';
  await this.save();
  return this;
};

module.exports = mongoose.model('Payment', paymentSchema);
