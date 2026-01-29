const User = require('../models/User');
const Reward = require('../models/Reward');

// Datos de recompensas por defecto
const defaultRewards = [
  {
    name: 'Descuento 10€',
    nameEs: 'Descuento 10€',
    nameEn: '10€ Discount',
    nameFr: 'Réduction de 10€',
    description: 'Obtén un descuento fijo de 10€ en tu próxima reserva',
    descriptionEs: 'Obtén un descuento fijo de 10€ en tu próxima reserva',
    descriptionEn: 'Get a fixed 10€ discount on your next booking',
    descriptionFr: 'Obtenez une réduction fixe de 10€ sur votre prochaine réservation',
    pointsRequired: 200,
    type: 'discount',
    discountAmount: 10,
    serviceType: 'any',
    active: true,
  },
  {
    name: 'Descuento 10%',
    nameEs: 'Descuento 10%',
    nameEn: '10% Discount',
    nameFr: 'Réduction de 10%',
    description: 'Obtén un 10% de descuento en tu próxima reserva',
    descriptionEs: 'Obtén un 10% de descuento en tu próxima reserva',
    descriptionEn: 'Get a 10% discount on your next booking',
    descriptionFr: 'Obtenez une réduction de 10% sur votre prochaine réservation',
    pointsRequired: 500,
    type: 'discount',
    discountPercent: 10,
    serviceType: 'any',
    active: true,
  },
  {
    name: 'Descuento 15%',
    nameEs: 'Descuento 15%',
    nameEn: '15% Discount',
    nameFr: 'Réduction de 15%',
    description: 'Obtén un 15% de descuento en tu próxima reserva',
    descriptionEs: 'Obtén un 15% de descuento en tu próxima reserva',
    descriptionEn: 'Get a 15% discount on your next booking',
    descriptionFr: 'Obtenez une réduction de 15% sur votre prochaine réservation',
    pointsRequired: 1000,
    type: 'discount',
    discountPercent: 15,
    serviceType: 'any',
    active: true,
  },
  {
    name: 'Descuento 20%',
    nameEs: 'Descuento 20%',
    nameEn: '20% Discount',
    nameFr: 'Réduction de 20%',
    description: 'Obtén un 20% de descuento en tu próxima reserva',
    descriptionEs: 'Obtén un 20% de descuento en tu próxima reserva',
    descriptionEn: 'Get a 20% discount on your next booking',
    descriptionFr: 'Obtenez une réduction de 20% sur votre prochaine réservation',
    pointsRequired: 2000,
    type: 'discount',
    discountPercent: 20,
    serviceType: 'any',
    active: true,
  },
  {
    name: 'Servicio de Aeropuerto Gratis',
    nameEs: 'Servicio de Aeropuerto Gratis',
    nameEn: 'Free Airport Service',
    nameFr: 'Service Aéroport Gratuit',
    description: 'Un servicio de transfer al aeropuerto completamente gratis',
    descriptionEs: 'Un servicio de transfer al aeropuerto completamente gratis',
    descriptionEn: 'A completely free airport transfer service',
    descriptionFr: 'Un service de transfert aéroport complètement gratuit',
    pointsRequired: 3000,
    type: 'service',
    serviceType: 'airport',
    active: true,
  },
  {
    name: 'Upgrade a Vehículo Premium',
    nameEs: 'Upgrade a Vehículo Premium',
    nameEn: 'Upgrade to Premium Vehicle',
    nameFr: 'Mise à Niveau vers Véhicule Premium',
    description: 'Mejora tu reserva a un vehículo de categoría superior sin costo adicional',
    descriptionEs: 'Mejora tu reserva a un vehículo de categoría superior sin costo adicional',
    descriptionEn: 'Upgrade your booking to a higher category vehicle at no additional cost',
    descriptionFr: 'Améliorez votre réservation vers un véhicule de catégorie supérieure sans frais supplémentaires',
    pointsRequired: 2500,
    type: 'upgrade',
    serviceType: 'any',
    active: true,
  },
  {
    name: 'Descuento 50€',
    nameEs: 'Descuento 50€',
    nameEn: '50€ Discount',
    nameFr: 'Réduction de 50€',
    description: 'Obtén un descuento fijo de 50€ en tu próxima reserva',
    descriptionEs: 'Obtén un descuento fijo de 50€ en tu próxima reserva',
    descriptionEn: 'Get a fixed 50€ discount on your next booking',
    descriptionFr: 'Obtenez une réduction fixe de 50€ sur votre prochaine réservation',
    pointsRequired: 5000,
    type: 'discount',
    discountAmount: 50,
    serviceType: 'any',
    active: true,
  },
];

