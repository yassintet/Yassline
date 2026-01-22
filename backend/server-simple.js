// Versión simplificada para probar
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware básico
app.use(cors());
app.use(express.json());

// Middleware de depuración
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: '¡El motor de Yassline Tour está en marcha!',
    endpoints: {
      circuits: '/api/circuits',
    }
  });
});

// Cargar y registrar rutas de circuitos
console.log('Cargando circuitRoutes...');
try {
  const circuitRoutes = require('./routes/circuitRoutes');
  console.log('circuitRoutes cargado exitosamente');
  
  app.use('/api/circuits', circuitRoutes);
  console.log('Ruta /api/circuits registrada');
  
  // Verificar que las rutas estén registradas
  console.log('\nRutas registradas en circuitRoutes:');
  if (circuitRoutes.stack) {
    circuitRoutes.stack.forEach((layer, index) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
        console.log(`  ${index + 1}. ${methods} ${layer.route.path}`);
      }
    });
  }
} catch (error) {
  console.error('Error al cargar circuitRoutes:', error);
  process.exit(1);
}

// Middleware 404
app.use((req, res) => {
  console.log(`⚠️  404 - Ruta no encontrada: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✅ Prueba: http://localhost:${PORT}/api/circuits\n`);
});
