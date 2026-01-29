require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Configurar DNS alternativo
dns.setServers(['8.8.8.8', '1.1.1.1']);

const Vehicle = require('../models/Vehicle');

const updateSprinter = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };
    
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ Conectado a MongoDB');
    
    // Buscar y actualizar el Sprinter
    const result = await Vehicle.updateOne(
      { name: 'Mercedes Sprinter' },
      {
        $set: {
          'capacity.passengers': 18
        }
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Sprinter actualizado: ahora tiene 18 plazas');
    } else {
      console.log('⚠️  No se encontró el vehículo Sprinter');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar:', error);
    process.exit(1);
  }
};

updateSprinter();
