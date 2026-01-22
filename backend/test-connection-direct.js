/**
 * Test de conexión directa usando formato estándar (sin SRV)
 * Usa los nodos correctos del cluster Yassline M0
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

// Credenciales Yassline M0 - Nueva contraseña
// Los puntos (.) normalmente no necesitan codificación, pero probamos ambas formas
const username = 'yasslinetour_db_user';
const password = 'Yassin123.123.'; // Contraseña con puntos
const passwordEncoded = encodeURIComponent('Yassin123.123.'); // Contraseña codificada

// Formato estándar con nodos Yassline M0 (ac-mzstv7l)
// Probamos con contraseña normal y codificada
const uris = [
  // Sin replicaSet, contraseña normal
  `mongodb://${username}:${password}@ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&retryWrites=true&w=majority`,
  // Sin replicaSet, contraseña codificada
  `mongodb://${username}:${passwordEncoded}@ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&retryWrites=true&w=majority`,
  // Con replicaSet, contraseña normal
  `mongodb://${username}:${password}@ac-mzstv7l-shard-00-00.aw7fb7q.mongodb.net:27017,ac-mzstv7l-shard-00-01.aw7fb7q.mongodb.net:27017,ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&replicaSet=atlas-mzstv7l-shard-0&retryWrites=true&w=majority`,
];

async function test() {
  console.log('🔍 Test conexión directa (formato estándar)\n');
  console.log('📍 Nodos: ac-mzstv7l-shard-00-*.aw7fb7q.mongodb.net\n');

  for (let i = 0; i < uris.length; i++) {
    const testUri = uris[i];
    console.log(`🔄 Intentando formato ${i + 1}/${uris.length}...\n`);

    const client = new MongoClient(testUri, {
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 20000,
    });

    try {
      await client.connect();
      console.log(`✅ ¡Conexión exitosa con formato ${i + 1}!\n`);

      const db = client.db('yasslinetour');
      await db.admin().command({ ping: 1 });
      console.log('✅ Ping OK\n');

      const collections = await db.listCollections().toArray();
      console.log(`📁 Colecciones: ${collections.length}`);
      collections.forEach((c) => console.log(`   - ${c.name}`));

      console.log('\n🎉 ¡Todo funciona!');
      await client.close();
      process.exit(0);
    } catch (err) {
      console.log(`❌ Formato ${i + 1} falló: ${err.message}\n`);
      try {
        await client.close();
      } catch {}
      if (i === uris.length - 1) {
        console.error('\n💡 Todos los formatos fallaron. Verifica:');
        console.error('   1. Network Access tiene 0.0.0.0/0 Active');
        console.error('   2. Cluster Yassline está Active (no pausado)');
        console.error('   3. Los nodos ac-mzstv7l-* son accesibles desde tu red');
        console.error('   4. El replica set name correcto (ver en Atlas Connect → Drivers)');
        process.exit(1);
      }
    }
  }
}

test();
