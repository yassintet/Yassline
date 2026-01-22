const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

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

// Rutas públicas
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Ruta protegida
router.get('/me', authenticateToken, getMe);

module.exports = router;
