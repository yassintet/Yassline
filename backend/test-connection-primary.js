/**
 * Test conexión directa al nodo primario confirmado
 * Primary node: ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const username = 'yasslinetour_db_user';
const passwordRaw = process.env.MONGO_PASSWORD || 'Yassin123.123.';
// Codificar la contraseña para URL (los puntos pueden causar problemas)
const password = encodeURIComponent(passwordRaw);

// Conexión directa al nodo primario (sin replica set)
const uri = `mongodb://${username}:${password}@ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&retryWrites=true&w=majority`;

async function test() {
  console.log('🔍 Test conexión directa al nodo primario\n');
  console.log('📍 Nodo: ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net\n');

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  try {
    await client.connect();
    console.log('✅ ¡Conexión exitosa!\n');

    const db = client.db('yasslinetour');
    await db.admin().command({ ping: 1 });
    console.log('✅ Ping OK\n');

    const collections = await db.listCollections().toArray();
    console.log(`📁 Colecciones: ${collections.length}`);
    collections.forEach((c) => console.log(`   - ${c.name}`));

    console.log('\n🎉 ¡Todo funciona!');
    console.log('\n💡 Para usar en producción, actualiza backend/.env:');
    console.log('MONGO_URI=mongodb://yasslinetour_db_user:Yassin123.123.@ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net:27017/yasslinetour?ssl=true&authSource=admin&retryWrites=true&w=majority');
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
      console.error('\n💡 Error de autenticación. Verifica:');
      console.error('   1. Usuario: yasslinetour_db_user');
      console.error('   2. Contraseña: Yassin123.123.');
      console.error('   3. Usuario está "Active" en Database Access');
      console.error('   4. Esperaste 1-2 minutos después de cambiar la contraseña');
    } else if (err.message.includes('timeout')) {
      console.error('\n💡 Timeout. Verifica Network Access (0.0.0.0/0) y que el cluster esté Active.');
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

test();
