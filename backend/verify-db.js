require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const Circuit = require('./models/Circuit');
const Transport = require('./models/Transport');
const Vehicle = require('./models/Vehicle');
const User = require('./models/User');

const verifyDatabase = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };
    
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ Conectado a MongoDB');
    console.log('📊 Base de datos:', mongoose.connection.db.databaseName);
    console.log('');
    
    // Obtener colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Colecciones encontradas:', collections.length);
    collections.forEach(c => console.log('   ✓ ' + c.name));
    console.log('');
    
    // Contar documentos
    const circuitCount = await Circuit.countDocuments();
    const transportCount = await Transport.countDocuments();
    const vehicleCount = await Vehicle.countDocuments();
    const userCount = await User.countDocuments();
    
    console.log('📊 Resumen de documentos:');
    console.log('   Circuitos: ' + circuitCount);
    console.log('   Transportes: ' + transportCount);
    console.log('   Vehículos: ' + vehicleCount);
    console.log('   Usuarios: ' + userCount);
    console.log('');
    
    // Verificar usuarios
    const admin = await User.findOne({ username: 'admin' });
    const testUser = await User.findOne({ username: 'testuser' });
    
    console.log('👤 Usuarios:');
    if (admin) {
      console.log('   ✓ Admin: ' + admin.username + ' (' + admin.email + ') - Rol: ' + admin.role);
    } else {
      console.log('   ✗ Admin no encontrado');
    }
    if (testUser) {
      console.log('   ✓ Test User: ' + testUser.username + ' (' + testUser.email + ') - Rol: ' + testUser.role);
    } else {
      console.log('   ✗ Test User no encontrado');
    }
    console.log('');
    
    // Verificar circuitos destacados
    const featuredCircuits = await Circuit.find({ featured: true });
    console.log('⭐ Circuitos destacados:', featuredCircuits.length);
    featuredCircuits.forEach(c => {
      console.log('   - ' + c.name + ': ' + c.price + '€ - ' + c.duration);
    });
    console.log('');
    
    // Estado final
    const totalDocs = circuitCount + transportCount + vehicleCount + userCount;
    if (totalDocs > 0) {
      console.log('✅ Base de datos lista y funcionando!');
      console.log('📦 Total de documentos: ' + totalDocs);
    } else {
      console.log('⚠️  Base de datos vacía. Ejecuta: npm run seed');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyDatabase();
