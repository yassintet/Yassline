/**
 * Script para enviar recordatorios automáticos de reservas próximas
 * 
 * Este script debe ejecutarse periódicamente (por ejemplo, cada día a las 9 AM)
 * para enviar recordatorios a los clientes que tienen reservas confirmadas
 * en las próximas 24-48 horas.
 * 
 * Uso:
 *   node scripts/sendBookingReminders.js
 * 
 * O configurar como tarea programada (cron job):
 *   0 9 * * * cd /ruta/al/proyecto && node scripts/sendBookingReminders.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const Booking = require('../models/Booking');
const emailService = require('../services/emailService');

// Configurar DNS alternativo para resolver SRV (Google DNS y Cloudflare)
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Configuración
const REMINDER_HOURS_BEFORE = 24; // Enviar recordatorio 24 horas antes
const REMINDER_HOURS_BEFORE_OPTIONAL = 48; // Opcional: también enviar 48 horas antes

// Conectar a MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI no está configurada en las variables de entorno');
    }
    
    // Usar las mismas opciones de conexión que el servidor
    const options = {
      serverSelectionTimeoutMS: 30000, // Timeout de 30 segundos
      socketTimeoutMS: 45000, // Timeout de socket
      connectTimeoutMS: 30000, // Timeout de conexión
      maxPoolSize: 10, // Mantener hasta 10 conexiones
      retryWrites: true,
      w: 'majority',
      heartbeatFrequencyMS: 10000,
      retryReads: true,
      directConnection: false,
      readPreference: 'primary'
    };
    
    await mongoose.connect(mongoURI, options);
    console.log('✅ Conectado a MongoDB');
    console.log('📊 Base de datos:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    
    // Diagnóstico específico
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('\n🔍 Diagnóstico:');
      console.error('   1. Verifica que el cluster esté ACTIVO (no pausado) en MongoDB Atlas');
      console.error('   2. Verifica la whitelist de IPs en Network Access');
      console.error('      → Agrega 0.0.0.0/0 para permitir todas las IPs (desarrollo)');
      console.error('   3. Verifica el formato de la URL');
    }
    
    process.exit(1);
  }
};

// Función para parsear fecha y hora de la reserva
const parseBookingDateTime = (fecha, hora) => {
  if (!fecha) return null;
  
  try {
    // Intentar diferentes formatos de fecha
    let dateObj;
    
    // Formato: YYYY-MM-DD o DD/MM/YYYY
    if (fecha.includes('/')) {
      const [day, month, year] = fecha.split('/');
      dateObj = new Date(year, month - 1, day);
    } else if (fecha.includes('-')) {
      dateObj = new Date(fecha);
    } else {
      return null;
    }
    
    // Agregar hora si está disponible
    if (hora) {
      const [hours, minutes] = hora.split(':');
      if (hours && minutes) {
        dateObj.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
    } else {
      // Si no hay hora, usar las 9 AM por defecto
      dateObj.setHours(9, 0, 0, 0);
    }
    
    return dateObj;
  } catch (error) {
    console.error('Error parseando fecha/hora:', error);
    return null;
  }
};

// Función principal para enviar recordatorios
const sendReminders = async () => {
  try {
    console.log('📧 Iniciando envío de recordatorios de reservas...');
    
    // Obtener todas las reservas confirmadas
    const confirmedBookings = await Booking.find({
      status: 'confirmed',
    });
    
    console.log(`📋 Encontradas ${confirmedBookings.length} reservas confirmadas`);
    
    const now = new Date();
    const remindersSent = [];
    const errors = [];
    
    for (const booking of confirmedBookings) {
      try {
        // Parsear fecha y hora de la reserva
        const bookingDateTime = parseBookingDateTime(booking.fecha, booking.hora);
        
        if (!bookingDateTime) {
          console.log(`⚠️  No se pudo parsear fecha/hora para reserva ${booking._id}`);
          continue;
        }
        
        // Calcular diferencia en horas
        const diffHours = (bookingDateTime - now) / (1000 * 60 * 60);
        
        // Verificar si está en el rango de recordatorio (24-48 horas antes)
        if (diffHours > 0 && diffHours <= REMINDER_HOURS_BEFORE) {
          // Verificar si ya se envió un recordatorio reciente (últimas 12 horas)
          const lastReminderSent = booking.lastReminderSent;
          if (lastReminderSent) {
            const hoursSinceLastReminder = (now - lastReminderSent) / (1000 * 60 * 60);
            if (hoursSinceLastReminder < 12) {
              console.log(`⏭️  Recordatorio ya enviado recientemente para reserva ${booking._id}`);
              continue;
            }
          }
          
          // Preparar datos para el email
          const bookingData = {
            nombre: booking.nombre,
            email: booking.email,
            reservationNumber: booking.reservationNumber,
            serviceName: booking.serviceName,
            fecha: booking.fecha,
            hora: booking.hora,
            pasajeros: booking.pasajeros,
            total: booking.total || booking.calculatedPrice || 0,
            routeData: booking.routeData,
          };
          
          // Enviar email de recordatorio
          const emailResult = await emailService.sendBookingReminder(bookingData);
          
          if (emailResult.success) {
            // Marcar que se envió el recordatorio
            booking.lastReminderSent = now;
            await booking.save();
            
            remindersSent.push({
              bookingId: booking._id,
              email: booking.email,
              fecha: booking.fecha,
              hora: booking.hora,
            });
            
            console.log(`✅ Recordatorio enviado a ${booking.email} para reserva ${booking.reservationNumber || booking._id}`);
          } else {
            errors.push({
              bookingId: booking._id,
              email: booking.email,
              error: emailResult.error,
            });
            console.error(`❌ Error enviando recordatorio a ${booking.email}:`, emailResult.error);
          }
        }
      } catch (error) {
        console.error(`❌ Error procesando reserva ${booking._id}:`, error);
        errors.push({
          bookingId: booking._id,
          error: error.message,
        });
      }
    }
    
    // Resumen
    console.log('\n📊 Resumen de recordatorios:');
    console.log(`✅ Enviados: ${remindersSent.length}`);
    console.log(`❌ Errores: ${errors.length}`);
    
    if (remindersSent.length > 0) {
      console.log('\n📧 Recordatorios enviados:');
      remindersSent.forEach(r => {
        console.log(`   - ${r.email} (${r.fecha} ${r.hora})`);
      });
    }
    
    if (errors.length > 0) {
      console.log('\n❌ Errores:');
      errors.forEach(e => {
        console.log(`   - Reserva ${e.bookingId}: ${e.error}`);
      });
    }
    
    return {
      success: true,
      remindersSent: remindersSent.length,
      errors: errors.length,
    };
  } catch (error) {
    console.error('❌ Error en sendReminders:', error);
    throw error;
  }
};

// Ejecutar script
const main = async () => {
  try {
    await connectDB();
    const result = await sendReminders();
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando script:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { sendReminders, connectDB };
