const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getMyBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  confirmBooking,
  bulkUpdateBookings,
} = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateBooking,
  validateBookingId,
} = require('../middleware/validation');
const { bookingRateLimiter } = require('../middleware/security');

// Ruta pública (para formulario de reserva) - acepta usuarios autenticados y no autenticados
// Si viene con token, se asociará al usuario; si no, se crea sin userId
router.post('/', bookingRateLimiter, validateBooking, (req, res, next) => {
  // Si hay token, verificar pero no requerir (opcional)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    // Si hay token, usar middleware de autenticación pero continuar aunque falle
    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET || 'yassline-tour-secret-key-change-in-production', (err, user) => {
      if (!err && user) {
        req.user = user; // Agregar usuario al request si el token es válido
      }
      next(); // Continuar siempre
    });
  } else {
    next(); // Continuar sin autenticación
  }
}, createBooking);

// Rutas protegidas
router.get('/my', authenticateToken, getMyBookings); // Reservas del usuario autenticado
router.get('/', authenticateToken, getAllBookings); // Todas las reservas (solo admin)
router.put('/bulk', authenticateToken, bulkUpdateBookings); // Acciones masivas
router.get('/:id', authenticateToken, validateBookingId, getBookingById);
router.put('/:id', authenticateToken, validateBookingId, updateBooking);
router.put('/:id/confirm', authenticateToken, validateBookingId, confirmBooking);
router.delete('/:id', authenticateToken, validateBookingId, deleteBooking);

module.exports = router;
