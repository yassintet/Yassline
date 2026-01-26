const nodemailer = require('nodemailer');

// Configuración del transporter de email
const createTransporter = () => {
  // Si hay configuración SMTP personalizada, usarla
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    console.log('📧 Usando configuración SMTP personalizada:', process.env.SMTP_HOST);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Opciones adicionales para mejorar la conexión
      connectionTimeout: 60000, // 60 segundos
      greetingTimeout: 30000, // 30 segundos
      socketTimeout: 60000, // 60 segundos
      // Configuración TLS
      tls: {
        rejectUnauthorized: false, // Permitir certificados autofirmados si es necesario
      },
      // Reintentos
      pool: true,
      maxConnections: 1,
      maxMessages: 3,
    });
  }
  
  // Por defecto, usar Gmail SMTP
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  
  if (!emailUser || !emailPass) {
    console.error('❌ ERROR: EMAIL_USER o EMAIL_PASS no están configurados');
    throw new Error('Configuración de email incompleta. Verifica EMAIL_USER y EMAIL_PASS en .env');
  }
  
  console.log('📧 Usando Gmail SMTP con usuario:', emailUser);
  
  // Configuración mejorada para Gmail con opciones de conexión más robustas
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    // Opciones adicionales para mejorar la conexión
    connectionTimeout: 60000, // 60 segundos
    greetingTimeout: 30000, // 30 segundos
    socketTimeout: 60000, // 60 segundos
    // Configuración TLS
    tls: {
      rejectUnauthorized: false, // Permitir certificados autofirmados si es necesario
      ciphers: 'SSLv3',
    },
    // Reintentos
    pool: true,
    maxConnections: 1,
    maxMessages: 3,
  });
};

// Email de destino para notificaciones administrativas
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yassline.com';
const COMPANY_NAME = process.env.COMPANY_NAME || 'Yassline Tour';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'info@yassline.com';
const COMPANY_PHONE = process.env.COMPANY_PHONE || '+212 669 215 611';

/**
 * Enviar email genérico
 */
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    console.log(`📧 Intentando enviar email a: ${to}`);
    console.log(`📧 Asunto: ${subject}`);
    
    const transporter = createTransporter();
    
    // Verificar conexión antes de enviar
    await transporter.verify();
    console.log('✅ Conexión SMTP verificada correctamente');
    
    const mailOptions = {
      from: `"${COMPANY_NAME}" <${COMPANY_EMAIL}>`,
      to,
      subject,
      html,
      text,
      attachments,
    };

    console.log(`📧 Enviando email desde: ${COMPANY_EMAIL} a: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado exitosamente:', info.messageId);
    console.log('✅ Respuesta del servidor:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    console.error('❌ Código de error:', error.code);
    console.error('❌ Comando:', error.command);
    if (error.response) {
      console.error('❌ Respuesta del servidor:', error.response);
    }
    return { success: false, error: error.message };
  }
};

/**
 * Template HTML base para emails
 */
const getBaseTemplate = (content, title) => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #0066CC 0%, #004499 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      margin: -30px -30px 30px -30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #FF385C 0%, #E01E4F 100%);
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .info-box {
      background-color: #f8f9fa;
      border-left: 4px solid #0066CC;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .detail-row {
      margin: 10px 0;
      padding: 10px;
      background-color: #f8f9fa;
      border-radius: 4px;
    }
    .detail-label {
      font-weight: bold;
      color: #0066CC;
      display: inline-block;
      min-width: 150px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${COMPANY_NAME}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${COMPANY_NAME}. Todos los derechos reservados.</p>
      <p>Este es un email automático, por favor no responda directamente.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Notificación de nuevo mensaje de contacto (para admin)
 */
exports.sendContactNotification = async (contactData) => {
  const content = `
    <h2>Nuevo Mensaje de Contacto</h2>
    <div class="info-box">
      <p><strong>Has recibido un nuevo mensaje a través del formulario de contacto.</strong></p>
    </div>
    
    <div class="detail-row">
      <span class="detail-label">Nombre:</span>
      <span>${contactData.name}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email:</span>
      <span>${contactData.email}</span>
    </div>
    ${contactData.phone ? `
    <div class="detail-row">
      <span class="detail-label">Teléfono:</span>
      <span>${contactData.phone}</span>
    </div>
    ` : ''}
    ${contactData.serviceType ? `
    <div class="detail-row">
      <span class="detail-label">Servicio:</span>
      <span>${contactData.serviceType}</span>
    </div>
    ` : ''}
    <div class="detail-row">
      <span class="detail-label">Mensaje:</span>
      <div style="margin-top: 10px; white-space: pre-wrap;">${contactData.message}</div>
    </div>
    <div class="detail-row">
      <span class="detail-label">Fecha:</span>
      <span>${new Date().toLocaleString('es-ES')}</span>
    </div>
  `;

  return await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Nuevo mensaje de contacto - ${contactData.name}`,
    html: getBaseTemplate(content, 'Nuevo Mensaje de Contacto'),
    text: `Nuevo mensaje de contacto de ${contactData.name} (${contactData.email}): ${contactData.message}`,
  });
};

