const User = require('../models/User');
const Booking = require('../models/Booking');
const PointsHistory = require('../models/PointsHistory');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');

// GET /api/users/profile - Obtener perfil completo con estadísticas
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Obtener estadísticas
    const totalBookings = await Booking.countDocuments({ userId });
    const confirmedBookings = await Booking.countDocuments({ userId, status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ userId, status: 'completed' });
    const totalFavorites = await Favorite.countDocuments({ userId });
    const unreadNotifications = await Notification.countDocuments({ userId, read: false });

    // Calcular próximo nivel
    let nextLevel = null;
    let pointsNeeded = 0;
    if (user.points < 3500) {
      nextLevel = 'silver';
      pointsNeeded = 3500 - user.points;
    } else if (user.points < 10000) {
      nextLevel = 'gold';
      pointsNeeded = 10000 - user.points;
    } else if (user.points < 100000) {
      nextLevel = 'platinum';
      pointsNeeded = 100000 - user.points;
    } else if (user.points < 1000000) {
      nextLevel = 'diamante';
      pointsNeeded = 1000000 - user.points;
    }

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalBookings,
          confirmedBookings,
          completedBookings,
          totalFavorites,
          unreadNotifications,
        },
        nextLevel: nextLevel ? {
          level: nextLevel,
          pointsNeeded,
          madNeeded: pointsNeeded * 10,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil',
      error: error.message,
    });
  }
};

// GET /api/users/points-history - Obtener historial de puntos
exports.getPointsHistory = async (req, res) => {
  try {
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
    console.error('Error obteniendo historial de puntos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial',
      error: error.message,
    });
  }
};

// GET /api/users/favorites - Obtener favoritos del usuario
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const favorites = await Favorite.find({ userId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener favoritos',
      error: error.message,
    });
  }
};

// POST /api/users/favorites - Agregar favorito
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { serviceType, serviceId } = req.body;

    if (!serviceType || !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'serviceType y serviceId son requeridos',
      });
    }

    if (!['transport', 'circuit'].includes(serviceType)) {
      return res.status(400).json({
        success: false,
        message: 'serviceType debe ser "transport" o "circuit"',
      });
    }

    const favorite = await Favorite.findOneAndUpdate(
      { userId, serviceType, serviceId },
      { userId, serviceType, serviceId },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Favorito agregado exitosamente',
      data: favorite,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Este servicio ya está en tus favoritos',
      });
    }
    console.error('Error agregando favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar favorito',
      error: error.message,
    });
  }
};

// DELETE /api/users/favorites/:id - Eliminar favorito
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const favoriteId = req.params.id;

    const favorite = await Favorite.findOneAndDelete({ _id: favoriteId, userId });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorito no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Favorito eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando favorito:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar favorito',
      error: error.message,
    });
  }
};

// GET /api/users/notifications - Obtener notificaciones
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, read: false });

    res.json({
      success: true,
      data: notifications,
      total,
      unreadCount,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error.message,
    });
  }
};

// PUT /api/users/notifications/:id/read - Marcar notificación como leída
exports.markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada',
      });
    }

    res.json({
      success: true,
      message: 'Notificación marcada como leída',
      data: notification,
    });
  } catch (error) {
    console.error('Error marcando notificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificación',
      error: error.message,
    });
  }
};

// PUT /api/users/notifications/read-all - Marcar todas como leídas
exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
    });
  } catch (error) {
    console.error('Error marcando notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar notificaciones',
      error: error.message,
    });
  }
};
