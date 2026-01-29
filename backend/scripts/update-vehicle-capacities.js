require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const Vehicle = require('../models/Vehicle');

// Configurar DNS alternativo para resolver SRV (Google DNS y Cloudflare)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const updateCapacities = async () => {
  try {
    // Conectar a MongoDB
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI no configurado en .env');
      process.exit(1);
    }

    console.log('🔄 Intentando conectar a MongoDB...');
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ Conectado a MongoDB');

    // Actualizar Vito a 7 pasajeros
    const vitoResult = await Vehicle.updateMany(
      { type: 'vito' },
      { $set: { 'capacity.passengers': 7 } }
    );
    console.log(`✅ Vito actualizado: ${vitoResult.modifiedCount} vehículo(s) actualizado(s) a 7 pasajeros`);

    // Actualizar V-Class a 6 pasajeros
    const vclassResult = await Vehicle.updateMany(
      { type: 'v-class' },
      { $set: { 'capacity.passengers': 6 } }
    );
    console.log(`✅ V-Class actualizado: ${vclassResult.modifiedCount} vehículo(s) actualizado(s) a 6 pasajeros`);

    // Actualizar Sprinter a 18 pasajeros
    const sprinterResult = await Vehicle.updateMany(
      { type: 'sprinter' },
      { $set: { 'capacity.passengers': 18 } }
    );
    console.log(`✅ Sprinter actualizado: ${sprinterResult.modifiedCount} vehículo(s) actualizado(s) a 18 pasajeros`);

    // Verificar los cambios
    const vehicles = await Vehicle.find({ type: { $in: ['vito', 'v-class', 'sprinter'] } });
    console.log('\n📊 Capacidades actualizadas:');
    vehicles.forEach(v => {
      console.log(`  - ${v.name} (${v.type}): ${v.capacity.passengers} pasajeros`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Actualización completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateCapacities();
