const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

// Ruta protegida - solo admin
router.get('/dashboard', authenticateToken, getDashboardStats);

module.exports = router;
