require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Configurar DNS alternativo para resolver SRV
dns.setServers(['8.8.8.8', '1.1.1.1']);

console.log('🧪 Test de Conexión a MongoDB\n');
console.log('='.repeat(50));

// Verificar que MONGO_URI esté configurado
if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
  console.error('❌ MONGO_URI no está configurado en .env');
  console.log('\n💡 Agrega MONGO_URI en backend/.env:');
  console.log('   MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database');
  process.exit(1);
}

// Mostrar URI (ocultando contraseña)
const uriDisplay = process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@');
console.log('📍 URI:', uriDisplay);
console.log('');

// Validar formato
if (!process.env.MONGO_URI.includes('mongodb')) {
  console.error('❌ Formato incorrecto. Debe comenzar con mongodb:// o mongodb+srv://');
  process.exit(1);
}

// Intentar conectar
console.log('🔄 Intentando conectar...\n');

const options = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  w: 'majority',
  retryReads: true,
  // Intentar conexión directa si es posible
  directConnection: false,
  readPreference: 'primary',
  // Aumentar timeouts adicionales
  heartbeatFrequencyMS: 10000
  // serverSelectionRetryDelayMS no es soportado en esta versión de mongoose
};

console.log('\n🔧 Opciones de conexión:');
console.log('   Timeout:', options.serverSelectionTimeoutMS, 'ms');
console.log('');

mongoose.connect(process.env.MONGO_URI, options)
  .then(() => {
    console.log('✅ ¡Conexión exitosa!');
    console.log('');
    console.log('📊 Información de la conexión:');
    console.log('   Base de datos:', mongoose.connection.db.databaseName);
    console.log('   Host:', mongoose.connection.host);
    console.log('   Puerto:', mongoose.connection.port || 'N/A (SRV)');
    console.log('   Estado:', mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado');
    console.log('');
    console.log('🎉 MongoDB está funcionando correctamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error de conexión:\n');
    console.error('   Tipo:', error.name);
    console.error('   Mensaje:', error.message);
    console.error('');
    
    // Diagnóstico específico
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('🔍 Diagnóstico:');
      console.error('   1. Verifica que el cluster esté ACTIVO en MongoDB Atlas');
      console.error('   2. Ve a Network Access → IP Access List');
      console.error('   3. Agrega 0.0.0.0/0 (Allow Access from Anywhere)');
      console.error('   4. Espera 1-2 minutos después de agregar la IP');
    } else if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('🔍 Diagnóstico:');
      console.error('   1. Verifica usuario y contraseña en Database Access');
      console.error('   2. Si la contraseña tiene @, #, $, etc., URL-encodéalos');
      console.error('   3. Ejemplo: @ → %40, # → %23');
    } else if (error.message.includes('timeout')) {
      console.error('🔍 Diagnóstico:');
      console.error('   1. Verifica que el cluster esté activo (no pausado)');
      console.error('   2. Verifica la whitelist de IPs');
      console.error('   3. Verifica tu conexión a internet');
    }
    
    console.error('');
    console.error('📝 Formato correcto:');
    console.error('   mongodb+srv://usuario:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
    
    process.exit(1);
  });
