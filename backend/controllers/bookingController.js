const Booking = require('../models/Booking');
const User = require('../models/User');
const PointsHistory = require('../models/PointsHistory');
const Notification = require('../models/Notification');
const emailService = require('../services/emailService');
const invoiceService = require('../services/invoiceService');

// Función helper para actualizar nivel de membresía
const updateMembershipLevel = (user) => {
  // Sistema: 10 MAD = 1 punto
  // Diamante: 1,000,000+ puntos (10,000,000+ MAD)
  // Platinum: 100,000+ puntos (1,000,000+ MAD)
  // Gold: 10,000+ puntos (100,000+ MAD)
  // Silver: 3,500+ puntos (35,000+ MAD)
  // Bronze: menos de 3,500 puntos (menos de 35,000 MAD)
  if (user.points >= 1000000) {
    user.membershipLevel = 'diamante';
  } else if (user.points >= 100000) {
    user.membershipLevel = 'platinum';
  } else if (user.points >= 10000) {
    user.membershipLevel = 'gold';
  } else if (user.points >= 3500) {
    user.membershipLevel = 'silver';
  } else {
    user.membershipLevel = 'bronze';
  }
};

// Función helper para otorgar puntos al confirmar una reserva
const awardPointsForBooking = async (booking) => {
  try {
    // Solo otorgar puntos si la reserva está completada y tiene un userId asociado
    if (!booking.userId || booking.status !== 'completed') {
      return;
    }

    const user = await User.findById(booking.userId);
    if (!user) {
      return;
    }

    // Verificar si ya se otorgaron puntos para esta reserva
    const existingPoints = await PointsHistory.findOne({
      userId: user._id,
      bookingId: booking._id,
      reason: 'booking_completed',
    });

    if (existingPoints) {
      console.log(`⚠️  Los puntos ya fueron otorgados para la reserva ${booking._id}`);
      return;
    }

    // Calcular puntos: 1 punto por cada 10 dirhams (MAD) gastados
    // El precio almacenado está en dirhams marroquíes
    const bookingPrice = booking.total || booking.calculatedPrice || 0;
    // 10 MAD = 1 punto, redondeado hacia abajo
    const pointsToAward = Math.floor(bookingPrice / 10);

    if (pointsToAward > 0) {
      const pointsBefore = user.points || 0;
      user.points = pointsBefore + pointsToAward;
      user.totalSpent = (user.totalSpent || 0) + bookingPrice;
      user.totalBookings = (user.totalBookings || 0) + 1;

      // Actualizar nivel de membresía basado en puntos
      updateMembershipLevel(user);

      await user.save();
      const pointsAfter = user.points || 0;

      // Registrar en historial de puntos
      try {
        await PointsHistory.create({
          userId: user._id,
          bookingId: booking._id,
          points: pointsToAward,
          pointsBefore,
          pointsAfter,
          reason: 'booking_completed',
          description: `Puntos ganados por reserva completada: ${booking.serviceName}`,
          bookingPrice: bookingPrice,
        });
      } catch (historyError) {
        console.error('Error guardando historial de puntos:', historyError);
      }

      // Crear notificación
      try {
        await Notification.create({
          userId: user._id,
          type: 'points_earned',
          title: '¡Puntos ganados!',
          message: `Has ganado ${pointsToAward} puntos por tu reserva completada de ${booking.serviceName}`,
          link: `/mis-reservas`,
          metadata: { bookingId: booking._id, points: pointsToAward },
        });
      } catch (notifError) {
        console.error('Error creando notificación:', notifError);
      }

      console.log(`✅ Puntos otorgados: ${pointsToAward} puntos (${bookingPrice} MAD) al usuario ${user._id} por reserva completada ${booking._id}`);
    }
  } catch (error) {
    console.error('Error otorgando puntos:', error);
    // No fallar la confirmación si hay error con puntos
  }
};

