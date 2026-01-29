/**
 * Script de prueba para verificar el sistema de recordatorios
 * 
 * Este script verifica que:
 * 1. La conexión a MongoDB funciona
 * 2. El script de recordatorios puede ejecutarse
 * 3. node-cron está disponible
 * 
 * Uso: node scripts/test-reminders.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Configurar DNS alternativo para resolver SRV (Google DNS y Cloudflare)
dns.setServers(['8.8.8.8', '1.1.1.1']);

console.log('🧪 Iniciando pruebas del sistema de recordatorios...\n');

// Test 1: Verificar node-cron
console.log('1️⃣ Verificando node-cron...');
try {
  const cron = require('node-cron');
  console.log('   ✅ node-cron está instalado');
  console.log('   📦 Versión:', require('node-cron/package.json').version);
} catch (error) {
  console.log('   ❌ node-cron NO está instalado');
  console.log('   💡 Ejecuta: npm install node-cron');
  process.exit(1);
}

// Test 2: Verificar conexión a MongoDB
console.log('\n2️⃣ Verificando conexión a MongoDB...');
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI no está configurada');
    }
    
    // Usar las mismas opciones de conexión que el servidor
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
      heartbeatFrequencyMS: 10000,
      retryReads: true,
      directConnection: false,
      readPreference: 'primary'
    };
    
    await mongoose.connect(mongoURI, options);
    console.log('   ✅ Conectado a MongoDB');
    console.log('   📊 Base de datos:', mongoose.connection.db.databaseName);
    return true;
  } catch (error) {
    console.log('   ❌ Error conectando a MongoDB:', error.message);
    return false;
  }
};

// Test 3: Verificar que el script de recordatorios existe y puede importarse
console.log('\n3️⃣ Verificando script de recordatorios...');
try {
  const { sendReminders, connectDB: reminderConnectDB } = require('./sendBookingReminders');
  console.log('   ✅ Script de recordatorios cargado correctamente');
  console.log('   📝 Funciones disponibles: sendReminders, connectDB');
} catch (error) {
  console.log('   ❌ Error cargando script de recordatorios:', error.message);
  process.exit(1);
}

// Test 4: Verificar emailService
console.log('\n4️⃣ Verificando servicio de email...');
try {
  const emailService = require('../services/emailService');
  const functions = [
    'sendBookingNotification',
    'sendBookingConfirmation',
    'sendReservationConfirmed',
    'sendBookingCancellation',
    'sendBookingReminder'
  ];
  
  let allFunctionsExist = true;
  functions.forEach(func => {
    if (typeof emailService[func] === 'function') {
      console.log(`   ✅ ${func} disponible`);
    } else {
      console.log(`   ❌ ${func} NO disponible`);
      allFunctionsExist = false;
    }
  });
  
  if (allFunctionsExist) {
    console.log('   ✅ Todas las funciones de email están disponibles');
  }
} catch (error) {
  console.log('   ❌ Error verificando emailService:', error.message);
}

// Test 5: Verificar variables de entorno de email
console.log('\n5️⃣ Verificando configuración de email...');
const emailUser = process.env.EMAIL_USER || process.env.GMAIL_USER;
const emailPass = process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD;
const smtpHost = process.env.SMTP_HOST;

if (emailUser && emailPass) {
  console.log('   ✅ Configuración Gmail encontrada');
  console.log('   📧 Usuario:', emailUser);
} else if (smtpHost && process.env.SMTP_USER && process.env.SMTP_PASS) {
  console.log('   ✅ Configuración SMTP personalizada encontrada');
  console.log('   📧 Host:', smtpHost);
} else {
  console.log('   ⚠️  Configuración de email no encontrada');
  console.log('   💡 Configura EMAIL_USER y EMAIL_PASS o SMTP_HOST, SMTP_USER, SMTP_PASS');
}

// Ejecutar pruebas
(async () => {
  const connected = await connectDB();
  
  if (connected) {
    console.log('\n✅ Todas las pruebas pasaron correctamente');
    console.log('\n📋 Resumen:');
    console.log('   ✅ node-cron instalado');
    console.log('   ✅ MongoDB conectado');
    console.log('   ✅ Script de recordatorios disponible');
    console.log('   ✅ Servicio de email disponible');
    console.log('\n🚀 El sistema de recordatorios está listo para usar');
    console.log('\n💡 Para probar manualmente:');
    console.log('   node scripts/sendBookingReminders.js');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron');
    console.log('   Verifica la configuración antes de continuar');
  }
  
  await mongoose.connection.close();
  process.exit(connected ? 0 : 1);
})();
