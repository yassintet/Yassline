const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Notification = require('../models/Notification');
const binanceService = require('../services/binanceService');
const redotpayService = require('../services/redotpayService');
const emailService = require('../services/emailService');

/**
 * POST /api/payments - Crear nuevo pago
 */
exports.createPayment = async (req, res) => {
  console.log('🎯 createPayment llamado:', {
    method: req.method,
    path: req.path,
    url: req.url,
    body: req.body,
  });
  try {
    const { bookingId, paymentMethod, amount, currency, paymentDetails } = req.body;

    // Validar campos requeridos
    if (!bookingId || !paymentMethod || !amount) {
      return res.status(400).json({
        success: false,
        message: 'bookingId, paymentMethod y amount son requeridos',
        error: 'Campos requeridos faltantes',
      });
    }

    // Validar método de pago
    const validMethods = ['cash', 'bank_transfer', 'binance', 'redotpay', 'moneygram'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `Método de pago inválido. Debe ser uno de: ${validMethods.join(', ')}`,
        error: 'Método de pago inválido',
      });
    }

    // Obtener la reserva
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Reserva no encontrada',
      });
    }

    // Verificar que no haya un pago ya completado
    const existingPayment = await Payment.findOne({
      bookingId,
      status: 'completed',
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Esta reserva ya tiene un pago completado',
        error: 'Pago duplicado',
      });
    }

    // Crear el pago
    const paymentData = {
      bookingId,
      userId: booking.userId || null,
      customerName: booking.nombre,
      customerEmail: booking.email,
      paymentMethod,
      amount: parseFloat(amount),
      currency: currency || 'MAD',
      paymentDetails: paymentDetails || {},
      status: 'pending', // Todos los pagos empiezan como pending
    };

    // Agregar detalles específicos según el método
    if (paymentMethod === 'bank_transfer' && paymentDetails) {
      paymentData.bankTransfer = {
        reference: paymentDetails.reference || '',
        bankName: paymentDetails.bankName || '',
        accountNumber: paymentDetails.accountNumber || '',
        transferDate: paymentDetails.transferDate ? new Date(paymentDetails.transferDate) : null,
        proofImage: paymentDetails.proofImage || '',
      };
    }

    const payment = new Payment(paymentData);
    await payment.save();

    // Para Binance, Redotpay y MoneyGram, solo guardar información estática (número de cuenta/ID)
    if (paymentMethod === 'binance') {
      const binanceInfo = binanceService.getPaymentInfo();
      payment.binance = {
        accountId: binanceInfo.accountId,
        walletAddress: binanceInfo.walletAddress,
        network: binanceInfo.network || 'BSC',
        currency: binanceInfo.currency || 'USDT',
      };
      await payment.save();
    } else if (paymentMethod === 'redotpay') {
      const redotpayInfo = redotpayService.getPaymentInfo();
      payment.redotpay = {
        accountId: redotpayInfo.accountId,
        merchantId: redotpayInfo.merchantId,
      };
      await payment.save();
    } else if (paymentMethod === 'moneygram') {
      // MoneyGram: información estática para mostrar al cliente
      payment.moneygram = {
        referenceNumber: process.env.MONEYGRAM_REFERENCE_NUMBER || 'MONEYGRAM_REF',
        receiverName: process.env.MONEYGRAM_RECEIVER_NAME || 'Yassin El Makhloufi',
        country: process.env.MONEYGRAM_COUNTRY || 'Marruecos',
      };
      await payment.save();
    }

    // Actualizar la reserva con el paymentId
    booking.paymentId = payment._id;
    await booking.save();

    // Preparar respuesta según el método
    const responseData = {
      payment,
    };

    // Agregar información específica según el método
    if (paymentMethod === 'binance') {
      responseData.binanceInfo = binanceService.getPaymentInfo();
    } else if (paymentMethod === 'redotpay') {
      responseData.redotpayInfo = redotpayService.getPaymentInfo();
    } else if (paymentMethod === 'moneygram') {
      responseData.moneygramInfo = {
        referenceNumber: process.env.MONEYGRAM_REFERENCE_NUMBER || 'MONEYGRAM_REF',
        receiverName: process.env.MONEYGRAM_RECEIVER_NAME || 'Yassin El Makhloufi',
        country: process.env.MONEYGRAM_COUNTRY || 'Marruecos',
        city: process.env.MONEYGRAM_CITY || 'Marrakech',
      };
    } else if (paymentMethod === 'bank_transfer') {
      responseData.bankInfo = bankInfo;
      // Generar referencia sugerida
      responseData.bankInfo.suggestedReference = bankInfo.referenceFormat.replace('{bookingId}', bookingId);
    }

    res.status(201).json({
      success: true,
      message: 'Pago creado exitosamente',
      data: responseData,
    });
  } catch (error) {
    console.error('Error creando pago:', error);
    res.status(400).json({
      success: false,
      message: 'Error al crear pago',
      error: error.message,
    });
  }
};

