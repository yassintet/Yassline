const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generar token JWT
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'yassline-tour-secret-key-change-in-production',
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register - Registrar nuevo usuario
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El usuario o email ya está registrado',
      });
    }

    // Crear nuevo usuario
    const user = new User({
      username,
      email,
      password,
      role: 'user', // Por defecto es usuario normal
    });

    await user.save();

    // Generar token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al registrar usuario',
      error: error.message,
    });
  }
};

// POST /api/auth/login - Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email o username
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'Usuario desactivado. Contacta al administrador',
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      });
    }

    // Generar token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message,
    });
  }
};

// GET /api/auth/me - Obtener información del usuario actual
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
      error: error.message,
    });
  }
};
