/**
 * Test usando el formato que Compass resolvió
 * Como Compass funciona, usamos los nodos que Compass descubrió
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const username = 'yasslinetour_db_user';
const password = 'STCYcH8pvIwy3Sbo';

// Compass funciona, así que las credenciales son correctas
// El problema es DNS SRV desde Node.js
// Usamos formato estándar con los nodos que sabemos

// Opción 1: Conexión directa al nodo primario (más simple)
const uriDirect = `mongodb://${username}:${password}@ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&retryWrites=true&w=majority`;

// Opción 2: Con todos los shards (si Compass los resolvió)
// Necesitamos el replica set name correcto - lo obtenemos del TXT o de Compass
const uriReplica = `mongodb://${username}:${password}@ac-mzstv7l-shard-00-00.aw7fb7q.mongodb.net:27017,ac-mzstv7l-shard-00-01.aw7fb7q.mongodb.net:27017,ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&replicaSet=atlas-mzstv7l-shard-0&retryWrites=true&w=majority`;

async function test(uri, name) {
  console.log(`\n🔄 Probando: ${name}`);
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  try {
    await client.connect();
    console.log('   ✅ Conexión exitosa!');
    
    const db = client.db('yasslinetour');
    await db.admin().command({ ping: 1 });
    console.log('   ✅ Ping OK');
    
    const collections = await db.listCollections().toArray();
    console.log(`   📁 Colecciones: ${collections.length}`);
    collections.forEach((c) => console.log(`      - ${c.name}`));
    
    await client.close();
    return { success: true, uri, name };
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
    await client.close().catch(() => {});
    return { success: false, error: err.message };
  }
}

async function run() {
  console.log('🔍 Test usando formato que Compass resolvió\n');
  console.log('='.repeat(60));
  console.log('✅ Compass funciona → Credenciales correctas');
  console.log('❌ Node.js DNS SRV falla → Usamos formato estándar');
  console.log('='.repeat(60));

  // Probar conexión directa primero (más simple)
  const directResult = await test(uriDirect, 'Conexión directa (nodo primario)');
  
  if (directResult.success) {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ¡CONEXIÓN EXITOSA!\n');
    console.log('💡 Actualiza backend/.env con:');
    console.log(`MONGO_URI=${uriDirect}`);
    console.log(`MONGO_PASSWORD=${password}`);
    console.log('\n✅ Esta URI funciona sin depender de DNS SRV');
    process.exit(0);
  }

  // Si falla, probar con replica set
  console.log('\n⚠️  Conexión directa falló, probando con replica set...');
  const replicaResult = await test(uriReplica, 'Con replica set (todos los shards)');
  
  if (replicaResult.success) {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ¡CONEXIÓN EXITOSA!\n');
    console.log('💡 Actualiza backend/.env con:');
    console.log(`MONGO_URI=${uriReplica}`);
    console.log(`MONGO_PASSWORD=${password}`);
    process.exit(0);
  }

  console.log('\n' + '='.repeat(60));
  console.log('❌ Ambos formatos fallaron\n');
  console.log('💡 En Compass, después de conectar:');
  console.log('   1. Click en el cluster conectado');
  console.log('   2. Ve a "Connection String" o detalles');
  console.log('   3. Copia la connection string que muestra');
  console.log('   4. Compártela aquí para usar el formato exacto');
  console.log('\n💡 O verifica en Compass qué nodos está usando:');
  console.log('   - Click derecho en el cluster → "View Details"');
  console.log('   - Busca "Host" o "Primary"');
  process.exit(1);
}

run();