/**
 * Confirmación de recepción al cliente (formulario de contacto)
 */
exports.sendContactConfirmation = async (contactData) => {
  const content = `
    <h2>¡Gracias por contactarnos!</h2>
    <p>Hola <strong>${contactData.name}</strong>,</p>
    <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo lo antes posible.</p>
    
    <div class="info-box">
      <p><strong>Resumen de tu consulta:</strong></p>
      <p>${contactData.message}</p>
    </div>
    
    <p>Nuestro equipo revisará tu solicitud y te responderá en un plazo máximo de 24 horas.</p>
    
    <p>Si tienes alguna pregunta urgente, puedes contactarnos directamente:</p>
    <ul>
      <li>Email: ${COMPANY_EMAIL}</li>
      <li>Teléfono: ${COMPANY_PHONE}</li>
    </ul>
    
    <p>Saludos cordiales,<br>El equipo de ${COMPANY_NAME}</p>
  `;

  return await sendEmail({
    to: contactData.email,
    subject: `Confirmación de recepción - ${COMPANY_NAME}`,
    html: getBaseTemplate(content, 'Confirmación de Recepción'),
    text: `Hola ${contactData.name}, hemos recibido tu mensaje y nos pondremos en contacto contigo pronto.`,
  });
};

/**
 * Notificación de nueva solicitud de reserva (para admin)
 */
exports.sendBookingNotification = async (bookingData) => {
  const content = `
    <h2>Nueva Solicitud de Reserva</h2>
    <div class="info-box">
      <p><strong>Has recibido una nueva solicitud de reserva.</strong></p>
    </div>
    
    <div class="detail-row">
      <span class="detail-label">Cliente:</span>
      <span>${bookingData.nombre}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Email:</span>
      <span>${bookingData.email}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Teléfono:</span>
      <span>${bookingData.telefono || 'No proporcionado'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Servicio:</span>
      <span>${bookingData.serviceName || 'N/A'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Tipo:</span>
      <span>${bookingData.serviceType || 'N/A'}</span>
    </div>
    ${bookingData.priceLabel ? `
    <div class="detail-row">
      <span class="detail-label">Precio:</span>
      <span>${bookingData.priceLabel}</span>
    </div>
    ` : ''}
    ${bookingData.fecha ? `
    <div class="detail-row">
      <span class="detail-label">Fecha:</span>
      <span>${bookingData.fecha}</span>
    </div>
    ` : ''}
    ${bookingData.hora ? `
    <div class="detail-row">
      <span class="detail-label">Hora:</span>
      <span>${bookingData.hora}</span>
    </div>
    ` : ''}
    ${bookingData.pasajeros ? `
    <div class="detail-row">
      <span class="detail-label">Pasajeros:</span>
      <span>${bookingData.pasajeros}</span>
    </div>
    ` : ''}
    ${bookingData.mensaje ? `
    <div class="detail-row">
      <span class="detail-label">Mensaje:</span>
      <div style="margin-top: 10px; white-space: pre-wrap;">${bookingData.mensaje}</div>
    </div>
    ` : ''}
    ${bookingData.details ? `
    <div class="detail-row">
      <span class="detail-label">Detalles adicionales:</span>
      <div style="margin-top: 10px; white-space: pre-wrap;">${bookingData.details}</div>
    </div>
    ` : ''}
    <div class="detail-row">
      <span class="detail-label">Fecha de solicitud:</span>
      <span>${new Date().toLocaleString('es-ES')}</span>
    </div>
  `;

  return await sendEmail({
    to: ADMIN_EMAIL,
    subject: `Nueva solicitud de reserva - ${bookingData.nombre}`,
    html: getBaseTemplate(content, 'Nueva Solicitud de Reserva'),
    text: `Nueva solicitud de reserva de ${bookingData.nombre} (${bookingData.email}) para ${bookingData.serviceName}`,
  });
};

