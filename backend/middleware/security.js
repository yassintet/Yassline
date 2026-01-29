const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

/**
 * Configuración de Helmet para headers de seguridad
 */
const setupHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Permitir recursos externos si es necesario
    crossOriginResourcePolicy: { policy: "cross-origin" },
  });
};

/**
 * Rate Limiting General - Protección básica contra DDoS
 * Más permisivo para usuarios normales navegando el sitio
 * Desarrollo: 2000 requests por 15 minutos
 * Producción: 1000 requests por 15 minutos (suficiente para navegación normal)
 */
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 2000 : 1000, // Mucho más permisivo
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
    error: 'Rate limit exceeded',
  },
  standardHeaders: true, // Retorna info de rate limit en headers `RateLimit-*`
  legacyHeaders: false, // Desactiva headers `X-RateLimit-*`
  skip: (req) => {
    // Saltar rate limiting en desarrollo para testing
    if (process.env.NODE_ENV === 'development' && req.path.startsWith('/api/test')) {
      return true;
    }
    // Excluir rutas que tienen su propio rate limiter específico
    if (req.path.startsWith('/api/distance')) {
      return true; // Tiene distanceRateLimiter
    }
    if (req.path.startsWith('/api/bookings') && req.method === 'POST') {
      return true; // Tiene bookingRateLimiter aplicado en la ruta
    }
    if (req.path.startsWith('/api/contact') && req.method === 'POST') {
      return true; // Tiene contactRateLimiter aplicado en la ruta
    }
    if (req.path.startsWith('/api/auth')) {
      return true; // Tiene authRateLimiter y passwordResetRateLimiter aplicados en las rutas
    }
    if (req.path.startsWith('/api/payments')) {
      return true; // Las rutas de pagos tienen su propia lógica de autenticación opcional
    }
    return false;
  },
});

/**
 * Rate Limiting Estricto para Autenticación
 * Más permisivo: solo cuenta intentos fallidos
 * Desarrollo: 100 intentos por 5 minutos
 * Producción: 30 intentos por 15 minutos (razonable para usuarios normales)
 */
const authRateLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'development' ? 5 * 60 * 1000 : 15 * 60 * 1000, // 5 min en dev, 15 min en prod
  max: process.env.NODE_ENV === 'development' ? 100 : 30, // Más permisivo
  message: {
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 5 minutos.'
      : 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos.',
    error: 'Too many login attempts',
  },
  skipSuccessfulRequests: true, // No contar requests exitosos (solo cuenta fallos)
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiting para Creación de Reservas
 * Más permisivo: permite más reservas para usuarios legítimos
 * Desarrollo: 50 reservas por hora
 * Producción: 20 reservas por hora (razonable para usuarios normales)
 */
const bookingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: process.env.NODE_ENV === 'development' ? 50 : 20, // Más permisivo
  message: {
    success: false,
    message: 'Demasiadas solicitudes de reserva. Por favor intenta de nuevo más tarde.',
    error: 'Too many booking requests',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiting para Formularios de Contacto
 * Más permisivo: permite más mensajes para usuarios legítimos
 * Desarrollo: 20 mensajes por hora
 * Producción: 10 mensajes por hora (razonable para usuarios normales)
 */
const contactRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: process.env.NODE_ENV === 'development' ? 20 : 10, // Más permisivo
  message: {
    success: false,
    message: 'Demasiados mensajes enviados. Por favor intenta de nuevo más tarde.',
    error: 'Too many contact requests',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiting para Recuperación de Contraseña
 * Limita a 3 intentos por hora por IP
 */
const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 intentos por hora
  message: {
    success: false,
    message: 'Demasiados intentos de recuperación de contraseña. Por favor intenta de nuevo más tarde.',
    error: 'Too many password reset attempts',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiting para APIs Públicas (más permisivo)
 * Limita a 200 requests por 15 minutos por IP
 */
const publicApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // máximo 200 requests por IP
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Por favor intenta de nuevo más tarde.',
    error: 'Rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiting para Cálculo de Distancias (muy permisivo)
 * Esta ruta se usa frecuentemente durante la navegación del usuario
 * Desarrollo: 200 requests por minuto
 * Producción: 100 requests por minuto (suficiente para navegación normal)
 */
const distanceRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: process.env.NODE_ENV === 'development' ? 200 : 100, // Mucho más permisivo
  message: {
    success: false,
    message: 'Demasiadas solicitudes de cálculo de distancia. Por favor espera un momento.',
    error: 'Rate limit exceeded',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting en desarrollo para testing
    return process.env.NODE_ENV === 'development' && req.path.startsWith('/api/test');
  },
});

/**
 * Sanitización de inputs - Remover caracteres peligrosos
 */
const sanitizeInput = (req, res, next) => {
  // Función recursiva para sanitizar objetos
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remover caracteres peligrosos pero mantener formato básico
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remover scripts
        .replace(/javascript:/gi, '') // Remover javascript:
        .replace(/on\w+\s*=/gi, '') // Remover event handlers (onclick, onerror, etc.)
        .trim();
    } else if (Array.isArray(obj)) {
      return obj.map(sanitize);
    } else if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  // Sanitizar body, query y params
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

/**
 * Logging de seguridad - Registrar actividades sospechosas
 */
const securityLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union.*select/i,
    /drop.*table/i,
    /exec.*\(/i,
    /eval\(/i,
  ];

  const checkSuspicious = (obj, path = '') => {
    if (typeof obj === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(obj)) {
          console.warn(`⚠️  [SECURITY] Patrón sospechoso detectado en ${path}:`, {
            ip: req.ip || req.connection.remoteAddress,
            method: req.method,
            path: req.path,
            userAgent: req.get('user-agent'),
            timestamp: new Date().toISOString(),
            suspiciousContent: obj.substring(0, 100), // Solo primeros 100 caracteres
          });
          break;
        }
      }
    } else if (Array.isArray(obj)) {
      obj.forEach((item, index) => checkSuspicious(item, `${path}[${index}]`));
    } else if (obj && typeof obj === 'object') {
      for (const key in obj) {
        checkSuspicious(obj[key], path ? `${path}.${key}` : key);
      }
    }
  };

  // Verificar body, query y params
  if (req.body) checkSuspicious(req.body, 'body');
  if (req.query) checkSuspicious(req.query, 'query');
  if (req.params) checkSuspicious(req.params, 'params');

  next();
};

/**
 * Validar tamaño de payload
 */
const validatePayloadSize = (maxSize = 1024 * 1024) => { // 1MB por defecto
  return (req, res, next) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        message: 'El payload es demasiado grande',
        error: 'Payload too large',
      });
    }
    
    next();
  };
};

module.exports = {
  setupHelmet,
  generalRateLimiter,
  authRateLimiter,
  bookingRateLimiter,
  contactRateLimiter,
  passwordResetRateLimiter,
  publicApiRateLimiter,
  distanceRateLimiter,
  sanitizeInput,
  securityLogger,
  validatePayloadSize,
};
