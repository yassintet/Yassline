const express = require('express');
const router = express.Router();
const {
  getAllCircuits,
  getCircuitById,
  getCircuitBySlug,
  createCircuit,
  updateCircuit,
  deleteCircuit,
  searchCircuits,
} = require('../controllers/circuitController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateCircuit,
  validateCircuitId,
  validateCircuitSlug,
  validateCircuitSearch,
} = require('../middleware/validation');

// Rutas públicas
router.get('/', getAllCircuits);
router.get('/search', validateCircuitSearch, searchCircuits);
router.get('/slug/:slug', validateCircuitSlug, getCircuitBySlug);
router.get('/:id', validateCircuitId, getCircuitById);

// Rutas protegidas
router.post('/', authenticateToken, validateCircuit, createCircuit);
router.put('/:id', authenticateToken, validateCircuitId, validateCircuit, updateCircuit);
router.delete('/:id', authenticateToken, validateCircuitId, deleteCircuit);

module.exports = router;
