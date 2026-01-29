const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

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

// PUT /api/auth/profile - Actualizar perfil del usuario
exports.updateProfile = async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está en uso',
        });
      }
      user.email = email.toLowerCase();
    }

    if (nombre !== undefined) user.nombre = nombre;
    if (telefono !== undefined) user.telefono = telefono;

    await user.save();

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil',
      error: error.message,
    });
  }
};

// PUT /api/auth/change-password - Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Contraseña actual y nueva contraseña son requeridas',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar contraseña actual
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña actual incorrecta',
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña',
      error: error.message,
    });
  }
};

// POST /api/auth/forgot-password - Solicitar recuperación de contraseña
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Por seguridad, siempre devolvemos éxito aunque el usuario no exista
    if (!user) {
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña',
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora

    // Guardar token en el usuario
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpiry);
    await user.save();

    // Construir URL de recuperación
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Enviar email de recuperación
    try {
      await emailService.sendPasswordReset({
        nombre: user.nombre || user.username,
        email: user.email,
        resetUrl,
      });

      res.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña',
      });
    } catch (emailError) {
      console.error('Error enviando email de recuperación:', emailError);
      // Limpiar el token si falla el envío del email
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.status(500).json({
        success: false,
        message: 'Error al enviar el email de recuperación. Por favor, intenta más tarde.',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud de recuperación de contraseña',
      error: error.message,
    });
  }
};

// POST /api/auth/reset-password - Restablecer contraseña con token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    // Buscar usuario con el token válido y no expirado
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.',
      });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente. Puedes iniciar sesión con tu nueva contraseña.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al restablecer la contraseña',
      error: error.message,
    });
  }
};
