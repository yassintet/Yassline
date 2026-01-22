// Script de depuración para verificar las rutas
require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

console.log('\n=== DIAGNÓSTICO DE RUTAS ===\n');

// Probar cargar cada ruta
const routesToTest = [
  { name: 'authRoutes', path: './routes/authRoutes' },
  { name: 'circuitRoutes', path: './routes/circuitRoutes' },
  { name: 'transportRoutes', path: './routes/transportRoutes' },
  { name: 'contactRoutes', path: './routes/contactRoutes' },
  { name: 'vehicleRoutes', path: './routes/vehicleRoutes' },
];

routesToTest.forEach(({ name, path }) => {
  try {
    const routes = require(path);
    console.log(`✅ ${name}:`);
    console.log(`   Tipo: ${typeof routes}`);
    console.log(`   Es función: ${typeof routes === 'function'}`);
    if (routes.stack) {
      console.log(`   Rutas registradas: ${routes.stack.length}`);
      routes.stack.forEach((layer, index) => {
        if (layer.route) {
          const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
          console.log(`     ${index + 1}. ${methods} ${layer.route.path}`);
        }
      });
    }
    console.log('');
  } catch (error) {
    console.error(`❌ ${name}: Error al cargar`);
    console.error(`   ${error.message}`);
    console.error(`   ${error.stack}\n`);
  }
});

// Probar registrar las rutas
console.log('\n=== REGISTRANDO RUTAS EN EXPRESS ===\n');
try {
  const authRoutes = require('./routes/authRoutes');
  const circuitRoutes = require('./routes/circuitRoutes');
  const transportRoutes = require('./routes/transportRoutes');
  const contactRoutes = require('./routes/contactRoutes');
  const vehicleRoutes = require('./routes/vehicleRoutes');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/circuits', circuitRoutes);
  app.use('/api/transport', transportRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  
  console.log('✅ Todas las rutas registradas correctamente\n');
  
  // Mostrar todas las rutas registradas en Express
  console.log('=== RUTAS REGISTRADAS EN EXPRESS ===\n');
  app._router.stack.forEach((middleware, index) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
      console.log(`${index + 1}. ${methods} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      console.log(`${index + 1}. Router montado en: ${middleware.regexp}`);
      if (middleware.handle && middleware.handle.stack) {
        middleware.handle.stack.forEach((layer, subIndex) => {
          if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            console.log(`   ${subIndex + 1}. ${methods} ${layer.route.path}`);
          }
        });
      }
    }
  });
  
} catch (error) {
  console.error('❌ Error al registrar rutas:');
  console.error(error.message);
  console.error(error.stack);
}

console.log('\n=== FIN DEL DIAGNÓSTICO ===\n');
