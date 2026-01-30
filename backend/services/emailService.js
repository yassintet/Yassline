const nodemailer = require('nodemailer');

const COMPANY_NAME = process.env.COMPANY_NAME || 'Yassline Tour';
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'info@yassline.com';

/**
 * Enviar email vía Resend API (HTTPS). Funciona en Railway donde SMTP suele estar bloqueado.
 * Variables: RESEND_API_KEY (requerido), RESEND_FROM (opcional, ej. "Yassline <onboarding@resend.dev>")
 */
const sendEmailViaResend = async ({ to, subject, html, text, attachments = [] }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('RESEND_API_KEY no configurado');
  }
  const from = process.env.RESEND_FROM || `"${COMPANY_NAME}" <onboarding@resend.dev>`;
  const toArray = Array.isArray(to) ? to : [to];
  const body = {
    from,
    to: toArray,
    subject,
    html: html || undefined,
    text: text || undefined,
  };
  if (attachments.length > 0) {
    body.attachments = attachments.map((att) => ({
      filename: att.filename || 'attachment',
      content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
    }));
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errMsg = data.message || data.error || data.statusText || `HTTP ${res.status}`;
    console.error('❌ Resend API error:', res.status, JSON.stringify(data));
    if (res.status === 422 || res.status === 403) {
      const hint = (data.message || '').toLowerCase().includes('domain')
        ? ' Usa RESEND_FROM con onboarding@resend.dev o verifica tu dominio en resend.com.'
        : ' Comprueba RESEND_API_KEY y RESEND_FROM (usa "Nombre <onboarding@resend.dev>" en plan gratis).';
      throw new Error(errMsg + hint);
    }
    throw new Error(errMsg);
  }
  return { success: true, messageId: data.id };
};

// Configuración del transporter de email (SMTP, para desarrollo local)
const createTransporter = () => {
  // Validar que SMTP_HOST no sea un placeholder
  const smtpHost = process.env.SMTP_HOST;
  const isPlaceholder = smtpHost && (
    smtpHost === 'smtp.tu-servidor.com' ||
    smtpHost.includes('tu-servidor') ||
    smtpHost.includes('example.com') ||
    smtpHost.includes('placeholder')
  );
  
  // Si hay configuración SMTP personalizada válida, usarla
  if (smtpHost && process.env.SMTP_PORT && !isPlaceholder) {
    console.log('📧 Usando configuración SMTP personalizada:', smtpHost);
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
  
  // Si hay SMTP_HOST pero es un placeholder, advertir y usar Gmail
  if (isPlaceholder) {
    console.warn('⚠️ SMTP_HOST está configurado con un valor placeholder:', smtpHost);
    console.warn('⚠️ Usando Gmail SMTP en su lugar. Configura SMTP_HOST con un valor válido para usar SMTP personalizado.');
  }
  
  // Por defecto, usar Gmail SMTP
  const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
  
  if (!emailUser || !emailPass) {
    console.error('❌ ERROR: EMAIL_USER o EMAIL_PASS no están configurados (y RESEND_API_KEY tampoco).');
    throw new Error('Email no configurado. Añade RESEND_API_KEY en .env o Railway (recomendado, ver backend/EMAIL_RAILWAY_RESEND.md), o EMAIL_USER y EMAIL_PASS para SMTP.');
  }
  
  console.log('📧 Usando Gmail SMTP con usuario:', emailUser);
  
  // Configuración mejorada para Gmail con opciones de conexión más robustas
  // Intentar primero con puerto 465 (SSL) que suele funcionar mejor en servidores cloud
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true para puerto 465 (SSL)
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    // Opciones adicionales para mejorar la conexión
    connectionTimeout: 30000, // 30 segundos
    greetingTimeout: 30000, // 30 segundos
    socketTimeout: 30000, // 30 segundos
    // Configuración TLS/SSL
    tls: {
      rejectUnauthorized: false, // Permitir certificados autofirmados si es necesario
      minVersion: 'TLSv1.2',
    },
    // Reintentos
    pool: false, // Desactivar pool para evitar problemas de conexión
    maxConnections: 1,
    maxMessages: 1,
    // Opciones adicionales
    requireTLS: true,
    debug: false, // Cambiar a true para ver más detalles en los logs
  });
};

// Email de destino para notificaciones administrativas
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yassline.com';
const COMPANY_PHONE = process.env.COMPANY_PHONE || '+212 669 215 611';

/**
 * Estado de configuración de email (para logs al arranque).
 * No expone claves; solo indica si Resend está configurado.
 */