/**
 * Confirmación de recepción de reserva al cliente
 */
exports.sendBookingConfirmation = async (bookingData) => {
  const content = `
    <h2>¡Solicitud de Reserva Recibida!</h2>
    <p>Hola <strong>${bookingData.nombre}</strong>,</p>
    <p>Gracias por tu interés en nuestros servicios. Hemos recibido tu solicitud de reserva y la estamos procesando.</p>
    
    <div class="info-box">
      <p><strong>Detalles de tu solicitud:</strong></p>
      <p><strong>Servicio:</strong> ${bookingData.serviceName || 'N/A'}</p>
      <p><strong>Tipo:</strong> ${bookingData.serviceType || 'N/A'}</p>
      ${bookingData.priceLabel ? `<p><strong>Precio estimado:</strong> ${bookingData.priceLabel}</p>` : ''}
      ${bookingData.fecha ? `<p><strong>Fecha:</strong> ${bookingData.fecha}</p>` : ''}
      ${bookingData.hora ? `<p><strong>Hora:</strong> ${bookingData.hora}</p>` : ''}
      ${bookingData.pasajeros ? `<p><strong>Pasajeros:</strong> ${bookingData.pasajeros}</p>` : ''}
    </div>
    
    <p>Nuestro equipo revisará tu solicitud y te contactará en breve para confirmar los detalles y finalizar la reserva.</p>
    
    <p>Si tienes alguna pregunta o necesitas modificar algo, no dudes en contactarnos:</p>
    <ul>
      <li>Email: ${COMPANY_EMAIL}</li>
      <li>Teléfono: ${COMPANY_PHONE}</li>
    </ul>
    
    <p>Saludos cordiales,<br>El equipo de ${COMPANY_NAME}</p>
  `;

  return await sendEmail({
    to: bookingData.email,
    subject: `Confirmación de solicitud de reserva - ${COMPANY_NAME}`,
    html: getBaseTemplate(content, 'Confirmación de Reserva'),
    text: `Hola ${bookingData.nombre}, hemos recibido tu solicitud de reserva y la estamos procesando.`,
  });
};

/**
 * Confirmación de reserva confirmada (con factura)
 */
exports.sendReservationConfirmed = async (reservationData, invoiceBuffer) => {
  const attachments = [];
  
  if (invoiceBuffer) {
    attachments.push({
      filename: `factura-${reservationData.reservationNumber || Date.now()}.pdf`,
      content: invoiceBuffer,
    });
  }

  const content = `
    <h2>¡Reserva Confirmada!</h2>
    <p>Hola <strong>${reservationData.nombre}</strong>,</p>
    <p>Nos complace confirmar que tu reserva ha sido confirmada.</p>
    
    <div class="info-box">
      <p><strong>Detalles de tu reserva:</strong></p>
      <p><strong>Número de reserva:</strong> ${reservationData.reservationNumber || 'N/A'}</p>
      <p><strong>Servicio:</strong> ${reservationData.serviceName || 'N/A'}</p>
      <p><strong>Fecha:</strong> ${reservationData.fecha || 'N/A'}</p>
      <p><strong>Hora:</strong> ${reservationData.hora || 'N/A'}</p>
      <p><strong>Total:</strong> ${reservationData.total || 'N/A'}</p>
    </div>
    
    ${invoiceBuffer ? `
    <p>Adjuntamos tu factura en formato PDF. Por favor, guárdala para tus registros.</p>
    ` : ''}
    
    <p>Si tienes alguna pregunta o necesitas modificar tu reserva, contacta con nosotros:</p>
    <ul>
      <li>Email: ${COMPANY_EMAIL}</li>
      <li>Teléfono: ${COMPANY_PHONE}</li>
    </ul>
    
    <p>¡Esperamos verte pronto!</p>
    <p>Saludos cordiales,<br>El equipo de ${COMPANY_NAME}</p>
  `;

  return await sendEmail({
    to: reservationData.email,
    subject: `Reserva confirmada - ${reservationData.reservationNumber || 'N/A'}`,
    html: getBaseTemplate(content, 'Reserva Confirmada'),
    text: `Hola ${reservationData.nombre}, tu reserva ha sido confirmada. Número de reserva: ${reservationData.reservationNumber || 'N/A'}`,
    attachments,
  });
};

module.exports = exports;
