/**
 * Test con formato SRV exacto de Atlas
 * Usa la connection string que aparece en Atlas → Connect → Drivers
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

// Connection string exacta de Atlas (SRV)
// Formato: mongodb+srv://yasslinetour_db_user:<db_password>@yassline.v3oycnj.mongodb.net/?appName=Yassline
const password = process.env.MONGO_PASSWORD || 'Yassin123.123.';
const uri = `mongodb+srv://yasslinetour_db_user:${password}@yassline.v3oycnj.mongodb.net/?appName=Yassline`;

async function test() {
  console.log('🔍 Test con formato SRV (Atlas)\n');
  console.log('📍 Cluster: yassline.v3oycnj.mongodb.net\n');

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
    console.log('\n💡 ¡Conexión exitosa! El .env ya está actualizado.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
      console.error('\n💡 Error de autenticación. Verifica:');
      console.error('   1. Usuario: yasslinetour_db_user');
      console.error('   2. Contraseña: Yassin123.123.');
      console.error('   3. Usuario está "Active" en Database Access');
    } else if (err.message.includes('timeout') || err.message.includes('querySrv')) {
      console.error('\n💡 Timeout/DNS. Verifica:');
      console.error('   1. Network Access tiene 0.0.0.0/0 Active');
      console.error('   2. Cluster Yassline está Active');
      console.error('   3. DNS puede resolver yassline.v3oycnj.mongodb.net');
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

test();
