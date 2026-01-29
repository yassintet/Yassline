require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const Vehicle = require('../models/Vehicle');

// Configurar DNS alternativo para resolver SRV (Google DNS y Cloudflare)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const updateLuggageCapacities = async () => {
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

    // Actualizar Sprinter a 15 maletas
    const sprinterResult = await Vehicle.updateMany(
      { type: 'sprinter' },
      { $set: { 'capacity.luggage': '15 maletas grandes' } }
    );
    console.log(`✅ Sprinter actualizado: ${sprinterResult.modifiedCount} vehículo(s) actualizado(s) a 15 maletas grandes`);

    // Actualizar Vito a 8 maletas
    const vitoResult = await Vehicle.updateMany(
      { type: 'vito' },
      { $set: { 'capacity.luggage': '8 maletas grandes' } }
    );
    console.log(`✅ Vito actualizado: ${vitoResult.modifiedCount} vehículo(s) actualizado(s) a 8 maletas grandes`);

    // Actualizar V-Class a 5 maletas
    const vclassResult = await Vehicle.updateMany(
      { type: 'v-class' },
      { $set: { 'capacity.luggage': '5 maletas grandes' } }
    );
    console.log(`✅ V-Class actualizado: ${vclassResult.modifiedCount} vehículo(s) actualizado(s) a 5 maletas grandes`);

    // Verificar los cambios
    const vehicles = await Vehicle.find({ type: { $in: ['vito', 'v-class', 'sprinter'] } });
    console.log('\n📊 Capacidades de maletas actualizadas:');
    vehicles.forEach(v => {
      console.log(`  - ${v.name} (${v.type}): ${v.capacity.passengers} pasajeros, ${v.capacity.luggage || 'Sin especificar'}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Actualización completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateLuggageCapacities();
