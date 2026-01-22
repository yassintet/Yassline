// Test simple del servidor
require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json());

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

// Cargar rutas
console.log('Cargando circuitRoutes...');
const circuitRoutes = require('./routes/circuitRoutes');
console.log('circuitRoutes cargado:', typeof circuitRoutes);

// Registrar rutas
app.use('/api/circuits', circuitRoutes);
console.log('Rutas registradas');

// Iniciar servidor
const PORT = 4001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('\nPrueba estas URLs:');
  console.log(`  http://localhost:${PORT}/test`);
  console.log(`  http://localhost:${PORT}/api/circuits`);
  console.log('\nPresiona Ctrl+C para detener el servidor');
});