// GET /api/points/me - Obtener puntos del usuario autenticado
exports.getMyPoints = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const user = await User.findById(req.user.userId).select('points totalSpent totalBookings membershipLevel');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Calcular nivel de membresía si no está actualizado
    // Sistema: 10 MAD = 1 punto
    // Diamante: 1,000,000+ puntos (10,000,000+ MAD)
    // Platinum: 100,000+ puntos (1,000,000+ MAD)
    // Gold: 10,000+ puntos (100,000+ MAD)
    // Silver: 3,500+ puntos (35,000+ MAD)
    // Bronze: menos de 3,500 puntos (menos de 35,000 MAD)
    let membershipLevel = user.membershipLevel || 'bronze';
    if (user.points >= 1000000) {
      membershipLevel = 'diamante';
    } else if (user.points >= 100000) {
      membershipLevel = 'platinum';
    } else if (user.points >= 10000) {
      membershipLevel = 'gold';
    } else if (user.points >= 3500) {
      membershipLevel = 'silver';
    } else {
      membershipLevel = 'bronze';
    }

    // Actualizar nivel si cambió
    if (user.membershipLevel !== membershipLevel) {
      user.membershipLevel = membershipLevel;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        points: user.points || 0,
        totalSpent: user.totalSpent || 0,
        totalBookings: user.totalBookings || 0,
        membershipLevel: membershipLevel,
      },
    });
  } catch (error) {
    console.error('Error obteniendo puntos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener puntos',
      error: error.message,
    });
  }
};

// GET /api/points/history - Obtener historial de puntos (deprecated - usar /api/users/points-history)
exports.getPointsHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    // Redirigir a la nueva ruta
    const PointsHistory = require('../models/PointsHistory');
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const history = await PointsHistory.find({ userId })
      .populate('bookingId', 'serviceName serviceType fecha')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PointsHistory.countDocuments({ userId });

    res.json({
      success: true,
      data: history,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message,
    });
  }
};

// GET /api/rewards - Obtener recompensas disponibles
exports.getAvailableRewards = async (req, res) => {
  try {
    const userPoints = req.user && req.user.userId 
      ? (await User.findById(req.user.userId).select('points'))?.points || 0
      : 0;

    // Obtener TODAS las recompensas activas (no filtrar por puntos del usuario)
    // El frontend decidirá cuáles puede canjear
    const rewards = await Reward.find({
      active: true,
      $or: [
        { validUntil: { $exists: false } },
        { validUntil: null },
        { validUntil: { $gte: new Date() } },
      ],
      $or: [
        { maxRedemptions: null },
        { $expr: { $lt: ['$currentRedemptions', '$maxRedemptions'] } },
      ],
    }).sort({ pointsRequired: 1 });

    res.json({
      success: true,
      data: rewards,
      userPoints: userPoints,
    });
  } catch (error) {
    console.error('Error obteniendo recompensas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recompensas',
      error: error.message,
    });
  }
};

// POST /api/rewards/:id/redeem - Canjear recompensa
exports.redeemReward = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const userId = req.user.userId;
    const rewardId = req.params.id;

    const user = await User.findById(userId);
    const reward = await Reward.findById(rewardId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Recompensa no encontrada',
      });
    }

    if (!reward.active) {
      return res.status(400).json({
        success: false,
        message: 'Esta recompensa no está disponible',
      });
    }

    if (user.points < reward.pointsRequired) {
      return res.status(400).json({
        success: false,
        message: `No tienes suficientes puntos. Necesitas ${reward.pointsRequired} puntos y tienes ${user.points}`,
      });
    }

    // Verificar validez temporal
    if (reward.validUntil && new Date(reward.validUntil) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Esta recompensa ha expirado',
      });
    }

    // Verificar límite de canjes
    if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
      return res.status(400).json({
        success: false,
        message: 'Esta recompensa ya no está disponible (límite alcanzado)',
      });
    }

    // Descontar puntos
    user.points -= reward.pointsRequired;

    // Agregar recompensa al usuario
    user.rewards.push({
      rewardId: reward._id,
      redeemedAt: new Date(),
      used: false,
    });

    await user.save();

    // Actualizar contador de canjes
    reward.currentRedemptions = (reward.currentRedemptions || 0) + 1;
    await reward.save();

    res.json({
      success: true,
      message: 'Recompensa canjeada exitosamente',
      data: {
        reward: reward,
        remainingPoints: user.points,
      },
    });
  } catch (error) {
    console.error('Error canjeando recompensa:', error);
    res.status(500).json({
      success: false,
      message: 'Error al canjear recompensa',
      error: error.message,
    });
  }
};

// GET /api/rewards/my - Obtener recompensas canjeadas por el usuario
exports.getMyRewards = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const user = await User.findById(req.user.userId)
      .populate('rewards.rewardId')
      .select('rewards');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: user.rewards || [],
    });
  } catch (error) {
    console.error('Error obteniendo recompensas del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener recompensas',
      error: error.message,
    });
  }
};

// POST /api/points/admin/seed-rewards - Poblar recompensas por defecto (solo admin)
exports.seedRewards = async (req, res) => {
  try {
    // Verificar que sea admin
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores pueden ejecutar esta acción.',
      });
    }

    // Eliminar recompensas existentes
    await Reward.deleteMany({});
    console.log('✅ Recompensas existentes eliminadas');

    // Insertar recompensas por defecto
    const insertedRewards = await Reward.insertMany(defaultRewards);
    console.log(`✅ ${insertedRewards.length} recompensas insertadas`);

    res.json({
      success: true,
      message: `${insertedRewards.length} recompensas creadas exitosamente`,
      data: insertedRewards,
    });
  } catch (error) {
    console.error('Error poblando recompensas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al poblar recompensas',
      error: error.message,
    });
  }
};
