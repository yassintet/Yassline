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

// Servir archivos estáticos (para la página de bienvenida)
app.use(express.static('public'));

// Ruta principal - Página HTML de bienvenida con estadísticas
app.get('/', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const dbName = mongoose.connection.db ? mongoose.connection.db.databaseName : 'N/A';
  
  // Obtener estadísticas de la base de datos si está conectada
  let stats = {
    circuits: 0,
    transports: 0,
    vehicles: 0,
    users: 0,
    contacts: 0
  };
  
  if (dbStatus === 'connected') {
    try {
      const Circuit = require('./models/Circuit');
      const Transport = require('./models/Transport');
      const Vehicle = require('./models/Vehicle');
      const User = require('./models/User');
      const Contact = require('./models/Contact');
      
      stats.circuits = await Circuit.countDocuments();
      stats.transports = await Transport.countDocuments();
      stats.vehicles = await Vehicle.countDocuments();
      stats.users = await User.countDocuments();
      stats.contacts = await Contact.countDocuments();
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error.message);
    }
  }
  
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yassline Tour API - Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            text-align: center;
        }
        .header h1 {
            color: #FF385C;
            font-size: 3em;
            margin-bottom: 10px;
        }
        .header p {
            color: #666;
            font-size: 1.2em;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
        }
        .card h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 1.5em;
            border-bottom: 2px solid #FF385C;
            padding-bottom: 10px;
        }
        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #eee;
        }
        .status-item:last-child {
            border-bottom: none;
        }
        .status-badge {
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }
        .status-connected {
            background: #d4edda;
            color: #155724;
        }
        .status-disconnected {
            background: #f8d7da;
            color: #721c24;
        }
        .status-running {
            background: #d1ecf1;
            color: #0c5460;
        }
        .endpoints-list {
            list-style: none;
        }
        .endpoints-list li {
            padding: 15px;
            margin: 10px 0;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid #FF385C;
            transition: background 0.3s ease;
        }
        .endpoints-list li:hover {
            background: #e9ecef;
        }
        .endpoint-method {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 5px;
            font-weight: bold;
            font-size: 0.85em;
            margin-right: 10px;
        }
        .method-get {
            background: #d4edda;
            color: #155724;
        }
        .method-post {
            background: #d1ecf1;
            color: #0c5460;
        }
        .method-put {
            background: #fff3cd;
            color: #856404;
        }
        .method-delete {
            background: #f8d7da;
            color: #721c24;
        }
        .endpoint-url {
            font-family: 'Courier New', monospace;
            color: #666;
            font-size: 1.1em;
        }
        .links {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        .link-btn {
            display: inline-block;
            padding: 12px 25px;
            background: #FF385C;
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            transition: background 0.3s ease;
        }
        .link-btn:hover {
            background: #E01E4F;
        }
        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            opacity: 0.9;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .stat-card {
            background: linear-gradient(135deg, #FF385C 0%, #E01E4F 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Yassline Tour API</h1>
            <p>El motor de Yassline Tour está en marcha</p>
        </div>

        <div class="status-grid">
            <div class="card">
                <h2>📊 Estado del Servidor</h2>
                <div class="status-item">
                    <span>Servidor:</span>
                    <span class="status-badge status-running">🟢 En ejecución</span>
                </div>
                <div class="status-item">
                    <span>Puerto:</span>
                    <span><strong>${PORT}</strong></span>
                </div>
                <div class="status-item">
                    <span>Entorno:</span>
                    <span><strong>${process.env.NODE_ENV || 'development'}</strong></span>
                </div>
            </div>

            <div class="card">
                <h2>🗄️ Base de Datos</h2>
                <div class="status-item">
                    <span>Estado:</span>
                    <span class="status-badge ${dbStatus === 'connected' ? 'status-connected' : 'status-disconnected'}">
                        ${dbStatus === 'connected' ? '🟢 Conectado' : '🔴 Desconectado'}
                    </span>
                </div>
                <div class="status-item">
                    <span>Base de datos:</span>
                    <span><strong>${dbName}</strong></span>
                </div>
                <div class="status-item">
                    <span>Host:</span>
                    <span><strong>${mongoose.connection.host || 'N/A'}</strong></span>
                </div>
            </div>

            <div class="card">
                <h2>📈 Estadísticas</h2>
                <div class="status-item">
                    <span>🛣️ Circuitos:</span>
                    <span><strong>${stats.circuits}</strong></span>
                </div>
                <div class="status-item">
                    <span>🚌 Transportes:</span>
                    <span><strong>${stats.transports}</strong></span>
                </div>
                <div class="status-item">
                    <span>🚗 Vehículos:</span>
                    <span><strong>${stats.vehicles}</strong></span>
                </div>
                <div class="status-item">
                    <span>👥 Usuarios:</span>
                    <span><strong>${stats.users}</strong></span>
                </div>
                <div class="status-item">
                    <span>📧 Contactos:</span>
                    <span><strong>${stats.contacts}</strong></span>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>🔗 Endpoints Disponibles</h2>
            <ul class="endpoints-list">
                <li>
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/auth/login</span>
                    <span style="color: #999; margin-left: 15px;">- Iniciar sesión</span>
                </li>
                <li>
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/auth/register</span>
                    <span style="color: #999; margin-left: 15px;">- Registro de usuario</span>
                </li>
                <li>
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/circuits</span>
                    <span style="color: #999; margin-left: 15px;">- Listar circuitos</span>
                </li>
                <li>
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/circuits/:id</span>
                    <span style="color: #999; margin-left: 15px;">- Obtener circuito</span>
                </li>
                <li>
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/circuits</span>
                    <span style="color: #999; margin-left: 15px;">- Crear circuito (Admin)</span>
                </li>
                <li>
                    <span class="endpoint-method method-put">PUT</span>
                    <span class="endpoint-url">/api/circuits/:id</span>
                    <span style="color: #999; margin-left: 15px;">- Actualizar circuito (Admin)</span>
                </li>
                <li>
                    <span class="endpoint-method method-delete">DELETE</span>
                    <span class="endpoint-url">/api/circuits/:id</span>
                    <span style="color: #999; margin-left: 15px;">- Eliminar circuito (Admin)</span>
                </li>
                <li>
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/transport</span>
                    <span style="color: #999; margin-left: 15px;">- Listar transportes</span>
                </li>
                <li>
                    <span class="endpoint-method method-get">GET</span>
                    <span class="endpoint-url">/api/vehicles</span>
                    <span style="color: #999; margin-left: 15px;">- Listar vehículos</span>
                </li>
                <li>
                    <span class="endpoint-method method-post">POST</span>
                    <span class="endpoint-url">/api/contact</span>
                    <span style="color: #999; margin-left: 15px;">- Enviar mensaje de contacto</span>
                </li>
            </ul>
            <div class="links">
                <a href="http://localhost:3000" class="link-btn" target="_blank">🌐 Frontend</a>
                <a href="/api/circuits" class="link-btn" target="_blank">📋 Ver JSON de Circuitos</a>
            </div>
        </div>

        <div class="footer">
            <p>Yassline Tour API v1.0.0 | Desarrollado con ❤️</p>
        </div>
    </div>
</body>
</html>
  `;
  
  res.send(html);
});

// Importar rutas
console.log('📦 Cargando rutas...');
try {
  console.log('📦 Importando authRoutes...');
  const authRoutes = require('./routes/authRoutes');
  console.log('✅ authRoutes importado');
  
  console.log('📦 Importando circuitRoutes...');
  const circuitRoutes = require('./routes/circuitRoutes');
  console.log('✅ circuitRoutes importado');
  
  console.log('📦 Importando transportRoutes...');
  const transportRoutes = require('./routes/transportRoutes');
  console.log('✅ transportRoutes importado');
  
  console.log('📦 Importando contactRoutes...');
  const contactRoutes = require('./routes/contactRoutes');
  console.log('✅ contactRoutes importado');
  
  console.log('📦 Importando vehicleRoutes...');
  const vehicleRoutes = require('./routes/vehicleRoutes');
  console.log('✅ vehicleRoutes importado');
  
  console.log('📦 Importando distanceRoutes...');
  const distanceRoutes = require('./routes/distanceRoutes');
  console.log('✅ distanceRoutes importado');
  
  console.log('📦 Importando bookingRoutes...');
  const bookingRoutes = require('./routes/bookingRoutes');
  console.log('✅ bookingRoutes importado');
  
  console.log('✅ Todas las rutas importadas correctamente');
  
  // Rutas de la API
  console.log('📦 Registrando rutas en Express...');
  app.use('/api/auth', authRoutes);
  console.log('✅ /api/auth registrado');
  
  app.use('/api/circuits', circuitRoutes);
  console.log('✅ /api/circuits registrado');
  
  app.use('/api/transport', transportRoutes);
  console.log('✅ /api/transport registrado');
  
  app.use('/api/contact', contactRoutes);
  console.log('✅ /api/contact registrado');
  
  app.use('/api/vehicles', vehicleRoutes);
  console.log('✅ /api/vehicles registrado');
  
  app.use('/api/distance', distanceRoutes);
  console.log('✅ /api/distance registrado');
  
  app.use('/api/bookings', bookingRoutes);
  console.log('✅ /api/bookings registrado');
  
  console.log('✅ Todas las rutas registradas en Express');
} catch (error) {
  console.error('❌ Error al cargar rutas:', error);
  console.error('Error message:', error.message);
  console.error('Error stack:', error.stack);
  console.error('Error name:', error.name);
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
      distance: '/api/distance',
      bookings: '/api/bookings',
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✅ Yassline Tour API está lista para recibir peticiones`);
});