/**
 * GET /api/payments/:id - Obtener pago por ID
 */
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('bookingId', 'serviceName serviceType fecha hora');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado',
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener pago',
      error: error.message,
    });
  }
};

/**
 * GET /api/payments/booking/:bookingId - Obtener pagos de una reserva
 */
exports.getPaymentsByBooking = async (req, res) => {
  try {
    const payments = await Payment.find({ bookingId: req.params.bookingId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments,
      count: payments.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos',
      error: error.message,
    });
  }
};

/**
 * PUT /api/payments/:id/confirm - Confirmar pago (para efectivo y transferencia)
 */
exports.confirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado',
      });
    }

    // Solo se pueden confirmar pagos pendientes
    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `No se puede confirmar un pago con estado: ${payment.status}`,
      });
    }

    // Actualizar detalles según el método
    if (payment.paymentMethod === 'cash' && req.body.cash) {
      payment.cash = {
        receivedBy: req.body.cash.receivedBy || 'Administrador',
        receivedAt: new Date(),
        notes: req.body.cash.notes || '',
      };
    }

    if (payment.paymentMethod === 'bank_transfer' && req.body.bankTransfer) {
      payment.bankTransfer = {
        ...payment.bankTransfer,
        ...req.body.bankTransfer,
        transferDate: req.body.bankTransfer.transferDate ? new Date(req.body.bankTransfer.transferDate) : new Date(),
      };
    }

    // Marcar como completado
    await payment.markAsCompleted();

    // Actualizar estado de la reserva si es necesario
    const booking = await Booking.findById(payment.bookingId);
    if (booking && booking.status === 'pending') {
      booking.status = 'confirmed';
      await booking.save();
    }

    // Crear notificación para el cliente
    if (payment.userId) {
      try {
        await Notification.create({
          userId: payment.userId,
          type: 'payment_completed',
          title: 'Pago Confirmado',
          message: `Tu pago de ${payment.amount.toLocaleString()} ${payment.currency} ha sido confirmado para la reserva de ${booking?.serviceName || 'servicio'}.`,
          link: `/mis-reservas`,
          metadata: {
            paymentId: payment._id.toString(),
            bookingId: payment.bookingId.toString(),
            amount: payment.amount,
          },
        });
      } catch (notifError) {
        console.error('Error creando notificación de pago:', notifError);
      }
    }

    res.json({
      success: true,
      message: 'Pago confirmado exitosamente',
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al confirmar pago',
      error: error.message,
    });
  }
};

/**
 * POST /api/payments/binance/verify - Verificar pago de Binance
 */
exports.verifyBinancePayment = async (req, res) => {
  try {
    const { paymentId, transactionHash, network } = req.body;

    if (!paymentId || !transactionHash) {
      return res.status(400).json({
        success: false,
        message: 'paymentId y transactionHash son requeridos',
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado',
      });
    }

    if (payment.paymentMethod !== 'binance') {
      return res.status(400).json({
        success: false,
        message: 'Este pago no es de Binance',
      });
    }

    // Verificar la transacción
    const verification = await binanceService.verifyPayment(transactionHash, network || 'BSC');

    if (verification.success && verification.verified) {
      // Actualizar pago
      payment.binance.transactionHash = transactionHash;
      payment.binance.network = network || 'BSC';
      await payment.markAsCompleted();

      // Actualizar reserva
      const booking = await Booking.findById(payment.bookingId);
      if (booking && booking.status === 'pending') {
        booking.status = 'confirmed';
        await booking.save();
      }

      // Crear notificación
      if (payment.userId) {
        try {
          await Notification.create({
            userId: payment.userId,
            type: 'payment_completed',
            title: 'Pago Confirmado',
            message: `Tu pago de ${payment.amount.toLocaleString()} ${payment.currency} ha sido confirmado.`,
            link: `/mis-reservas`,
            metadata: {
              paymentId: payment._id.toString(),
              transactionHash,
            },
          });
        } catch (notifError) {
          console.error('Error creando notificación:', notifError);
        }
      }

      res.json({
        success: true,
        message: 'Pago verificado y confirmado',
        data: payment,
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'No se pudo verificar el pago',
        error: verification.error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar pago',
      error: error.message,
    });
  }
};

/**
 * POST /api/payments/redotpay/callback - Webhook de Redotpay
 */
exports.redotpayWebhook = async (req, res) => {
  try {
    const webhookData = req.body;

    // Procesar webhook
    const result = await redotpayService.processWebhook(webhookData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Error procesando webhook',
        error: result.error,
      });
    }

    // Buscar el pago por orderId
    const payment = await Payment.findOne({
      'redotpay.orderId': result.orderId,
    });

    if (!payment) {
      console.error('Pago no encontrado para orderId:', result.orderId);
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado',
      });
    }

    // Actualizar estado según el resultado
    if (result.status === 'paid' || result.status === 'completed') {
      payment.redotpay.transactionId = result.transactionId;
      await payment.markAsCompleted();

      // Actualizar reserva
      const booking = await Booking.findById(payment.bookingId);
      if (booking && booking.status === 'pending') {
        booking.status = 'confirmed';
        await booking.save();
      }

      // Crear notificación
      if (payment.userId) {
        try {
          await Notification.create({
            userId: payment.userId,
            type: 'payment_completed',
            title: 'Pago Confirmado',
            message: `Tu pago de ${payment.amount.toLocaleString()} ${payment.currency} ha sido confirmado.`,
            link: `/mis-reservas`,
            metadata: {
              paymentId: payment._id.toString(),
              transactionId: result.transactionId,
            },
          });
        } catch (notifError) {
          console.error('Error creando notificación:', notifError);
        }
      }
    } else if (result.status === 'failed' || result.status === 'cancelled') {
      await payment.markAsFailed(`Estado desde Redotpay: ${result.status}`);
    }

    // Responder a Redotpay
    res.json({
      success: true,
      message: 'Webhook procesado',
    });
  } catch (error) {
    console.error('Error procesando webhook de Redotpay:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook',
      error: error.message,
    });
  }
};

