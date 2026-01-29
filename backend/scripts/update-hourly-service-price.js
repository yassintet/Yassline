require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');
const Transport = require('../models/Transport');

// Configurar DNS alternativo para resolver SRV (Google DNS y Cloudflare)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const updateHourlyServicePrice = async () => {
  try {
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

    // Actualizar el servicio por horas
    const result = await Transport.updateOne(
      { type: 'hourly' },
      { 
        $set: { 
          priceLabel: 'Desde 187 dirhams la hora',
          price: 187.5
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.log('⚠️ No se encontró ningún servicio por horas en la base de datos');
    } else {
      console.log(`✅ Servicio por horas actualizado: ${result.modifiedCount} servicio(s) modificado(s)`);
      console.log('   - priceLabel: "Desde 187 dirhams la hora"');
      console.log('   - price: 187.5');
    }

    // Verificar el resultado
    const updatedService = await Transport.findOne({ type: 'hourly' });
    if (updatedService) {
      console.log('\n📊 Servicio actualizado:');
      console.log(`   - Nombre: ${updatedService.name}`);
      console.log(`   - Tipo: ${updatedService.type}`);
      console.log(`   - Price Label: ${updatedService.priceLabel}`);
      console.log(`   - Precio: ${updatedService.price}`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Actualización completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateHourlyServicePrice();
