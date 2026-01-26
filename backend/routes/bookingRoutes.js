const express = require('express');
const router = express.Router();
const {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  confirmBooking,
} = require('../controllers/bookingController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateBooking,
  validateBookingId,
} = require('../middleware/validation');

// Ruta pública (para formulario de reserva)
router.post('/', validateBooking, createBooking);

// Rutas protegidas
router.get('/', authenticateToken, getAllBookings);
router.get('/:id', authenticateToken, validateBookingId, getBookingById);
router.put('/:id', authenticateToken, validateBookingId, updateBooking);
router.put('/:id/confirm', authenticateToken, validateBookingId, confirmBooking);
router.delete('/:id', authenticateToken, validateBookingId, deleteBooking);

module.exports = router;
