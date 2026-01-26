const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateVehicle,
  validateVehicleId,
} = require('../middleware/validation');

// Rutas públicas
router.get('/', getAllVehicles);
router.get('/:id', validateVehicleId, getVehicleById);

// Rutas protegidas
router.post('/', authenticateToken, validateVehicle, createVehicle);
router.put('/:id', authenticateToken, validateVehicleId, validateVehicle, updateVehicle);
router.delete('/:id', authenticateToken, validateVehicleId, deleteVehicle);

module.exports = router;
