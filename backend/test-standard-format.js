/**
 * Test con formato estándar (sin SRV) usando la nueva contraseña
 * Esto evita problemas de DNS SRV
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const username = 'yasslinetour_db_user';
const password = 'STCYcH8pvIwy3Sbo';

// Formato estándar - necesitamos el replica set name correcto
// Probamos diferentes variantes del replica set name
const replicaSets = [
  'atlas-mzstv7l-shard-0',  // Basado en el nombre del nodo
  'atlas-c4uhcr-shard-0',    // Del TXT record anterior
  'atlas-nbesxsy-shard-0',   // Del cluster anterior (por si acaso)
];

const node = 'ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net';

async function testReplicaSet(replicaSet) {
  const uri = `mongodb://${username}:${password}@${node}:27017/yasslinetour?ssl=true&authSource=admin&replicaSet=${replicaSet}&retryWrites=true&w=majority`;
  
  console.log(`\n🔄 Probando replica set: ${replicaSet}`);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
    socketTimeoutMS: 20000,
  });

  try {
    await client.connect();
    const db = client.db('yasslinetour');
    await db.admin().command({ ping: 1 });
    const collections = await db.listCollections().toArray();
    console.log(`✅ ¡ÉXITO con replica set: ${replicaSet}!`);
    console.log(`📁 Colecciones: ${collections.length}`);
    await client.close();
    return { success: true, replicaSet, uri };
  } catch (err) {
    console.log(`❌ Falló: ${err.message}`);
    await client.close().catch(() => {});
    return { success: false, error: err.message };
  }
}

async function testDirect() {
  // Sin replica set (conexión directa)
  const uri = `mongodb://${username}:${password}@${node}:27017/yasslinetour?ssl=true&authSource=admin&retryWrites=true&w=majority`;
  
  console.log(`\n🔄 Probando conexión directa (sin replica set)`);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
    socketTimeoutMS: 20000,
  });

  try {
    await client.connect();
    const db = client.db('yasslinetour');
    await db.admin().command({ ping: 1 });
    const collections = await db.listCollections().toArray();
    console.log(`✅ ¡ÉXITO con conexión directa!`);
    console.log(`📁 Colecciones: ${collections.length}`);
    await client.close();
    return { success: true, uri, direct: true };
  } catch (err) {
    console.log(`❌ Falló: ${err.message}`);
    await client.close().catch(() => {});
    return { success: false, error: err.message };
  }
}

async function run() {
  console.log('🔍 Test formato estándar (sin SRV)\n');
  console.log('='.repeat(60));
  console.log('👤 Usuario:', username);
  console.log('🔑 Contraseña:', password);
  console.log('📍 Nodo:', node);
  console.log('='.repeat(60));

  // Probar conexión directa primero
  const directResult = await testDirect();
  if (directResult.success) {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ¡CONEXIÓN EXITOSA!\n');
    console.log('💡 Usa en backend/.env:');
    console.log(`MONGO_URI=${directResult.uri}`);
    process.exit(0);
  }

  // Probar diferentes replica sets
  for (const rs of replicaSets) {
    const result = await testReplicaSet(rs);
    if (result.success) {
      console.log('\n' + '='.repeat(60));
      console.log('🎉 ¡CONEXIÓN EXITOSA!\n');
      console.log('💡 Usa en backend/.env:');
      console.log(`MONGO_URI=${result.uri}`);
      process.exit(0);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('❌ Todos los formatos fallaron\n');
  console.log('💡 IMPORTANTE:');
  console.log('   1. Ve a Atlas → Database → Connect → Drivers');
  console.log('   2. Copia la connection string EXACTA (formato estándar si SRV no funciona)');
  console.log('   3. Verifica el replica set name en esa connection string');
  console.log('   4. O prueba con MongoDB Compass para confirmar credenciales');
  process.exit(1);
}

run();
