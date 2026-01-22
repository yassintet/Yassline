/**
 * Test con la nueva contraseña: STCYcH8pvIwy3Sbo
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const username = 'yasslinetour_db_user';
const password = 'STCYcH8pvIwy3Sbo';

// Probar diferentes formatos de URI
const uris = [
  // SRV con base de datos
  `mongodb+srv://${username}:${password}@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline`,
  // SRV sin base de datos (como Atlas muestra)
  `mongodb+srv://${username}:${password}@yassline.v3oycnj.mongodb.net/?appName=Yassline`,
  // Directo al nodo primario
  `mongodb://${username}:${password}@ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&retryWrites=true&w=majority`,
];

async function test(uri, name) {
  console.log(`\n🔄 Probando: ${name}`);
  console.log(`   URI: ${uri.replace(/:[^:@]+@/, ':****@')}`);
  
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
  console.log('🔍 Test con nueva contraseña\n');
  console.log('='.repeat(60));
  console.log('👤 Usuario:', username);
  console.log('🔑 Contraseña:', password);
  console.log('='.repeat(60));

  for (let i = 0; i < uris.length; i++) {
    const result = await test(uris[i], `Formato ${i + 1}`);
    if (result.success) {
      console.log('\n' + '='.repeat(60));
      console.log('🎉 ¡CONEXIÓN EXITOSA!\n');
      console.log('💡 Usa esta URI en backend/.env:');
      console.log(`MONGO_URI=${uris[i]}`);
      console.log('\n💡 O solo la contraseña:');
      console.log(`MONGO_PASSWORD=${password}`);
      process.exit(0);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('❌ Todos los formatos fallaron\n');
  console.log('💡 Verifica en Atlas:');
  console.log('   1. Usuario está "Active" (no "Disabled")');
  console.log('   2. Built-in Role es "Atlas admin" o "Read and write to any database"');
  console.log('   3. Authentication Method es "Password" (SCRAM)');
  console.log('   4. Contraseña es exactamente: STCYcH8pvIwy3Sbo');
  console.log('   5. Network Access tiene 0.0.0.0/0 Active');
  console.log('   6. Cluster Yassline está Active (no pausado)');
  console.log('\n💡 Si todo está correcto, espera 3-5 minutos y vuelve a intentar.');
  process.exit(1);
}

run();
