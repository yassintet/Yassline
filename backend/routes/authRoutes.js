const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');
const { authRateLimiter, passwordResetRateLimiter } = require('../middleware/security');

// Validaciones para registro
const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 30 }).withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-z0-9_]+$/).withMessage('El nombre de usuario solo puede contener letras minúsculas, números y guiones bajos'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  
  handleValidationErrors,
];

// Validaciones para login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email o nombre de usuario es requerido'),
  
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
  
  handleValidationErrors,
];

// Rutas públicas con rate limiting
router.post('/register', authRateLimiter, validateRegister, register);
router.post('/login', authRateLimiter, validateLogin, login);
router.post('/forgot-password', passwordResetRateLimiter, [
  body('email').trim().notEmpty().withMessage('El email es requerido').isEmail().withMessage('Email inválido'),
  handleValidationErrors,
], forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, [
  body('token').notEmpty().withMessage('El token es requerido'),
  body('newPassword').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors,
], resetPassword);

// Rutas protegidas
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
  body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors,
], changePassword);

module.exports = router;
