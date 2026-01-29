const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPaymentById,
  getPaymentsByBooking,
  getMyPayments,
  confirmPayment,
  verifyPayment,
  binanceWebhook,
  redotpayWebhook,
  getAllPayments,
  markAsPaid,
  adminConfirmPayment,
} = require('../controllers/paymentController');
const { authenticateToken, optionalAuth, isAdmin } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Validaciones para crear pago
const validateCreatePayment = [
  body('bookingId')
    .notEmpty().withMessage('El ID de reserva es requerido')
    .isMongoId().withMessage('ID de reserva inválido'),
  body('paymentMethod')
    .notEmpty().withMessage('El método de pago es requerido')
    .isIn(['cash', 'bank_transfer', 'binance', 'redotpay', 'moneygram']).withMessage('Método de pago inválido'),
  body('amount')
    .notEmpty().withMessage('El monto es requerido')
    .isFloat({ min: 0.01 }).withMessage('El monto debe ser mayor a 0'),
  body('currency')
    .optional()
    .isIn(['MAD', 'EUR', 'USD', 'USDT', 'BTC', 'ETH']).withMessage('Moneda inválida'),
  handleValidationErrors,
];

// IMPORTANTE: El orden de las rutas es crítico en Express
// Las rutas más específicas deben ir ANTES de las rutas con parámetros dinámicos

// Rutas públicas (webhooks - deben ir primero)
router.post('/webhook/binance', binanceWebhook);
router.post('/webhook/redotpay', redotpayWebhook);

// Ruta pública para obtener información bancaria (debe ir antes de rutas con parámetros)
router.get('/bank-info', (req, res) => {
  const bankInfo = require('../config/bankInfo');
  res.json({
    success: true,
    data: bankInfo,
  });
});

// Rutas de administrador (deben ir ANTES de las rutas con parámetros genéricos como /:id)
router.get('/admin/all', authenticateToken, isAdmin, getAllPayments);

// Rutas protegidas específicas (deben ir antes de las rutas con parámetros)
router.post('/', optionalAuth, validateCreatePayment, createPayment);
router.get('/my', authenticateToken, getMyPayments);
router.get('/booking/:bookingId', optionalAuth, getPaymentsByBooking);

// Rutas con parámetros dinámicos (deben ir al final, en orden de especificidad)
router.put('/:id/mark-paid', optionalAuth, markAsPaid); // Cliente marca como pagado
router.put('/:id/admin-confirm', authenticateToken, isAdmin, adminConfirmPayment); // Admin confirma pago
router.put('/:id/confirm', authenticateToken, confirmPayment);
router.post('/:id/verify', authenticateToken, verifyPayment);
router.get('/:id', optionalAuth, getPaymentById);

// Log para verificar que el router se exporta correctamente
console.log('✅ paymentRoutes router exportado correctamente');

module.exports = router;
