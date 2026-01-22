const { MongoClient } = require('mongodb');
const dns = require('dns');

// Configurar DNS alternativo para resolver SRV
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * Verifica conexión a Yassline M0 (SRV only).
 * Cluster: yassline.v3oycnj.mongodb.net
 */

const uri = 'mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline';

async function verify() {
  console.log('🔍 Verificando conexión a Yassline M0...\n');

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  try {
    await client.connect();
    console.log('✅ Conexión exitosa (SRV)\n');

    const db = client.db('yasslinetour');
    await db.admin().command({ ping: 1 });
    console.log('✅ Ping OK\n');

    const collections = await db.listCollections().toArray();
    console.log(`📁 Colecciones: ${collections.length}`);
    collections.forEach((c) => console.log(`   - ${c.name}`));

    const circuitsExists = collections.some((c) => c.name === 'circuits');
    if (circuitsExists) {
      console.log('\n✅ Colección "circuits" existe');
      const circuits = db.collection('circuits');
      try {
        const searchIndexes = await circuits.listSearchIndexes().toArray();
        console.log(`\n📊 Índices de búsqueda: ${searchIndexes.length}`);
        searchIndexes.forEach((idx) => console.log(`   - ${idx.name} (${idx.status || '?'})`));
      } catch {
        console.log('\n⚠️  No se pudieron listar índices de búsqueda');
      }
    } else {
      console.log('\n⚠️  Colección "circuits" no existe');
    }

    console.log('\n🎉 OK. Ejecuta: npm run create-index\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Verifica Network Access (0.0.0.0/0), cluster Active y SRV correcto.');
    process.exit(1);
  } finally {
    await client.close();
  }
}

verify();