// Función helper para restar puntos al cancelar una reserva
const deductPointsForCancellation = async (booking) => {
  try {
    // Solo restar puntos si la reserva estaba completada y tiene un userId asociado
    // Si la reserva no estaba completada, no se habían otorgado puntos, así que no hay nada que restar
    if (!booking.userId) {
      return;
    }

    // Verificar si se otorgaron puntos para esta reserva (solo si estaba completada)
    const pointsHistory = await PointsHistory.findOne({
      userId: booking.userId,
      bookingId: booking._id,
      reason: 'booking_completed',
    });

    // Si no hay puntos otorgados, no hay nada que restar
    if (!pointsHistory) {
      console.log(`ℹ️  No se restan puntos: la reserva ${booking._id} no tenía puntos otorgados (no estaba completada)`);
      return;
    }

    const user = await User.findById(booking.userId);
    if (!user) {
      return;
    }

    const pointsToDeduct = pointsHistory.points;
    const bookingPrice = booking.total || booking.calculatedPrice || 0;

    if (pointsToDeduct > 0) {
      const pointsBefore = user.points || 0;
      
      // Restar puntos (asegurarse de que no queden negativos)
      user.points = Math.max(0, pointsBefore - pointsToDeduct);
      
      // Actualizar totalSpent y totalBookings
      user.totalSpent = Math.max(0, (user.totalSpent || 0) - bookingPrice);
      user.totalBookings = Math.max(0, (user.totalBookings || 0) - 1);

      // Actualizar nivel de membresía basado en puntos
      updateMembershipLevel(user);

      await user.save();
      const pointsAfter = user.points || 0;

      // Registrar en historial de puntos
      try {
        await PointsHistory.create({
          userId: user._id,
          bookingId: booking._id,
          points: -pointsToDeduct, // Negativo para indicar deducción
          pointsBefore,
          pointsAfter,
          reason: 'booking_cancelled',
          description: `Puntos retirados por cancelación de reserva: ${booking.serviceName}`,
          bookingPrice: bookingPrice,
        });
      } catch (historyError) {
        console.error('Error guardando historial de puntos:', historyError);
      }

      // Crear notificación
      try {
        await Notification.create({
          userId: user._id,
          type: 'booking_cancelled',
          title: 'Puntos retirados',
          message: `Se han retirado ${pointsToDeduct} puntos por la cancelación de tu reserva de ${booking.serviceName}`,
          link: `/mis-reservas`,
          metadata: { bookingId: booking._id, points: pointsToDeduct },
        });
      } catch (notifError) {
        console.error('Error creando notificación:', notifError);
      }

      console.log(`✅ Puntos retirados: ${pointsToDeduct} puntos (${bookingPrice} MAD) del usuario ${user._id} por cancelación de reserva ${booking._id}`);
    }
  } catch (error) {
    console.error('Error restando puntos:', error);
    // No fallar la cancelación si hay error con puntos
  }
};

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
    const validServiceTypes = ['airport', 'intercity', 'hourly', 'custom', 'vehicle'];
    if (!validServiceTypes.includes(req.body.serviceType)) {
      return res.status(400).json({
        success: false,
        message: `Tipo de servicio inválido. Debe ser uno de: ${validServiceTypes.join(', ')}`,
        error: `Tipo de servicio inválido: ${req.body.serviceType}`,
      });
    }
    
    console.log('✅ Validaciones pasadas, creando booking...');
    
    // Si el usuario está autenticado, asociar la reserva al usuario
    const bookingData = { ...req.body };
    if (req.user && req.user.userId) {
      bookingData.userId = req.user.userId;
      console.log('👤 Reserva asociada al usuario:', req.user.userId);
    }
    
    const booking = new Booking(bookingData);
    console.log('📝 Booking creado:', JSON.stringify(booking.toObject(), null, 2));
    
    await booking.save();
    console.log('✅ Booking guardado exitosamente:', booking._id);
    
    // Crear notificaciones para los administradores (no bloquear la respuesta si falla)
    try {
      const adminUsers = await User.find({ role: 'admin', active: true });
      
      if (adminUsers.length > 0) {
        const notificationPromises = adminUsers.map(admin => 
          Notification.create({
            userId: admin._id,
            type: 'new_booking',
            title: 'Nueva Reserva Creada',
            message: `Nueva reserva de ${booking.nombre} para ${booking.serviceName} (${booking.serviceType})`,
            link: `/admin/bookings/${booking._id}`,
            metadata: { 
              bookingId: booking._id.toString(),
              serviceName: booking.serviceName,
              serviceType: booking.serviceType,
              customerName: booking.nombre,
              customerEmail: booking.email,
            },
          })
        );
        
        await Promise.all(notificationPromises);
        console.log(`✅ Notificaciones creadas para ${adminUsers.length} administrador(es)`);
      }
    } catch (notifError) {
      console.error('Error creando notificaciones para admin:', notifError);
      // No fallar la petición si las notificaciones fallan
    }
    
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
    
    // Guardar estado anterior para verificar si era la primera confirmación
    const previousStatus = booking.status;
    
    // Actualizar estado a confirmado
    booking.status = 'confirmed';
    if (req.body.total) {
      booking.total = req.body.total;
    }
    await booking.save();
    
    // Otorgar puntos solo cuando la reserva esté completada
    if (booking.status === 'completed' && booking.userId) {
      await awardPointsForBooking(booking);
    }
    
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
      console.log('✅ Email de confirmación enviado a:', booking.email);
    } catch (emailError) {
      console.error('Error enviando confirmación de reserva:', emailError);
      // No fallar la petición si el email falla
    }
    
    // Crear notificación en la base de datos para el cliente
    try {
      let clientUserId = booking.userId;
      
      // Si no tiene userId, buscar por email
      if (!clientUserId && booking.email) {
        const userByEmail = await User.findOne({ email: booking.email.toLowerCase().trim() });
        if (userByEmail) {
          clientUserId = userByEmail._id;
          // Actualizar la reserva con el userId encontrado
          booking.userId = clientUserId;
          await booking.save();
        }
      }
      
      if (clientUserId) {
        await Notification.create({
          userId: clientUserId,
          type: 'booking_confirmed',
          title: 'Reserva Confirmada',
          message: `Tu reserva de ${booking.serviceName} ha sido confirmada. Número de reserva: ${booking.reservationNumber || 'N/A'}`,
          link: `/mis-reservas`,
          metadata: {
            bookingId: booking._id.toString(),
            serviceName: booking.serviceName,
            reservationNumber: booking.reservationNumber,
            total: booking.total || booking.calculatedPrice || 0,
          },
        });
        console.log('✅ Notificación de confirmación creada para el cliente');
      }
    } catch (notifError) {
      console.error('Error creando notificación de confirmación:', notifError);
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

// GET /api/bookings/my - Obtener reservas del usuario autenticado
exports.getMyBookings = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const userId = req.user.userId;
    const { 
      status, 
      serviceType,
      dateFrom,
      dateTo,
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Construir query
    const query = { userId: userId };
    
    // Filtro por estado
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filtro por tipo de servicio
    if (serviceType && serviceType !== 'all') {
      query.serviceType = serviceType;
    }
    
    // Filtro por rango de fechas (fecha de creación de la reserva)
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        const startDate = new Date(dateFrom);
        startDate.setHours(0, 0, 0, 0);
        query.createdAt.$gte = startDate;
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    // Opciones de ordenamiento
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Obtener reservas
    const bookings = await Booking.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Contar total
    const total = await Booking.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: bookings,
      total,
      page: parseInt(page),
      totalPages,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Error obteniendo reservas del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reservas',
      error: error.message,
    });
  }
};

