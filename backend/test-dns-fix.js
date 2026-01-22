/**
 * Test con resolver DNS alternativo
 * Intenta resolver DNS SRV usando diferentes métodos
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const dns = require('dns');

// Configurar DNS alternativo
dns.setServers(['8.8.8.8', '1.1.1.1']); // Google DNS y Cloudflare

const uri = 'mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/?appName=Yassline';

async function test() {
  console.log('🔍 Test con DNS alternativo (8.8.8.8, 1.1.1.1)\n');
  console.log('='.repeat(60));
  console.log('🔗 URI:', uri.replace(/:[^:@]+@/, ':****@'));
  console.log('='.repeat(60));
  console.log('');

  // Intentar resolver DNS SRV manualmente primero
  console.log('🔄 Resolviendo DNS SRV manualmente...');
  return new Promise((resolve) => {
    dns.resolveSrv('_mongodb._tcp.yassline.v3oycnj.mongodb.net', (err, records) => {
      if (err) {
        console.log(`   ❌ DNS SRV falló: ${err.message}\n`);
        console.log('💡 El problema es DNS. Soluciones:');
        console.log('   1. Cambia el DNS del sistema a 8.8.8.8 / 1.1.1.1');
        console.log('   2. O usa el formato estándar con los nodos de Compass');
        console.log('   3. O comparte los nodos que Compass muestra\n');
        resolve(false);
      } else {
        console.log(`   ✅ DNS SRV resuelto: ${records.length} registros`);
        records.forEach((r, i) => console.log(`      ${i + 1}. ${r.name}:${r.port}`));
        console.log('');
        
        // Ahora intentar conectar
        const client = new MongoClient(uri, {
          serverSelectionTimeoutMS: 30000,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 30000,
        });

        client.connect()
          .then(async () => {
            console.log('✅ Conexión exitosa!\n');
            const db = client.db('yasslinetour');
            await db.admin().command({ ping: 1 });
            const collections = await db.listCollections().toArray();
            console.log(`📁 Colecciones: ${collections.length}`);
            collections.forEach((c) => console.log(`   - ${c.name}`));
            await client.close();
            console.log('\n🎉 ¡Todo funciona!');
            console.log('\n💡 Actualiza backend/.env:');
            console.log(`MONGO_URI=${uri}`);
            resolve(true);
          })
          .catch((err) => {
            console.log(`❌ Conexión falló: ${err.message}`);
            client.close().catch(() => {});
            resolve(false);
          });
      }
    });
  });
}

test().then((success) => {
  if (!success) {
    console.log('\n💡 Próximos pasos:');
    console.log('   1. Cambia el DNS del sistema (8.8.8.8 / 1.1.1.1)');
    console.log('   2. O comparte los nodos que Compass muestra');
    console.log('   3. O usa el formato estándar con los nodos conocidos');
    process.exit(1);
  }
});
