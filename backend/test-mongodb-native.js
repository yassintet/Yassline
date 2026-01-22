require('dotenv').config();
const { MongoClient } = require('mongodb');

console.log('🔬 Test con Driver Nativo de MongoDB (sin Mongoose)\n');
console.log('='.repeat(60));

if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI no configurado');
  process.exit(1);
}

const uri = process.env.MONGO_URI;
console.log('📍 URI:', uri.replace(/:[^:@]+@/, ':****@'));
console.log('');

// Probar con driver nativo
async function testNativeDriver() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  try {
    console.log('🔄 Intentando conectar con driver nativo...\n');
    await client.connect();
    
    console.log('✅ ¡Conexión exitosa con driver nativo!');
    
    // Probar operaciones básicas
    const db = client.db('yasslinetour');
    const admin = db.admin();
    
    // Ping
    const pingResult = await admin.command({ ping: 1 });
    console.log('✅ Ping exitoso:', pingResult);
    
    // Listar colecciones
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Colecciones encontradas: ${collections.length}`);
    collections.forEach(c => console.log(`   - ${c.name}`));
    
    await client.close();
    console.log('\n🎉 ¡Todo funciona correctamente con driver nativo!');
    console.log('💡 El problema podría ser con Mongoose. Prueba actualizar:');
    console.log('   npm install mongoose@latest\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error con driver nativo:', error.message);
    console.error('   Tipo:', error.name);
    
    if (error.message.includes('timeout')) {
      console.error('\n🔍 El problema persiste incluso con driver nativo.');
      console.error('   Esto sugiere un problema de red o configuración en MongoDB Atlas.\n');
      console.error('💡 Acciones recomendadas:');
      console.error('   1. Elimina y vuelve a agregar 0.0.0.0/0 en Network Access');
      console.error('   2. Verifica que el usuario esté "Active" en Database Access');
      console.error('   3. Prueba desde otra red (hotspot móvil)');
      console.error('   4. Contacta MongoDB Support\n');
    }
    
    process.exit(1);
  }
}

testNativeDriver();
