const Booking = require('../models/Booking');
const emailService = require('../services/emailService');
const invoiceService = require('../services/invoiceService');

// POST /api/bookings - Crear nueva solicitud de reserva
exports.createBooking = async (req, res) => {
  try {
    console.log('📥 Recibiendo solicitud de reserva:', JSON.stringify(req.body, null, 2));
    
    // Validar campos requeridos antes de crear el modelo
    if (!req.body.nombre || !req.body.nombre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido',
        error: 'El nombre es requerido',
      });
    }
    
    if (!req.body.email || !req.body.email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El email es requerido',
        error: 'El email es requerido',
      });
    }
    
    if (!req.body.serviceName || !req.body.serviceName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del servicio es requerido',
        error: 'El nombre del servicio es requerido',
      });
    }
    
    if (!req.body.serviceType || !req.body.serviceType.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de servicio es requerido',
        error: 'El tipo de servicio es requerido',
      });
    }
    
    // Validar que serviceType sea uno de los valores permitidos
    const validServiceTypes = ['airport', 'intercity', 'hourly', 'custom'];
    if (!validServiceTypes.includes(req.body.serviceType)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de servicio inválido. Debe ser uno de: ${validServiceTypes.join(', ')}`,
        error: `Tipo de servicio inválido: ${req.body.serviceType}`,
      });
    }
    
    console.log('✅ Validaciones pasadas, creando booking...');
    const booking = new Booking(req.body);
    console.log('📝 Booking creado:', JSON.stringify(booking.toObject(), null, 2));
    
    await booking.save();
    console.log('✅ Booking guardado exitosamente:', booking._id);
    
    // Enviar notificaciones por email (no bloquear la respuesta si falla)
    try {
      // Notificación al administrador
      await emailService.sendBookingNotification({
        nombre: booking.nombre,
        email: booking.email,
        telefono: booking.telefono,
        serviceName: booking.serviceName,
        serviceType: booking.serviceType,
        priceLabel: booking.priceLabel,
        fecha: booking.fecha,
        hora: booking.hora,
        pasajeros: booking.pasajeros,
        mensaje: booking.mensaje,
        details: booking.details,
      });
      
      // Confirmación al cliente
      await emailService.sendBookingConfirmation({
        nombre: booking.nombre,
        email: booking.email,
        serviceName: booking.serviceName,
        serviceType: booking.serviceType,
        priceLabel: booking.priceLabel,
        fecha: booking.fecha,
        hora: booking.hora,
        pasajeros: booking.pasajeros,
      });
    } catch (emailError) {
      console.error('Error enviando emails de reserva:', emailError);
      // No fallar la petición si el email falla
    }
    
    res.status(201).json({
      success: true,
      message: 'Solicitud de reserva enviada exitosamente',
      data: booking,
    });
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    console.error('❌ Tipo de error:', error.name);
    console.error('❌ Mensaje de error:', error.message);
    console.error('❌ Errores de validación:', error.errors);
    console.error('❌ Stack:', error.stack);
    console.error('❌ Request body recibido:', JSON.stringify(req.body, null, 2));
    
    // Si es un error de validación de Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        msg: err.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        error: 'Errores de validación',
        errors: validationErrors,
      });
    }
    
    // Si es un error de duplicado (unique constraint)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `El valor de ${field} ya existe`,
        error: `El valor de ${field} ya existe`,
      });
    }
    
    // Error genérico con más detalles
    res.status(400).json({
      success: false,
      message: 'Error al crear reserva',
      error: error.message || 'Error desconocido al crear la reserva',
      errorType: error.name,
      errors: error.errors ? Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
        msg: err.message,
      })) : undefined,
    });
  }
};

// PUT /api/bookings/:id/confirm - Confirmar reserva y enviar factura
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada',
      });
    }
    
    // Actualizar estado a confirmado
    booking.status = 'confirmed';
    if (req.body.total) {
      booking.total = req.body.total;
    }
    await booking.save();
    
    // Generar factura
    let invoiceBuffer = null;
    try {
      invoiceBuffer = await invoiceService.generateInvoice({
        invoiceNumber: booking.invoiceNumber,
        date: new Date().toLocaleDateString('es-ES'),
        customerName: booking.nombre,
        customerEmail: booking.email,
        customerPhone: booking.telefono,
        serviceName: booking.serviceName,
        total: booking.total || booking.calculatedPrice || 0,
        items: [{
          description: booking.serviceName,
          quantity: booking.pasajeros || 1,
          unitPrice: booking.total || booking.calculatedPrice || 0,
          total: booking.total || booking.calculatedPrice || 0,
        }],
        notes: booking.mensaje || '',
      });
    } catch (invoiceError) {
      console.error('Error generando factura:', invoiceError);
      // Continuar sin factura si hay error
    }
    
    // Enviar confirmación con factura al cliente
    try {
      await emailService.sendReservationConfirmed({
        nombre: booking.nombre,
        email: booking.email,
        reservationNumber: booking.reservationNumber,
        serviceName: booking.serviceName,
        fecha: booking.fecha,
        hora: booking.hora,
        total: booking.total || booking.calculatedPrice || 0,
      }, invoiceBuffer);
    } catch (emailError) {
      console.error('Error enviando confirmación de reserva:', emailError);
      // No fallar la petición si el email falla
    }
    
    res.json({
      success: true,
      message: 'Reserva confirmada exitosamente',
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al confirmar reserva',
      error: error.message,
    });
  }
};

// GET /api/bookings - Listar todas las reservas (requiere autenticación)
exports.getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas',
      error: error.message,
    });
  }
};

// GET /api/bookings/:id - Obtener reserva por ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada',
      });
    }
    
    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener reserva',
      error: error.message,
    });
  }
};

// PUT /api/bookings/:id - Actualizar reserva
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada',
      });
    }
    
    res.json({
      success: true,
      message: 'Reserva actualizada exitosamente',
      data: booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar reserva',
      error: error.message,
    });
  }
};

// DELETE /api/bookings/:id - Eliminar reserva
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada',
      });
    }
    
    res.json({
      success: true,
      message: 'Reserva eliminada exitosamente',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar reserva',
      error: error.message,
    });
  }
};
