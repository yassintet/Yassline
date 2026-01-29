const express = require('express');
const router = express.Router();
const {
  getProfile,
  getPointsHistory,
  getFavorites,
  addFavorite,
  removeFavorite,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.get('/profile', authenticateToken, getProfile);
router.get('/points-history', authenticateToken, getPointsHistory);
router.get('/favorites', authenticateToken, getFavorites);
router.post('/favorites', authenticateToken, addFavorite);
router.delete('/favorites/:id', authenticateToken, removeFavorite);
router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id/read', authenticateToken, markNotificationRead);
router.put('/notifications/read-all', authenticateToken, markAllNotificationsRead);

module.exports = router;