// GET /api/bookings - Listar todas las reservas (requiere autenticación)
exports.getAllBookings = async (req, res) => {
  try {
    const { 
      status, 
      serviceType, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      dateFrom,
      dateTo,
      minPrice,
      maxPrice
    } = req.query;
    
    const filter = {};
    
    // Filtro por estado
    if (status && status !== 'all') filter.status = status;
    
    // Filtro por tipo de servicio
    if (serviceType && serviceType !== 'all') filter.serviceType = serviceType;
    
    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }
    
    // Filtro por rango de precios
    if (minPrice || maxPrice) {
      filter.$or = [
        { calculatedPrice: {} },
        { total: {} }
      ];
      if (minPrice) {
        filter.$or[0].calculatedPrice.$gte = parseFloat(minPrice);
        filter.$or[1].total.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.$or[0].calculatedPrice.$lte = parseFloat(maxPrice);
        filter.$or[1].total.$lte = parseFloat(maxPrice);
      }
    }
    
    // Búsqueda por texto (nombre, email, teléfono, número de reserva)
    if (search) {
      // Si ya hay un $or por precio, necesitamos combinarlo con $and
      if (filter.$or && filter.$or.length > 0 && filter.$or[0].calculatedPrice) {
        // Ya hay filtro de precio, agregar búsqueda con $and
        filter.$and = [
          { $or: filter.$or }, // Mantener filtro de precio
          {
            $or: [
              { nombre: { $regex: search, $options: 'i' } },
              { email: { $regex: search, $options: 'i' } },
              { telefono: { $regex: search, $options: 'i' } },
              { reservationNumber: { $regex: search, $options: 'i' } },
              { serviceName: { $regex: search, $options: 'i' } }
            ]
          }
        ];
        delete filter.$or; // Eliminar $or original ya que está en $and
      } else {
        // No hay filtro de precio, usar $or normal
        filter.$or = filter.$or || [];
        filter.$or.push(
          { nombre: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { telefono: { $regex: search, $options: 'i' } },
          { reservationNumber: { $regex: search, $options: 'i' } },
          { serviceName: { $regex: search, $options: 'i' } }
        );
      }
    }
    
    // Ordenamiento
    const sortOptions = {};
    const validSortFields = ['createdAt', 'fecha', 'status', 'calculatedPrice', 'total', 'nombre'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;
    
    // Paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Obtener total de documentos (antes de paginación)
    const total = await Booking.countDocuments(filter);
    
    console.log('📊 Filtros aplicados:', JSON.stringify(filter, null, 2));
    console.log('📊 Total de reservas encontradas:', total);
    console.log('📊 Parámetros de paginación:', { page: pageNum, limit: limitNum, skip });
    
    // Obtener reservas con paginación
    const bookings = await Booking.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);
    
    console.log('📊 Reservas obtenidas:', bookings.length);
    
    res.json({
      success: true,
      count: bookings.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
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

// GET /api/bookings/:id - Obtener reserva por ID (requiere auth)
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

// GET /api/bookings/:id/for-payment - Obtener reserva para página de pago (público, sin auth)
exports.getBookingByIdForPayment = async (req, res) => {
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
    // Obtener reserva anterior para comparar estado
    const oldBooking = await Booking.findById(req.params.id);
    
    if (!oldBooking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada',
      });
    }
    
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
    
    // Detectar si se está proponiendo un precio nuevo (primera vez o cambio)
    const isNewPriceProposal = (
      req.body.proposedPrice !== undefined && 
      (
        !oldBooking.proposedPrice || 
        oldBooking.proposedPrice !== req.body.proposedPrice
      )
    );
    
    // Si se está proponiendo un precio nuevo, enviar notificación especial
    if (isNewPriceProposal && booking.proposedPrice) {
      try {
        // Enviar email
        await emailService.sendPriceProposal({
          nombre: booking.nombre,
          email: booking.email,
          reservationNumber: booking.reservationNumber,
          serviceName: booking.serviceName,
          fecha: booking.fecha,
          hora: booking.hora,
          pasajeros: booking.pasajeros,
          proposedPrice: booking.proposedPrice,
          priceMessage: req.body.priceMessage || null,
        });
        console.log('✅ Email de precio propuesto enviado a:', booking.email);
        
        // Crear notificación en la base de datos para el cliente
        try {
          let clientUserId = booking.userId;
          
          // Si no tiene userId, buscar por email
          if (!clientUserId && booking.email) {
            const userByEmail = await User.findOne({ email: booking.email.toLowerCase().trim() });
            if (userByEmail) {
              clientUserId = userByEmail._id;
              // Actualizar la reserva con el userId encontrado
              booking.userId = clientUserId;
              await booking.save();
            }
          }
          
          if (clientUserId) {
            await Notification.create({
              userId: clientUserId,
              type: 'price_proposed',
              title: 'Precio Propuesto',
              message: `La administración ha propuesto un precio de ${booking.proposedPrice.toLocaleString()} MAD para tu reserva de ${booking.serviceName}. Por favor, revisa y acepta o rechaza.`,
              link: `/mis-reservas`,
              metadata: {
                bookingId: booking._id.toString(),
                proposedPrice: booking.proposedPrice,
                serviceName: booking.serviceName,
                reservationNumber: booking.reservationNumber,
              },
            });
            console.log('✅ Notificación de precio propuesto creada para el cliente');
          } else {
            console.log('ℹ️ No se pudo crear notificación: cliente no tiene cuenta registrada');
          }
        } catch (notifError) {
          console.error('Error creando notificación de precio propuesto:', notifError);
        }
      } catch (emailError) {
        console.error('Error enviando email de precio propuesto:', emailError);
        // No fallar la petición si el email falla
      }
    }
    
    // Detectar cambios importantes para enviar notificaciones (excluyendo proposedPrice si ya se envió notificación)
    const changes = {};
    const importantFields = ['fecha', 'hora', 'pasajeros', 'total', 'status'];
    
    // Solo incluir proposedPrice en cambios si NO es una nueva propuesta (ya se envió email especial)
    if (!isNewPriceProposal && req.body.proposedPrice !== undefined) {
      importantFields.push('proposedPrice');
    }
    
    importantFields.forEach(field => {
      const oldValue = oldBooking[field];
      const newValue = booking[field];
      
      // Comparar fechas correctamente
      if (field === 'fecha') {
        const oldDate = oldValue ? new Date(oldValue).toISOString().split('T')[0] : null;
        const newDate = newValue ? new Date(newValue).toISOString().split('T')[0] : null;
        if (oldDate !== newDate) {
          changes[field] = { old: oldDate || 'N/A', new: newDate || 'N/A' };
        }
      } else if (oldValue !== newValue && (oldValue || newValue)) {
        changes[field] = { old: oldValue || 'N/A', new: newValue || 'N/A' };
      }
    });
    
    // Manejar aceptación/rechazo de precio propuesto
    if (req.body.priceStatus && oldBooking.priceStatus !== req.body.priceStatus) {
      // Si el cliente acepta el precio propuesto, actualizar el precio total
      if (req.body.priceStatus === 'accepted' && booking.proposedPrice) {
        booking.total = booking.proposedPrice;
        booking.calculatedPrice = booking.proposedPrice;
        console.log(`✅ Precio aceptado: ${booking.proposedPrice} MAD para reserva ${booking._id}`);
        
        // Enviar notificación al administrador de que el precio fue aceptado
        try {
          const adminUsers = await User.find({ role: 'admin', active: true });
          if (adminUsers.length > 0) {
            const notificationPromises = adminUsers.map(admin => 
              Notification.create({
                userId: admin._id,
                type: 'price_accepted',
                title: 'Precio Aceptado',
                message: `El cliente ${booking.nombre} ha aceptado el precio de ${booking.proposedPrice} MAD para la reserva ${booking.reservationNumber || booking._id}`,
                link: `/admin/bookings/${booking._id}`,
                metadata: { 
                  bookingId: booking._id.toString(),
                  proposedPrice: booking.proposedPrice,
                  customerName: booking.nombre,
                },
              })
            );
            await Promise.all(notificationPromises);
            console.log(`✅ Notificaciones creadas para ${adminUsers.length} administrador(es) - Precio aceptado`);
          }
        } catch (notifError) {
          console.error('Error creando notificaciones para admin:', notifError);
        }
      } else if (req.body.priceStatus === 'rejected') {
        console.log(`⚠️ Precio rechazado para reserva ${booking._id}`);
        
        // Enviar notificación al administrador de que el precio fue rechazado
        try {
          const adminUsers = await User.find({ role: 'admin', active: true });
          if (adminUsers.length > 0) {
            const notificationPromises = adminUsers.map(admin => 
              Notification.create({
                userId: admin._id,
                type: 'price_rejected',
                title: 'Precio Rechazado',
                message: `El cliente ${booking.nombre} ha rechazado el precio de ${booking.proposedPrice} MAD para la reserva ${booking.reservationNumber || booking._id}`,
                link: `/admin/bookings/${booking._id}`,
                metadata: { 
                  bookingId: booking._id.toString(),
                  proposedPrice: booking.proposedPrice,
                  customerName: booking.nombre,
                },
              })
            );
            await Promise.all(notificationPromises);
            console.log(`✅ Notificaciones creadas para ${adminUsers.length} administrador(es) - Precio rechazado`);
          }
        } catch (notifError) {
          console.error('Error creando notificaciones para admin:', notifError);
        }
      }
      
      // Guardar cambios en el precio si se aceptó
      if (req.body.priceStatus === 'accepted' && booking.proposedPrice) {
        await booking.save();
      }
    }
    
    // Manejar cambios de estado y puntos
    if (oldBooking.status !== booking.status) {
      // Otorgar puntos solo cuando la reserva esté completada
      if (booking.status === 'completed' && booking.userId) {
        await awardPointsForBooking(booking);
      }
      
      // Si se cancela una reserva que estaba completada, restar puntos
      if (oldBooking.status === 'completed' && booking.status === 'cancelled' && booking.userId) {
        await deductPointsForCancellation(booking);
      }
      
      // Enviar email de cancelación si se cancela una reserva
      if (booking.status === 'cancelled') {
        try {
          await emailService.sendBookingCancellation({
            nombre: booking.nombre,
            email: booking.email,
            reservationNumber: booking.reservationNumber,
            serviceName: booking.serviceName,
            fecha: booking.fecha,
            hora: booking.hora,
            total: booking.total || booking.calculatedPrice || 0,
            reason: req.body.cancellationReason || 'Cancelación solicitada',
          });
          console.log('✅ Email de cancelación enviado a:', booking.email);
          
          // Crear notificación en la base de datos para el cliente
          try {
            let clientUserId = booking.userId;
            
            // Si no tiene userId, buscar por email
            if (!clientUserId && booking.email) {
              const userByEmail = await User.findOne({ email: booking.email.toLowerCase().trim() });
              if (userByEmail) {
                clientUserId = userByEmail._id;
                // Actualizar la reserva con el userId encontrado
                booking.userId = clientUserId;
                await booking.save();
              }
            }
            
            if (clientUserId) {
              await Notification.create({
                userId: clientUserId,
                type: 'booking_cancelled',
                title: 'Reserva Cancelada',
                message: `Tu reserva de ${booking.serviceName} ha sido cancelada. ${req.body.cancellationReason ? `Motivo: ${req.body.cancellationReason}` : ''}`,
                link: `/mis-reservas`,
                metadata: {
                  bookingId: booking._id.toString(),
                  serviceName: booking.serviceName,
                  reservationNumber: booking.reservationNumber,
                  reason: req.body.cancellationReason || 'Cancelación solicitada',
                },
              });
              console.log('✅ Notificación de cancelación creada para el cliente');
            }
          } catch (notifError) {
            console.error('Error creando notificación de cancelación:', notifError);
          }
        } catch (emailError) {
          console.error('Error enviando email de cancelación:', emailError);
          // No fallar la petición si el email falla
        }
      }
    }
    
    // Enviar notificación de actualización si hay cambios importantes (excepto cancelación que ya se maneja arriba)
    if (Object.keys(changes).length > 0 && booking.status !== 'cancelled') {
      // Excluir cambios de estado si es cancelación (ya se maneja arriba)
      const updateChanges = { ...changes };
      if (updateChanges.status && booking.status === 'cancelled') {
        delete updateChanges.status;
      }
      
      // Solo enviar si hay cambios además del estado o si el estado cambió pero no es cancelación
      if (Object.keys(updateChanges).length > 0) {
        try {
          // Enviar email
          await emailService.sendBookingUpdate({
            nombre: booking.nombre,
            email: booking.email,
            reservationNumber: booking.reservationNumber,
            serviceName: booking.serviceName,
            fecha: booking.fecha,
            hora: booking.hora,
            pasajeros: booking.pasajeros,
            total: booking.total || booking.calculatedPrice || 0,
            status: booking.status,
          }, updateChanges);
          console.log('✅ Email de actualización enviado a:', booking.email);
          
          // Crear notificación en la base de datos para el cliente
          try {
            let clientUserId = booking.userId;
            
            // Si no tiene userId, buscar por email
            if (!clientUserId && booking.email) {
              const userByEmail = await User.findOne({ email: booking.email.toLowerCase().trim() });
              if (userByEmail) {
                clientUserId = userByEmail._id;
                // Actualizar la reserva con el userId encontrado
                booking.userId = clientUserId;
                await booking.save();
              }
            }
            
            if (clientUserId) {
              const changesList = Object.keys(updateChanges).map(key => {
                const labels = {
                  fecha: 'Fecha',
                  hora: 'Hora',
                  pasajeros: 'Pasajeros',
                  total: 'Precio Total',
                  status: 'Estado',
                };
                return `${labels[key] || key}: ${updateChanges[key].old} → ${updateChanges[key].new}`;
              }).join(', ');
              
              await Notification.create({
                userId: clientUserId,
                type: 'booking_updated',
                title: 'Reserva Actualizada',
                message: `Tu reserva de ${booking.serviceName} ha sido actualizada. Cambios: ${changesList}`,
                link: `/mis-reservas`,
                metadata: {
                  bookingId: booking._id.toString(),
                  changes: updateChanges,
                  serviceName: booking.serviceName,
                  reservationNumber: booking.reservationNumber,
                },
              });
              console.log('✅ Notificación de actualización creada para el cliente');
            } else {
              console.log('ℹ️ No se pudo crear notificación: cliente no tiene cuenta registrada');
            }
          } catch (notifError) {
            console.error('Error creando notificación de actualización:', notifError);
          }
        } catch (emailError) {
          console.error('Error enviando email de actualización:', emailError);
          // No fallar la petición si el email falla
        }
      }
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

// PUT /api/bookings/bulk - Actualizar múltiples reservas
exports.bulkUpdateBookings = async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de IDs',
      });
    }
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un estado',
      });
    }
    
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`,
      });
    }
    
    // Obtener las reservas antes de actualizarlas para verificar cambios de estado
    const bookingsBefore = await Booking.find({ _id: { $in: ids } });
    
    // Actualizar todas las reservas
    const result = await Booking.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );
    
    // Obtener las reservas actualizadas para procesar puntos
    const bookingsAfter = await Booking.find({ _id: { $in: ids } });
    
    // Procesar puntos según el cambio de estado
    for (const bookingAfter of bookingsAfter) {
      const bookingBefore = bookingsBefore.find(b => b._id.toString() === bookingAfter._id.toString());
      
      if (bookingBefore && bookingBefore.status !== bookingAfter.status) {
        // Otorgar puntos solo cuando la reserva esté completada
        if (bookingAfter.status === 'completed' && bookingAfter.userId) {
          await awardPointsForBooking(bookingAfter);
        }
        
        // Si se cancela una reserva que estaba completada, restar puntos
        if (bookingBefore.status === 'completed' && bookingAfter.status === 'cancelled' && bookingAfter.userId) {
          await deductPointsForCancellation(bookingAfter);
        }
        
        // Enviar email de cancelación si se cancela una reserva
        if (bookingAfter.status === 'cancelled') {
          try {
            await emailService.sendBookingCancellation({
              nombre: bookingAfter.nombre,
              email: bookingAfter.email,
              reservationNumber: bookingAfter.reservationNumber,
              serviceName: bookingAfter.serviceName,
              fecha: bookingAfter.fecha,
              hora: bookingAfter.hora,
              total: bookingAfter.total || bookingAfter.calculatedPrice || 0,
              reason: req.body.cancellationReason || 'Cancelación solicitada',
            });
            console.log('✅ Email de cancelación enviado a:', bookingAfter.email);
          } catch (emailError) {
            console.error('Error enviando email de cancelación:', emailError);
            // No fallar la petición si el email falla
          }
        }
      }
    }
    
    res.json({
      success: true,
      message: `${result.modifiedCount} reserva(s) actualizada(s) exitosamente`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar reservas',
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
