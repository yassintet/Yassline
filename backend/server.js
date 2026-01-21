require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

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

// Conexión a MongoDB
const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
    console.log('⚠️  MONGO_URI no configurado. El servidor funcionará sin base de datos.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Opciones de conexión mejoradas
      serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
      socketTimeoutMS: 45000, // Timeout de socket
    });
    console.log('✅ MongoDB Conectado exitosamente');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    console.log('💡 Verifica:');
    console.log('   1. Que MONGO_URI tenga el formato correcto: mongodb+srv://usuario:password@cluster.mongodb.net/database');
    console.log('   2. Que tu IP esté en la whitelist de MongoDB Atlas');
    console.log('   3. Que el usuario y contraseña sean correctos');
    console.log('   4. Que el cluster esté activo en MongoDB Atlas');
    console.log('⚠️  El servidor continuará funcionando sin base de datos.');
  }
};

// Conectar a la base de datos
connectDB();

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: '¡El motor de Yassline Tour está en marcha!' 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✅ Yassline Tour API está lista para recibir peticiones`);
});
