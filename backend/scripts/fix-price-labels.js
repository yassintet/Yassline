require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

// Configurar DNS alternativo
dns.setServers(['8.8.8.8', '1.1.1.1']);

const Transport = require('../models/Transport');
const Circuit = require('../models/Circuit');

async function fixPriceLabels() {
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

    // Corregir priceLabel en Transportes
    console.log('\n🔧 Corrigiendo priceLabel en Transportes...');
    const transports = await Transport.find({});
    let transportFixed = 0;

    for (const transport of transports) {
      let updated = false;
      let newPriceLabel = transport.priceLabel;

      // Reemplazar "common.from" con "Desde"
      if (transport.priceLabel && transport.priceLabel.includes('common.from')) {
        newPriceLabel = transport.priceLabel.replace(/common\.from/gi, 'Desde');
        updated = true;
      }

      // También corregir si contiene solo "common.from" al inicio
      if (transport.priceLabel && /^common\.from\s*/i.test(transport.priceLabel)) {
        newPriceLabel = transport.priceLabel.replace(/^common\.from\s*/i, 'Desde ');
        updated = true;
      }

      if (updated) {
        await Transport.updateOne(
          { _id: transport._id },
          { $set: { priceLabel: newPriceLabel } }
        );
        console.log(`  ✅ Transporte "${transport.name}": "${transport.priceLabel}" → "${newPriceLabel}"`);
        transportFixed++;
      }
    }

    // Corregir priceLabel en Circuitos
    console.log('\n🔧 Corrigiendo priceLabel en Circuitos...');
    const circuits = await Circuit.find({});
    let circuitFixed = 0;

    for (const circuit of circuits) {
      let updated = false;
      let newPriceLabel = circuit.priceLabel;

      // Reemplazar "common.from" con "Desde"
      if (circuit.priceLabel && circuit.priceLabel.includes('common.from')) {
        newPriceLabel = circuit.priceLabel.replace(/common\.from/gi, 'Desde');
        updated = true;
      }

      // También corregir si contiene solo "common.from" al inicio
      if (circuit.priceLabel && /^common\.from\s*/i.test(circuit.priceLabel)) {
        newPriceLabel = circuit.priceLabel.replace(/^common\.from\s*/i, 'Desde ');
        updated = true;
      }

      if (updated) {
        await Circuit.updateOne(
          { _id: circuit._id },
          { $set: { priceLabel: newPriceLabel } }
        );
        console.log(`  ✅ Circuito "${circuit.name}": "${circuit.priceLabel}" → "${newPriceLabel}"`);
        circuitFixed++;
      }
    }

    console.log(`\n✅ Corrección completada:`);
    console.log(`   - Transportes corregidos: ${transportFixed}`);
    console.log(`   - Circuitos corregidos: ${circuitFixed}`);

    // Verificar que no queden más "common.from"
    const remainingTransports = await Transport.find({ priceLabel: /common\.from/i });
    const remainingCircuits = await Circuit.find({ priceLabel: /common\.from/i });

    if (remainingTransports.length > 0 || remainingCircuits.length > 0) {
      console.log('\n⚠️  Aún quedan registros con "common.from":');
      if (remainingTransports.length > 0) {
        console.log(`   - Transportes: ${remainingTransports.length}`);
        remainingTransports.forEach(t => console.log(`     * ${t.name}: "${t.priceLabel}"`));
      }
      if (remainingCircuits.length > 0) {
        console.log(`   - Circuitos: ${remainingCircuits.length}`);
        remainingCircuits.forEach(c => console.log(`     * ${c.name}: "${c.priceLabel}"`));
      }
    } else {
      console.log('\n✅ Todos los priceLabel han sido corregidos correctamente');
    }

    await mongoose.connection.close();
    console.log('\n✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPriceLabels();