/**
 * GET /api/payments/my - Obtener pagos del usuario autenticado
 */
exports.getMyPayments = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    const { page = 1, limit = 20, status, paymentMethod } = req.query;

    const query = { userId: req.user.userId };
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(query)
      .populate('bookingId', 'serviceName serviceType fecha hora reservationNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      count: payments.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos',
      error: error.message,
    });
  }
};

/**
 * PUT /api/payments/:id - Actualizar pago
 */
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Pago actualizado exitosamente',
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar pago',
      error: error.message,
    });
  }
};

/**
 * PUT /api/payments/:id/mark-paid - Marcar como pagado (cliente)
 * Cambia el estado a pending_review para revisión de administración
 */
exports.markAsPaid = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado',
      });
    }

    // Solo se puede marcar como pagado si está en estado pending
    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `No se puede marcar como pagado un pago con estado: ${payment.status}`,
      });
    }

    // Actualizar con información adicional si se proporciona
    if (req.body.transactionHash && payment.paymentMethod === 'binance') {
      payment.binance = {
        ...payment.binance,
        transactionHash: req.body.transactionHash,
      };
    }

    if (req.body.reference && payment.paymentMethod === 'bank_transfer') {
      payment.bankTransfer = {
        ...payment.bankTransfer,
        reference: req.body.reference,
        transferDate: req.body.transferDate ? new Date(req.body.transferDate) : new Date(),
      };
    }

    // Marcar como pendiente de revisión
    await payment.markAsPendingReview();

    res.json({
      success: true,
      message: 'Pago marcado como realizado. Será revisado por la administración.',
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al marcar como pagado',
      error: error.message,
    });
  }
};

/**
 * PUT /api/payments/:id/admin-confirm - Confirmar pago desde administración
 * Solo para administradores, confirma pagos en estado pending_review
 */
exports.adminConfirmPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado',
      });
    }

    // Solo se pueden confirmar pagos en revisión o pendientes
    if (payment.status !== 'pending_review' && payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `No se puede confirmar un pago con estado: ${payment.status}`,
      });
    }

    // Actualizar detalles según el método
    if (payment.paymentMethod === 'cash' && req.body.cash) {
      payment.cash = {
        receivedBy: req.body.cash.receivedBy || req.user?.nombre || 'Administrador',
        receivedAt: new Date(),
        notes: req.body.cash.notes || '',
      };
    }

    if (payment.paymentMethod === 'bank_transfer' && req.body.bankTransfer) {
      payment.bankTransfer = {
        ...payment.bankTransfer,
        ...req.body.bankTransfer,
        transferDate: req.body.bankTransfer.transferDate ? new Date(req.body.bankTransfer.transferDate) : new Date(),
      };
    }

    // Marcar como completado
    await payment.markAsCompleted();

    // Actualizar estado de la reserva
    const booking = await Booking.findById(payment.bookingId);
    if (booking && booking.status === 'pending') {
      booking.status = 'confirmed';
      await booking.save();
    }

    // Crear notificación para el cliente
    if (payment.userId) {
      try {
        await Notification.create({
          userId: payment.userId,
          type: 'payment_completed',
          title: 'Pago Confirmado',
          message: `Tu pago de ${payment.amount.toLocaleString()} ${payment.currency} ha sido confirmado para la reserva de ${booking?.serviceName || 'servicio'}.`,
          link: `/mis-reservas`,
          metadata: {
            paymentId: payment._id.toString(),
            bookingId: payment.bookingId.toString(),
            amount: payment.amount,
          },
        });
      } catch (notifError) {
        console.error('Error creando notificación de pago:', notifError);
      }
    }

    res.json({
      success: true,
      message: 'Pago confirmado exitosamente',
      data: payment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al confirmar pago',
      error: error.message,
    });
  }
};

