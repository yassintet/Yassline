const express = require('express');
const router = express.Router();
const {
  getAllTransports,
  getTransportById,
  createTransport,
  updateTransport,
  deleteTransport,
} = require('../controllers/transportController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateTransport,
  validateTransportId,
} = require('../middleware/validation');

// Rutas públicas
router.get('/', getAllTransports);
router.get('/:id', validateTransportId, getTransportById);

// Rutas protegidas
router.post('/', authenticateToken, validateTransport, createTransport);
router.put('/:id', authenticateToken, validateTransportId, validateTransport, updateTransport);
router.delete('/:id', authenticateToken, validateTransportId, deleteTransport);

module.exports = router;
