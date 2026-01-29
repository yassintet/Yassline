const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
  },
  telefono: {
    type: String,
    trim: true,
  },
  nombre: {
    type: String,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
  },
  
  // Sistema de puntos y beneficios (preparado para futuro)
  points: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalBookings: {
    type: Number,
    default: 0,
    min: 0,
  },
  membershipLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamante'],
    default: 'bronze',
  },
  rewards: [{
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
    },
    redeemedAt: {
      type: Date,
      default: Date.now,
    },
    used: {
      type: Boolean,
      default: false,
    },
  }],
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Hash de contraseña antes de guardar
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener usuario sin contraseña
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  // Asegurar que id esté presente (algunos clientes esperan id en lugar de _id)
  obj.id = obj._id.toString();
  return obj;
};

module.exports = mongoose.model('User', userSchema);
