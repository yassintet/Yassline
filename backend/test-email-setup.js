/**
 * Script de verificación del sistema de email
 * Ejecutar con: node test-email-setup.js
 */

const path = require('path');
const fs = require('fs');

// Cargar .env manualmente para asegurar que se lea
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    }
  });
}

require('dotenv').config();

console.log('🔍 Verificando configuración del sistema de email...\n');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
const requiredVars = ['EMAIL_USER', 'EMAIL_PASS', 'ADMIN_EMAIL', 'COMPANY_EMAIL'];
const optionalVars = ['COMPANY_NAME', 'COMPANY_ADDRESS', 'COMPANY_PHONE'];

let allGood = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    const displayValue = varName === 'EMAIL_PASS' 
      ? '***' + value.slice(-4) 
      : value;
    console.log(`  ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`  ❌ ${varName}: NO CONFIGURADA`);
    allGood = false;
  }
});

optionalVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: ${process.env[varName]}`);
  } else {
    console.log(`  ⚠️  ${varName}: No configurada (usará valor por defecto)`);
  }
});

// Verificar módulos
console.log('\n📦 Verificando módulos:');
try {
  const nodemailer = require('nodemailer');
  console.log(`  ✅ nodemailer: ${nodemailer.version || 'instalado'}`);
} catch (e) {
  console.log(`  ❌ nodemailer: NO INSTALADO`);
  allGood = false;
}

try {
  const PDFDocument = require('pdfkit');
  console.log(`  ✅ pdfkit: instalado`);
} catch (e) {
  console.log(`  ❌ pdfkit: NO INSTALADO`);
  allGood = false;
}

// Verificar servicios
console.log('\n🔧 Verificando servicios:');
try {
  const emailService = require('./services/emailService');
  console.log(`  ✅ emailService.js: Cargado correctamente`);
} catch (e) {
  console.log(`  ❌ emailService.js: Error al cargar - ${e.message}`);
  allGood = false;
}

try {
  const invoiceService = require('./services/invoiceService');
  console.log(`  ✅ invoiceService.js: Cargado correctamente`);
} catch (e) {
  console.log(`  ❌ invoiceService.js: Error al cargar - ${e.message}`);
  allGood = false;
}

// Verificar modelos
console.log('\n📊 Verificando modelos:');
try {
  const Booking = require('./models/Booking');
  console.log(`  ✅ Booking.js: Modelo cargado correctamente`);
} catch (e) {
  console.log(`  ❌ Booking.js: Error al cargar - ${e.message}`);
  allGood = false;
}

// Verificar controladores
console.log('\n🎮 Verificando controladores:');
try {
  const bookingController = require('./controllers/bookingController');
  console.log(`  ✅ bookingController.js: Cargado correctamente`);
} catch (e) {
  console.log(`  ❌ bookingController.js: Error al cargar - ${e.message}`);
  allGood = false;
}

try {
  const contactController = require('./controllers/contactController');
  console.log(`  ✅ contactController.js: Cargado correctamente`);
} catch (e) {
  console.log(`  ❌ contactController.js: Error al cargar - ${e.message}`);
  allGood = false;
}

// Verificar rutas
console.log('\n🛣️  Verificando rutas:');
try {
  const bookingRoutes = require('./routes/bookingRoutes');
  console.log(`  ✅ bookingRoutes.js: Cargado correctamente`);
} catch (e) {
  console.log(`  ❌ bookingRoutes.js: Error al cargar - ${e.message}`);
  allGood = false;
}

// Resumen
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ ¡Todo está correctamente configurado!');
  console.log('\n📧 El sistema de email está listo para usar.');
  console.log('\n💡 Próximos pasos:');
  console.log('   1. Reinicia el servidor: npm run dev');
  console.log('   2. Prueba enviando un mensaje desde /contacto');
  console.log('   3. Prueba creando una reserva desde cualquier servicio');
} else {
  console.log('❌ Hay problemas en la configuración.');
  console.log('   Por favor, revisa los errores arriba.');
}
console.log('='.repeat(50));
