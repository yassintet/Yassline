const jwt = require('jsonwebtoken');

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  // Obtener el token del header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido. Incluye el token en el header Authorization: Bearer <token>',
    });
  }

  // Verificar el token
  jwt.verify(token, process.env.JWT_SECRET || 'yassline-tour-secret-key-change-in-production', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido o expirado',
        error: err.message,
      });
    }

    // Agregar información del usuario al request
    req.user = user;
    next();
  });
};

// Middleware opcional para autenticación (no falla si no hay token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'yassline-tour-secret-key-change-in-production', (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
};

// Middleware opcional para verificar si el usuario es admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador',
    });
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
  isAdmin,
};
