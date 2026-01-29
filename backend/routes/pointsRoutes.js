const express = require('express');
const router = express.Router();
const {
  getMyPoints,
  getPointsHistory,
  getAvailableRewards,
  redeemReward,
  getMyRewards,
  seedRewards,
} = require('../controllers/pointsController');
const { authenticateToken } = require('../middleware/auth');

// Rutas protegidas - todas requieren autenticación
router.get('/me', authenticateToken, getMyPoints);
router.get('/history', authenticateToken, getPointsHistory);
router.get('/rewards', authenticateToken, getAvailableRewards);
router.get('/rewards/my', authenticateToken, getMyRewards);
router.post('/rewards/:id/redeem', authenticateToken, redeemReward);

// Ruta administrativa para poblar recompensas
router.post('/admin/seed-rewards', authenticateToken, seedRewards);

module.exports = router;