/**
 * POST /api/payments/:id/verify - Verificar pago (genérico)
 */
exports.verifyPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado',
      });
    }

    if (payment.paymentMethod === 'binance') {
      const { transactionHash, network } = req.body;
      if (!transactionHash) {
        return res.status(400).json({
          success: false,
          message: 'transactionHash es requerido para pagos de Binance',
        });
      }
      return exports.verifyBinancePayment(req, res);
    } else if (payment.paymentMethod === 'redotpay') {
      const verification = await redotpayService.verifyPayment(payment.redotpay?.orderId);
      if (verification.success && verification.verified) {
        payment.redotpay.transactionId = verification.transactionId;
        await payment.markAsCompleted();
        
        const booking = await Booking.findById(payment.bookingId);
        if (booking && booking.status === 'pending') {
          booking.status = 'confirmed';
          await booking.save();
        }

        if (payment.userId) {
          try {
            await Notification.create({
              userId: payment.userId,
              type: 'payment_completed',
              title: 'Pago Confirmado',
              message: `Tu pago de ${payment.amount.toLocaleString()} ${payment.currency} ha sido confirmado.`,
              link: `/mis-reservas`,
              metadata: {
                paymentId: payment._id.toString(),
                transactionId: verification.transactionId,
              },
            });
          } catch (notifError) {
            console.error('Error creando notificación:', notifError);
          }
        }

        return res.json({
          success: true,
          message: 'Pago verificado y confirmado',
          data: payment,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'No se pudo verificar el pago',
          error: verification.error,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Este método de pago no requiere verificación automática',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al verificar pago',
      error: error.message,
    });
  }
};

/**
 * POST /api/payments/webhook/binance - Webhook de Binance Pay
 */
exports.binanceWebhook = async (req, res) => {
  try {
    const webhookData = req.body;

    // Procesar webhook
    const result = await binanceService.processWebhook(webhookData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Error procesando webhook',
        error: result.error,
      });
    }

    // Buscar el pago por orderId (merchantTradeNo)
    const payment = await Payment.findOne({
      'paymentDetails.prepayId': result.orderId,
    });

    if (!payment) {
      console.error('Pago no encontrado para orderId:', result.orderId);
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado',
      });
    }

    // Actualizar estado según el resultado
    if (result.status === 'SUCCESS' || result.status === 'PAID') {
      payment.binance.transactionHash = result.transactionId;
      await payment.markAsCompleted();

      // Actualizar reserva
      const booking = await Booking.findById(payment.bookingId);
      if (booking && booking.status === 'pending') {
        booking.status = 'confirmed';
        await booking.save();
      }

      // Crear notificación
      if (payment.userId) {
        try {
          await Notification.create({
            userId: payment.userId,
            type: 'payment_completed',
            title: 'Pago Confirmado',
            message: `Tu pago de ${payment.amount.toLocaleString()} ${payment.currency} ha sido confirmado.`,
            link: `/mis-reservas`,
            metadata: {
              paymentId: payment._id.toString(),
              transactionId: result.transactionId,
            },
          });
        } catch (notifError) {
          console.error('Error creando notificación:', notifError);
        }
      }
    } else if (result.status === 'FAILED' || result.status === 'CANCELLED') {
      await payment.markAsFailed(`Estado desde Binance: ${result.status}`);
    }

    // Responder a Binance
    res.json({
      success: true,
      message: 'Webhook procesado',
    });
  } catch (error) {
    console.error('Error procesando webhook de Binance:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando webhook',
      error: error.message,
    });
  }
};

/**
 * GET /api/payments/admin/all - Obtener todos los pagos (admin)
 */
exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, paymentMethod, startDate, endDate } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(query)
      .populate('bookingId', 'serviceName serviceType fecha hora reservationNumber')
      .populate('userId', 'nombre email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    // Calcular estadísticas
    const stats = {
      total: await Payment.countDocuments(),
      completed: await Payment.countDocuments({ status: 'completed' }),
      pending: await Payment.countDocuments({ status: 'pending' }),
      failed: await Payment.countDocuments({ status: 'failed' }),
      totalAmount: await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then(result => result[0]?.total || 0),
    };

    res.json({
      success: true,
      data: payments,
      pagination: {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener pagos',
      error: error.message,
    });
  }
};
