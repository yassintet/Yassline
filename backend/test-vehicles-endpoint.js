// Script rápido para probar el endpoint de vehículos
require('dotenv').config();
const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:4000';

console.log('🧪 Probando endpoint de vehículos...');
console.log('📍 URL:', `${API_URL}/api/vehicles`);
console.log('');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/vehicles',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  console.log(`📡 Status: ${res.statusCode} ${res.statusMessage}`);
  console.log(`📋 Headers:`, res.headers);
  console.log('');

  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ Respuesta recibida:');
      console.log(JSON.stringify(json, null, 2));
      console.log('');
      
      if (json.success && json.data) {
        console.log(`✅ Vehículos encontrados: ${json.data.length}`);
        json.data.forEach((v, i) => {
          console.log(`   ${i + 1}. ${v.name} (${v.type}) - Activo: ${v.active}`);
        });
      } else {
        console.log('❌ Error en la respuesta:', json.error || json.message);
      }
    } catch (err) {
      console.error('❌ Error parseando JSON:', err.message);
      console.log('📄 Respuesta raw:', data.substring(0, 500));
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Error de conexión:', err.message);
  console.log('');
  console.log('💡 Verifica que:');
  console.log('   1. El backend esté corriendo (npm run dev)');
  console.log('   2. El puerto 4000 esté disponible');
  console.log('   3. No haya errores en la consola del backend');
});

req.end();
