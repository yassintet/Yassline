require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔬 Test Avanzado de Conexión MongoDB\n');
console.log('='.repeat(60));

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI no configurado');
  process.exit(1);
}

const uri = process.env.MONGO_URI;
console.log('📍 URI:', uri.replace(/:[^:@]+@/, ':****@'));
console.log('');

// Probar diferentes configuraciones
const configs = [
  {
    name: 'Configuración Mínima',
    options: {
      serverSelectionTimeoutMS: 10000
    }
  },
  {
    name: 'Sin SSL (si es formato estándar)',
    options: {
      serverSelectionTimeoutMS: 10000,
      ssl: false
    }
  },
  {
    name: 'Con SSL explícito',
    options: {
      serverSelectionTimeoutMS: 10000,
      ssl: true,
      sslValidate: true
    }
  },
  {
    name: 'Conexión Directa (sin replica set)',
    options: {
      serverSelectionTimeoutMS: 10000,
      directConnection: true
    }
  },
  {
    name: 'Configuración Completa',
    options: {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      w: 'majority',
      retryReads: true,
      readPreference: 'primary'
    }
  }
];

async function testConnection(config) {
  console.log(`\n🔄 Probando: ${config.name}`);
  console.log('   Opciones:', JSON.stringify(config.options, null, 2));
  
  try {
    // Cerrar cualquier conexión previa
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    await mongoose.connect(uri, config.options);
    
    console.log(`✅ ${config.name}: ¡ÉXITO!`);
    console.log('   Base de datos:', mongoose.connection.db.databaseName);
    console.log('   Host:', mongoose.connection.host);
    
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log(`❌ ${config.name}: FALLO`);
    console.log('   Error:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    return false;
  }
}

async function runTests() {
  for (const config of configs) {
    const success = await testConnection(config);
    if (success) {
      console.log('\n🎉 ¡Conexión exitosa!');
      console.log(`✅ La configuración que funciona es: ${config.name}`);
      process.exit(0);
    }
    // Esperar un poco entre intentos
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n❌ Todas las configuraciones fallaron');
  console.log('\n💡 Posibles soluciones:');
  console.log('   1. Verifica en MongoDB Atlas → Network Access');
  console.log('      - Asegúrate de que 0.0.0.0/0 esté "Active"');
  console.log('      - Intenta eliminar y volver a agregar la IP\n');
  console.log('   2. Verifica el firewall de Windows');
  console.log('      - Desactiva temporalmente el firewall');
  console.log('      - O agrega excepción para Node.js\n');
  console.log('   3. Verifica el antivirus');
  console.log('      - Desactiva temporalmente\n');
  console.log('   4. Prueba desde otra red');
  console.log('      - Usa tu móvil como hotspot\n');
  console.log('   5. Verifica la URI de conexión');
  console.log('      - Asegúrate de que el usuario y contraseña sean correctos');
  console.log('      - Verifica en Database Access que el usuario esté "Active"\n');
  
  process.exit(1);
}

runTests();
