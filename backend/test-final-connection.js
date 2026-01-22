/**
 * Test final con configuración optimizada
 * Usuario confirmado: yasslinetour_db_user con atlasAdmin@admin
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const dns = require('dns').promises;

const username = 'yasslinetour_db_user';
const password = process.env.MONGO_PASSWORD || 'STCYcH8pvIwy3Sbo';

async function resolveSRV() {
  try {
    const records = await dns.resolveSrv('_mongodb._tcp.yassline.v3oycnj.mongodb.net');
    console.log('📋 DNS SRV resuelto:', records.length, 'registros');
    records.forEach((r, i) => console.log(`   ${i + 1}. ${r.name}:${r.port}`));
    return records;
  } catch (err) {
    console.log('⚠️  DNS SRV falló:', err.message);
    return null;
  }
}

async function testSRV() {
  console.log('🔄 Test 1: Formato SRV\n');
  const uri = `mongodb+srv://${username}:${password}@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline`;
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  try {
    await client.connect();
    const db = client.db('yasslinetour');
    await db.admin().command({ ping: 1 });
    const collections = await db.listCollections().toArray();
    console.log('✅ SRV funciona!');
    console.log(`📁 Colecciones: ${collections.length}`);
    await client.close();
    return true;
  } catch (err) {
    console.log(`❌ SRV falló: ${err.message}\n`);
    await client.close().catch(() => {});
    return false;
  }
}

async function testDirect() {
  console.log('🔄 Test 2: Formato directo (nodo primario)\n');
  const uri = `mongodb://${username}:${password}@ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&retryWrites=true&w=majority`;
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  try {
    await client.connect();
    const db = client.db('yasslinetour');
    await db.admin().command({ ping: 1 });
    const collections = await db.listCollections().toArray();
    console.log('✅ Directo funciona!');
    console.log(`📁 Colecciones: ${collections.length}`);
    await client.close();
    return true;
  } catch (err) {
    console.log(`❌ Directo falló: ${err.message}\n`);
    await client.close().catch(() => {});
    return false;
  }
}

async function run() {
  console.log('🔍 Test Final de Conexión\n');
  console.log('='.repeat(50));
  console.log('👤 Usuario:', username);
  console.log('🔑 Contraseña:', password);
  console.log('📍 Cluster: yassline.v3oycnj.mongodb.net');
  console.log('='.repeat(50));
  console.log('');

  // Resolver DNS primero
  await resolveSRV();
  console.log('');

  // Probar ambos formatos
  const srvOk = await testSRV();
  console.log('');
  const directOk = await testDirect();

  console.log('\n' + '='.repeat(50));
  if (srvOk || directOk) {
    console.log('🎉 ¡CONEXIÓN EXITOSA!\n');
    if (srvOk) {
      console.log('💡 Usa en .env (SRV):');
      console.log(`MONGO_URI=mongodb+srv://${username}:${password}@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline`);
    } else {
      console.log('💡 Usa en .env (Directo):');
      console.log(`MONGO_URI=mongodb://${username}:${password}@ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&retryWrites=true&w=majority`);
    }
  } else {
    console.log('❌ Ambos formatos fallaron\n');
    console.log('💡 Verifica en Atlas:');
    console.log('   1. Usuario está "Active" (no "Disabled")');
    console.log('   2. Esperaste 2-3 minutos después de cambiar la contraseña');
    console.log('   3. Network Access tiene 0.0.0.0/0 Active');
    console.log('   4. Cluster Yassline está Active (no pausado)');
  }
}

run().catch(console.error);
