/**
 * Script simple para verificar configuración de email
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del sistema de email...\n');

// Leer .env directamente
const envPath = path.join(__dirname, '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        let value = trimmedLine.substring(equalIndex + 1).trim();
        // Remover comillas si las tiene
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        envVars[key] = value;
      }
    }
  });
}

console.log('📋 Variables de entorno encontradas en .env:');
const requiredVars = ['EMAIL_USER', 'EMAIL_PASS', 'ADMIN_EMAIL', 'COMPANY_EMAIL'];
const optionalVars = ['COMPANY_NAME', 'COMPANY_ADDRESS', 'COMPANY_PHONE'];

let allGood = true;

requiredVars.forEach(varName => {
  if (envVars[varName]) {
    const displayValue = varName === 'EMAIL_PASS' 
      ? '***' + envVars[varName].slice(-4) 
      : envVars[varName];
    console.log(`  ✅ ${varName}: ${displayValue}`);
  } else {
    console.log(`  ❌ ${varName}: NO ENCONTRADA en .env`);
    allGood = false;
  }
});

optionalVars.forEach(varName => {
  if (envVars[varName]) {
    console.log(`  ✅ ${varName}: ${envVars[varName]}`);
  } else {
    console.log(`  ⚠️  ${varName}: No configurada (usará valor por defecto)`);
  }
});

// Verificar módulos instalados
console.log('\n📦 Verificando módulos instalados:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const deps = packageJson.dependencies || {};
  
  if (deps.nodemailer) {
    console.log(`  ✅ nodemailer: ${deps.nodemailer}`);
  } else {
    console.log(`  ❌ nodemailer: NO INSTALADO`);
    allGood = false;
  }
  
  if (deps.pdfkit) {
    console.log(`  ✅ pdfkit: ${deps.pdfkit}`);
  } else {
    console.log(`  ❌ pdfkit: NO INSTALADO`);
    allGood = false;
  }
} catch (e) {
  console.log(`  ❌ Error leyendo package.json: ${e.message}`);
}

// Verificar archivos del sistema
console.log('\n📁 Verificando archivos del sistema:');
const filesToCheck = [
  'services/emailService.js',
  'services/invoiceService.js',
  'models/Booking.js',
  'controllers/bookingController.js',
  'controllers/contactController.js',
  'routes/bookingRoutes.js',
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file}: NO ENCONTRADO`);
    allGood = false;
  }
});

// Resumen
console.log('\n' + '='.repeat(60));
if (allGood) {
  console.log('✅ ¡Todo está correctamente configurado!');
  console.log('\n📧 El sistema de email está listo para usar.');
  console.log('\n💡 Próximos pasos:');
  console.log('   1. Reinicia el servidor: npm run dev');
  console.log('   2. Prueba enviando un mensaje desde /contacto');
  console.log('   3. Prueba creando una reserva desde cualquier servicio');
  console.log('\n⚠️  Nota: Las variables de entorno se cargarán cuando');
  console.log('   reinicies el servidor. El servidor debe estar corriendo');
  console.log('   para que dotenv cargue el archivo .env correctamente.');
} else {
  console.log('❌ Hay problemas en la configuración.');
  console.log('   Por favor, revisa los errores arriba.');
}
console.log('='.repeat(60));
