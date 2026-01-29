require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Configurar DNS alternativo
dns.setServers(['8.8.8.8', '1.1.1.1']);

const Vehicle = require('../models/Vehicle');

const updateSprinterImage = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };
    
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ Conectado a MongoDB');
    
    // Buscar y actualizar la imagen del Sprinter
    const result = await Vehicle.updateMany(
      { type: 'sprinter' },
      {
        $set: {
          image: '/img/sprinter (4).jpg'
        }
      }
    );
    
    if (result.matchedCount > 0) {
      console.log(`✅ Sprinter actualizado: ${result.modifiedCount} vehículo(s) actualizado(s) con la nueva imagen`);
    } else {
      console.log('⚠️  No se encontró ningún vehículo Sprinter');
    }
    
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar:', error);
    process.exit(1);
  }
};

updateSprinterImage();