const getEmailStatus = () => {
  const hasResend = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
  const from = process.env.RESEND_FROM || `"${COMPANY_NAME}" <onboarding@resend.dev>`;
  if (hasResend) {
    return { provider: 'resend', configured: true, from, hint: 'Emails se enviarán vía Resend API.' };
  }
  const hasSmtp = !!(process.env.EMAIL_USER || process.env.GMAIL_USER) && !!(process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD);
  const hasCustomSmtp = process.env.SMTP_HOST && !process.env.SMTP_HOST.includes('placeholder');
  return {
    provider: 'smtp',
    configured: hasSmtp || hasCustomSmtp,
    from: null,
    hint: hasSmtp || hasCustomSmtp
      ? 'Emails se enviarán vía SMTP (en Railway puede dar ETIMEDOUT).'
      : '⚠️ Email NO configurado: añade RESEND_API_KEY en Railway (recomendado) o EMAIL_USER/EMAIL_PASS.',
  };
};

/**
 * Enviar email genérico.
 * Si RESEND_API_KEY está definido, usa Resend (recomendado en Railway).
 * Si no, usa SMTP (nodemailer).
 */
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  const useResend = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
  try {
    console.log(`📧 Enviando email a: ${to} | Asunto: ${subject} | Provider: ${useResend ? 'Resend' : 'SMTP'}`);

    // Resend (API por HTTPS) — funciona en Railway donde SMTP suele estar bloqueado
    if (useResend) {
      const result = await sendEmailViaResend({ to, subject, html, text, attachments });
      console.log('✅ Email enviado vía Resend:', result.messageId);
      return result;
    }

    // SMTP (nodemailer) — para desarrollo local o servidores que permitan SMTP
    console.log('📧 RESEND_API_KEY no configurada; intentando SMTP (EMAIL_USER/EMAIL_PASS)...');
    const transporter = createTransporter();
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
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error enviando email:', error.message);
    if (error.code) console.error('❌ Código:', error.code);
    if (error.response) console.error('❌ Respuesta:', error.response);
    // Para Resend: el mensaje ya incluye hint (ej. dominio no verificado)
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

/**
 * Notificación de cancelación de reserva al cliente
 */
exports.sendBookingCancellation = async (bookingData) => {
  const content = `
    <h2>Reserva Cancelada</h2>
    <p>Hola <strong>${bookingData.nombre}</strong>,</p>
    <p>Te informamos que tu reserva ha sido cancelada.</p>
    
    <div class="info-box">
      <p><strong>Detalles de la reserva cancelada:</strong></p>
      <p><strong>Número de reserva:</strong> ${bookingData.reservationNumber || 'N/A'}</p>
      <p><strong>Servicio:</strong> ${bookingData.serviceName || 'N/A'}</p>
      ${bookingData.fecha ? `<p><strong>Fecha:</strong> ${bookingData.fecha}</p>` : ''}
      ${bookingData.hora ? `<p><strong>Hora:</strong> ${bookingData.hora}</p>` : ''}
      ${bookingData.total ? `<p><strong>Total:</strong> ${bookingData.total} MAD</p>` : ''}
    </div>
    
    ${bookingData.reason ? `
    <div class="info-box">
      <p><strong>Motivo de cancelación:</strong></p>
      <p>${bookingData.reason}</p>
    </div>
    ` : ''}
    
    <p>Si tienes alguna pregunta sobre esta cancelación o deseas realizar una nueva reserva, no dudes en contactarnos:</p>
    <ul>
      <li>Email: ${COMPANY_EMAIL}</li>
      <li>Teléfono: ${COMPANY_PHONE}</li>
    </ul>
    
    <p>Esperamos poder servirte en el futuro.</p>
    <p>Saludos cordiales,<br>El equipo de ${COMPANY_NAME}</p>
  `;

  return await sendEmail({
    to: bookingData.email,
    subject: `Reserva cancelada - ${bookingData.reservationNumber || 'N/A'}`,
    html: getBaseTemplate(content, 'Reserva Cancelada'),
    text: `Hola ${bookingData.nombre}, tu reserva ha sido cancelada. Número de reserva: ${bookingData.reservationNumber || 'N/A'}`,
  });
};

/**
 * Notificación de precio propuesto por la administración
 */
exports.sendPriceProposal = async (bookingData) => {
  const content = `
    <h2>Precio Propuesto para tu Reserva</h2>
    <p>Hola <strong>${bookingData.nombre}</strong>,</p>
    <p>Hemos revisado tu solicitud de reserva y te proponemos el siguiente precio:</p>
    
    <div class="info-box" style="background-color: #e8f5e9; border-left: 4px solid #4caf50;">
      <p style="font-size: 18px; margin: 10px 0;"><strong>Precio Propuesto:</strong></p>
      <p style="font-size: 32px; font-weight: bold; color: #2e7d32; margin: 15px 0;">
        ${bookingData.proposedPrice ? bookingData.proposedPrice.toLocaleString() : 'N/A'} MAD
      </p>
    </div>
    
    <div class="info-box">
      <p><strong>Detalles de tu reserva:</strong></p>
      <p><strong>Número de reserva:</strong> ${bookingData.reservationNumber || 'Pendiente'}</p>
      <p><strong>Servicio:</strong> ${bookingData.serviceName || 'N/A'}</p>
      ${bookingData.fecha ? `<p><strong>Fecha:</strong> ${bookingData.fecha}</p>` : ''}
      ${bookingData.hora ? `<p><strong>Hora:</strong> ${bookingData.hora}</p>` : ''}
      ${bookingData.pasajeros ? `<p><strong>Pasajeros:</strong> ${bookingData.pasajeros}</p>` : ''}
    </div>
    
    ${bookingData.priceMessage ? `
    <div class="info-box">
      <p><strong>Mensaje adicional:</strong></p>
      <p>${bookingData.priceMessage}</p>
    </div>
    ` : ''}
    
    <p><strong>Por favor, revisa este precio y confirma si estás de acuerdo.</strong></p>
    
    <p>Puedes aceptar o rechazar este precio desde tu panel de reservas:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/mis-reservas" class="button" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
        Ver Mis Reservas
      </a>
    </div>
    
    <p>Si tienes alguna pregunta sobre este precio o deseas negociar, no dudes en contactarnos:</p>
    <ul>
      <li>Email: ${COMPANY_EMAIL}</li>
      <li>Teléfono: ${COMPANY_PHONE}</li>
    </ul>
    
    <p>Esperamos tu respuesta para proceder con la confirmación de tu reserva.</p>
    <p>Saludos cordiales,<br>El equipo de ${COMPANY_NAME}</p>
  `;

  return await sendEmail({
    to: bookingData.email,
    subject: `Precio propuesto para tu reserva - ${bookingData.reservationNumber || 'N/A'}`,
    html: getBaseTemplate(content, 'Precio Propuesto'),
    text: `Hola ${bookingData.nombre}, te proponemos un precio de ${bookingData.proposedPrice ? bookingData.proposedPrice.toLocaleString() : 'N/A'} MAD para tu reserva de ${bookingData.serviceName || 'N/A'}.`,
  });
};

/**
 * Notificación de actualización de reserva al cliente
 */
exports.sendBookingUpdate = async (bookingData, changes) => {
  const changesList = Object.keys(changes).map(key => {
    const labels = {
      fecha: 'Fecha',
      hora: 'Hora',
      pasajeros: 'Número de Pasajeros',
      mensaje: 'Mensaje',
      total: 'Precio Total',
      status: 'Estado',
    };
    return `<li><strong>${labels[key] || key}:</strong> ${changes[key].old} → ${changes[key].new}</li>`;
  }).join('');

  const content = `
    <h2>Reserva Actualizada</h2>
    <p>Hola <strong>${bookingData.nombre}</strong>,</p>
    <p>Te informamos que tu reserva ha sido actualizada.</p>
    
    <div class="info-box">
      <p><strong>Detalles de la reserva:</strong></p>
      <p><strong>Número de reserva:</strong> ${bookingData.reservationNumber || 'N/A'}</p>
      <p><strong>Servicio:</strong> ${bookingData.serviceName || 'N/A'}</p>
    </div>
    
    <div class="info-box">
      <p><strong>Cambios realizados:</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        ${changesList}
      </ul>
    </div>
    
    <div class="info-box">
      <p><strong>Información actualizada de tu reserva:</strong></p>
      ${bookingData.fecha ? `<p><strong>Fecha:</strong> ${bookingData.fecha}</p>` : ''}
      ${bookingData.hora ? `<p><strong>Hora:</strong> ${bookingData.hora}</p>` : ''}
      ${bookingData.pasajeros ? `<p><strong>Pasajeros:</strong> ${bookingData.pasajeros}</p>` : ''}
      ${bookingData.total ? `<p><strong>Total:</strong> ${bookingData.total} MAD</p>` : ''}
      ${bookingData.status ? `<p><strong>Estado:</strong> ${bookingData.status}</p>` : ''}
    </div>
    
    <p>Si tienes alguna pregunta sobre estos cambios o necesitas realizar alguna modificación adicional, no dudes en contactarnos:</p>
    <ul>
      <li>Email: ${COMPANY_EMAIL}</li>
      <li>Teléfono: ${COMPANY_PHONE}</li>
    </ul>
    
    <p>Saludos cordiales,<br>El equipo de ${COMPANY_NAME}</p>
  `;

  return await sendEmail({
    to: bookingData.email,
    subject: `Reserva actualizada - ${bookingData.reservationNumber || 'N/A'}`,
    html: getBaseTemplate(content, 'Reserva Actualizada'),
    text: `Hola ${bookingData.nombre}, tu reserva ha sido actualizada. Número de reserva: ${bookingData.reservationNumber || 'N/A'}`,
  });
};

/**
 * Recordatorio de reserva próxima al cliente
 */
exports.sendBookingReminder = async (bookingData) => {
  const content = `
    <h2>Recordatorio de Reserva</h2>
    <p>Hola <strong>${bookingData.nombre}</strong>,</p>
    <p>Te recordamos que tienes una reserva confirmada con nosotros.</p>
    
    <div class="info-box">
      <p><strong>Detalles de tu reserva:</strong></p>
      <p><strong>Número de reserva:</strong> ${bookingData.reservationNumber || 'N/A'}</p>
      <p><strong>Servicio:</strong> ${bookingData.serviceName || 'N/A'}</p>
      ${bookingData.fecha ? `<p><strong>Fecha:</strong> ${bookingData.fecha}</p>` : ''}
      ${bookingData.hora ? `<p><strong>Hora:</strong> ${bookingData.hora}</p>` : ''}
      ${bookingData.pasajeros ? `<p><strong>Pasajeros:</strong> ${bookingData.pasajeros}</p>` : ''}
      ${bookingData.total ? `<p><strong>Total:</strong> ${bookingData.total} MAD</p>` : ''}
    </div>
    
    ${bookingData.routeData ? `
    <div class="info-box">
      <p><strong>Ruta:</strong></p>
      <p>${bookingData.routeData.from || ''} → ${bookingData.routeData.to || ''}</p>
    </div>
    ` : ''}
    
    <p><strong>Por favor, asegúrate de estar listo a la hora indicada.</strong></p>
    
    <p>Si necesitas modificar o cancelar tu reserva, contacta con nosotros lo antes posible:</p>
    <ul>
      <li>Email: ${COMPANY_EMAIL}</li>
      <li>Teléfono: ${COMPANY_PHONE}</li>
    </ul>
    
    <p>¡Esperamos verte pronto!</p>
    <p>Saludos cordiales,<br>El equipo de ${COMPANY_NAME}</p>
  `;

  return await sendEmail({
    to: bookingData.email,
    subject: `Recordatorio de reserva - ${bookingData.serviceName || 'N/A'}`,
    html: getBaseTemplate(content, 'Recordatorio de Reserva'),
    text: `Hola ${bookingData.nombre}, te recordamos tu reserva del ${bookingData.fecha || 'N/A'} a las ${bookingData.hora || 'N/A'}.`,
  });
};

// Enviar email de recuperación de contraseña (usa sendEmail para Resend o SMTP)
exports.sendPasswordReset = async ({ nombre, email, resetUrl }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperación de Contraseña</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Yassline Tour</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Recuperación de Contraseña</h2>
        <p>Hola ${nombre || 'Usuario'},</p>
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Yassline Tour.</p>
        <p>Si solicitaste este cambio, haz clic en el siguiente botón para restablecer tu contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Restablecer Contraseña</a>
        </div>
        <p style="font-size: 12px; color: #666;">O copia y pega este enlace en tu navegador:</p>
        <p style="font-size: 12px; color: #666; word-break: break-all;">${resetUrl}</p>
        <p><strong>Este enlace expirará en 1 hora.</strong></p>
        <p>Si no solicitaste este cambio, puedes ignorar este email de forma segura. Tu contraseña no será modificada.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="font-size: 12px; color: #666; margin-bottom: 0;">Este es un email automático, por favor no respondas a este mensaje.</p>
      </div>
    </body>
    </html>
  `;
  const text = `Recuperación de Contraseña - Yassline Tour\n\nHola ${nombre || 'Usuario'},\n\nHemos recibido una solicitud para restablecer la contraseña. Visita: ${resetUrl}\n\nEste enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este email.`;
  const result = await sendEmail({
    to: email,
    subject: 'Recuperación de contraseña - Yassline Tour',
    html,
    text,
  });
  if (!result.success) throw new Error(result.error);
  return { messageId: result.messageId };
};

exports.getEmailStatus = getEmailStatus;

module.exports = exports;
