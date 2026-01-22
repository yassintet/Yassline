require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');

// Configurar DNS alternativo para resolver SRV (Google DNS y Cloudflare)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
// CORS configurado para permitir el frontend en producción
const allowedOrigins = [
  'http://localhost:3000',
  'https://yassline.com',
  'https://www.yassline.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de depuración para ver todas las peticiones
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  next();
});

// Conexión a MongoDB
const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
    console.log('⚠️  MONGO_URI no configurado. El servidor funcionará sin base de datos.');
    console.log('💡 Agrega MONGO_URI en el archivo .env o en las variables de entorno');
    return;
  }

  // Validar formato básico de la URI
  if (!process.env.MONGO_URI.includes('mongodb')) {
    console.error('❌ MONGO_URI no tiene el formato correcto. Debe comenzar con mongodb:// o mongodb+srv://');
    return;
  }

  console.log('🔄 Intentando conectar a MongoDB...');
  console.log('📍 URI:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@')); // Ocultar contraseña en logs

  try {
    const options = {
      // Opciones de conexión mejoradas
      serverSelectionTimeoutMS: 30000, // Timeout de 30 segundos
      socketTimeoutMS: 45000, // Timeout de socket
      connectTimeoutMS: 30000, // Timeout de conexión
      maxPoolSize: 10, // Mantener hasta 10 conexiones
      retryWrites: true,
      w: 'majority',
      // Opciones adicionales para mejorar la conexión
      heartbeatFrequencyMS: 10000,
      retryReads: true,
      // Opciones específicas para Replica Set
      directConnection: false,
      readPreference: 'primary'
    };
    
    console.log('🔗 Intentando conectar con opciones:', JSON.stringify(options, null, 2));
    await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log('✅ MongoDB Conectado exitosamente');
    console.log('📊 Base de datos:', mongoose.connection.db.databaseName);
    console.log('🔗 Host:', mongoose.connection.host);
    
    // Event listeners para monitorear la conexión
    mongoose.connection.on('error', (err) => {
      console.error('❌ Error de MongoDB:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB desconectado. Intentando reconectar...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconectado exitosamente');
    });
    
  } catch (error) {
    console.error('\n❌ Error al conectar a MongoDB:');
    console.error('   Mensaje:', error.message);
    
    // Diagnóstico específico según el tipo de error
    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('\n🔍 Diagnóstico:');
      console.error('   1. Verifica que el cluster esté ACTIVO (no pausado) en MongoDB Atlas');
      console.error('   2. Verifica la whitelist de IPs en Network Access');
      console.error('      → Agrega 0.0.0.0/0 para permitir todas las IPs (desarrollo)');
      console.error('   3. Verifica el formato de la URL');
    } else if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('\n🔍 Diagnóstico:');
      console.error('   1. Verifica que el usuario y contraseña sean correctos');
      console.error('   2. Si la contraseña tiene caracteres especiales, URL-encodéalos:');
      console.error('      @ → %40, # → %23, $ → %24, etc.');
      console.error('   3. Verifica que el usuario tenga permisos en Database Access');
    } else if (error.message.includes('timeout') || error.message.includes('timed out')) {
      console.error('\n🔍 Diagnóstico:');
      console.error('   1. Verifica que el cluster esté activo');
      console.error('   2. Verifica la whitelist de IPs');
      console.error('   3. Verifica tu conexión a internet');
      console.error('   4. Intenta aumentar el timeout en las opciones de conexión');
    }
    
    console.error('\n📝 Formato correcto de MONGO_URI:');
    console.error('   mongodb+srv://usuario:password@cluster.mongodb.net/nombre-database?retryWrites=true&w=majority');
    console.error('\n⚠️  El servidor continuará funcionando sin base de datos.');
  }
};

// Conectar a la base de datos
connectDB();

// Ruta principal (debe estar antes de las rutas de API)
app.get('/', (req, res) => {
  res.json({ 
    message: '¡El motor de Yassline Tour está en marcha!',
    endpoints: {
      auth: '/api/auth',
      circuits: '/api/circuits',
      transport: '/api/transport',
      contact: '/api/contact',
      vehicles: '/api/vehicles',
    }
  });
});

// Importar rutas
console.log('📦 Cargando rutas...');
try {
  const authRoutes = require('./routes/authRoutes');
  const circuitRoutes = require('./routes/circuitRoutes');
  const transportRoutes = require('./routes/transportRoutes');
  const contactRoutes = require('./routes/contactRoutes');
  const vehicleRoutes = require('./routes/vehicleRoutes');
  
  console.log('✅ Rutas importadas correctamente');
  
  // Rutas de la API
  app.use('/api/auth', authRoutes);
  app.use('/api/circuits', circuitRoutes);
  app.use('/api/transport', transportRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  
  console.log('✅ Rutas registradas en Express');
} catch (error) {
  console.error('❌ Error al cargar rutas:', error);
  console.error(error.stack);
  process.exit(1);
}

// Middleware para manejar rutas no encontradas (404) - DEBE estar al final
app.use((req, res, next) => {
  console.log(`⚠️  Ruta no encontrada: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
    availableEndpoints: {
      auth: '/api/auth',
      circuits: '/api/circuits',
      transport: '/api/transport',
      contact: '/api/contact',
      vehicles: '/api/vehicles',
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✅ Yassline Tour API está lista para recibir peticiones`);
});
