const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array(),
    });
  }
  next();
};

// Validaciones para Circuitos
const validateCircuit = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('El título es requerido')
    .isLength({ min: 5, max: 200 }).withMessage('El título debe tener entre 5 y 200 caracteres'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 20 }).withMessage('La descripción debe tener al menos 20 caracteres'),
  
  body('duration')
    .trim()
    .notEmpty().withMessage('La duración es requerida'),
  
  body('price')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  
  body('itinerary')
    .optional()
    .isArray().withMessage('El itinerario debe ser un array'),
  
  body('itinerary.*.day')
    .optional()
    .isInt({ min: 1 }).withMessage('El día debe ser un número entero positivo'),
  
  body('itinerary.*.title')
    .optional()
    .trim()
    .notEmpty().withMessage('El título del día es requerido'),
  
  body('includes')
    .optional()
    .isArray().withMessage('Los includes deben ser un array'),
  
  body('featured')
    .optional()
    .isBoolean().withMessage('Featured debe ser un booleano'),
  
  body('active')
    .optional()
    .isBoolean().withMessage('Active debe ser un booleano'),
  
  handleValidationErrors,
];

const validateCircuitId = [
  param('id')
    .isMongoId().withMessage('ID de circuito inválido'),
  handleValidationErrors,
];

const validateCircuitSlug = [
  param('slug')
    .trim()
    .notEmpty().withMessage('El slug es requerido')
    .matches(/^[a-z0-9-]+$/).withMessage('El slug solo puede contener letras minúsculas, números y guiones'),
  handleValidationErrors,
];

const validateCircuitSearch = [
  query('q')
    .trim()
    .notEmpty().withMessage('El parámetro de búsqueda (q) es requerido')
    .isLength({ min: 2 }).withMessage('La búsqueda debe tener al menos 2 caracteres'),
  handleValidationErrors,
];

// Validaciones para Transporte
const validateTransport = [
  body('type')
    .isIn(['airport', 'intercity', 'hourly', 'custom']).withMessage('Tipo de transporte inválido'),
  
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ min: 10 }).withMessage('La descripción debe tener al menos 10 caracteres'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  
  body('active')
    .optional()
    .isBoolean().withMessage('Active debe ser un booleano'),
  
  handleValidationErrors,
];

const validateTransportId = [
  param('id')
    .isMongoId().withMessage('ID de transporte inválido'),
  handleValidationErrors,
];

// Validaciones para Contacto
const validateContact = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Formato de teléfono inválido'),
  
  body('serviceType')
    .optional()
    .isIn(['transporte', 'circuito', 'hotel', 'otro']).withMessage('Tipo de servicio inválido'),
  
  body('message')
    .trim()
    .notEmpty().withMessage('El mensaje es requerido')
    .isLength({ min: 10, max: 2000 }).withMessage('El mensaje debe tener entre 10 y 2000 caracteres'),
  
  handleValidationErrors,
];

const validateContactId = [
  param('id')
    .isMongoId().withMessage('ID de contacto inválido'),
  handleValidationErrors,
];

const validateContactUpdate = [
  body('status')
    .optional()
    .isIn(['new', 'read', 'replied', 'archived']).withMessage('Estado inválido'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 }).withMessage('Las notas no pueden exceder 1000 caracteres'),
  
  handleValidationErrors,
];

// Validaciones para Vehículos
const validateVehicle = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  
  body('type')
    .isIn(['v-class', 'vito', 'sprinter', 'other']).withMessage('Tipo de vehículo inválido'),
  
  body('capacity.passengers')
    .isInt({ min: 1, max: 50 }).withMessage('El número de pasajeros debe ser entre 1 y 50'),
  
  body('capacity.luggage')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La descripción de equipaje no puede exceder 200 caracteres'),
  
  body('features')
    .optional()
    .isArray().withMessage('Las características deben ser un array'),
  
  body('active')
    .optional()
    .isBoolean().withMessage('Active debe ser un booleano'),
  
  handleValidationErrors,
];

const validateVehicleId = [
  param('id')
    .isMongoId().withMessage('ID de vehículo inválido'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateCircuit,
  validateCircuitId,
  validateCircuitSlug,
  validateCircuitSearch,
  validateTransport,
  validateTransportId,
  validateContact,
  validateContactId,
  validateContactUpdate,
  validateVehicle,
  validateVehicleId,
};
