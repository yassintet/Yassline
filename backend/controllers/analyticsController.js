const Booking = require('../models/Booking');
const User = require('../models/User');
const Contact = require('../models/Contact');

// GET /api/analytics/dashboard - Estadísticas del dashboard admin
exports.getDashboardStats = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo administradores.',
      });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Estadísticas de reservas
    const totalBookings = await Booking.countDocuments({});
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Reservas del mes actual
    const bookingsThisMonth = await Booking.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Reservas del mes anterior
    const bookingsLastMonth = await Booking.countDocuments({
      createdAt: { $gte: lastMonth, $lte: endOfLastMonth },
    });

    // Ingresos
    const totalRevenue = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$total', { $ifNull: ['$calculatedPrice', 0] }] } } } },
    ]);

    const revenueThisMonth = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$total', { $ifNull: ['$calculatedPrice', 0] }] } } } },
    ]);

    const revenueLastMonth = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: lastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$total', { $ifNull: ['$calculatedPrice', 0] }] } } } },
    ]);

    // Reservas por tipo de servicio
    const bookingsByType = await Booking.aggregate([
      { $group: { _id: '$serviceType', count: { $sum: 1 } } },
    ]);

    // Reservas por mes (últimos 6 meses)
    const bookingsByMonth = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $in: ['$status', ['confirmed', 'completed']] },
                { $ifNull: ['$total', { $ifNull: ['$calculatedPrice', 0] }] },
                0
              ]
            }
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Estadísticas de usuarios
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ active: true });
    const usersWithBookings = await User.countDocuments({ totalBookings: { $gt: 0 } });

    // Usuarios por nivel de membresía
    const usersByMembership = await User.aggregate([
      { $group: { _id: '$membershipLevel', count: { $sum: 1 } } },
    ]);

    // Mensajes de contacto
    const totalContacts = await Contact.countDocuments({});
    const contactsThisMonth = await Contact.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Reservas recientes (últimas 10)
    const recentBookings = await Booking.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('nombre email serviceName status createdAt total calculatedPrice');

    res.json({
      success: true,
      data: {
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          thisMonth: bookingsThisMonth,
          lastMonth: bookingsLastMonth,
          growth: bookingsLastMonth > 0 
            ? (((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100).toFixed(1)
            : bookingsThisMonth > 0 ? '100' : '0',
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          thisMonth: revenueThisMonth[0]?.total || 0,
          lastMonth: revenueLastMonth[0]?.total || 0,
          growth: revenueLastMonth[0]?.total > 0
            ? (((revenueThisMonth[0]?.total - revenueLastMonth[0]?.total) / revenueLastMonth[0]?.total) * 100).toFixed(1)
            : revenueThisMonth[0]?.total > 0 ? '100' : '0',
        },
        bookingsByType: bookingsByType,
        bookingsByMonth: bookingsByMonth,
        users: {
          total: totalUsers,
          active: activeUsers,
          withBookings: usersWithBookings,
          byMembership: usersByMembership,
        },
        contacts: {
          total: totalContacts,
          thisMonth: contactsThisMonth,
        },
        recentBookings: recentBookings,
      },
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message,
    });
  }
};
