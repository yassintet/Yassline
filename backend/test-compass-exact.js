/**
 * Test con la connection string EXACTA de Compass
 * mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/?appName=Yassline
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

// Connection string EXACTA de Compass
const uri = 'mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/?appName=Yassline';

async function test() {
  console.log('🔍 Test con connection string EXACTA de Compass\n');
  console.log('='.repeat(60));
  console.log('✅ Compass funciona con esta URI');
  console.log('🔗 URI:', uri.replace(/:[^:@]+@/, ':****@'));
  console.log('='.repeat(60));
  console.log('');

  // Opciones con DNS alternativo
  const options1 = {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  };

  // Opciones con family IPv4 forzado (a veces ayuda con DNS)
  const options2 = {
    ...options1,
    family: 4, // Forzar IPv4
  };

  const configs = [
    { name: 'Configuración estándar', options: options1 },
    { name: 'Con IPv4 forzado', options: options2 },
  ];

  for (const config of configs) {
    console.log(`🔄 Probando: ${config.name}...`);
    
    const client = new MongoClient(uri, config.options);

    try {
      await client.connect();
      console.log('   ✅ Conexión exitosa!\n');

      const db = client.db('yasslinetour');
      await db.admin().command({ ping: 1 });
      console.log('   ✅ Ping OK\n');

      const collections = await db.listCollections().toArray();
      console.log(`   📁 Colecciones: ${collections.length}`);
      collections.forEach((c) => console.log(`      - ${c.name}`));

      console.log('\n' + '='.repeat(60));
      console.log('🎉 ¡CONEXIÓN EXITOSA!\n');
      console.log('💡 Actualiza backend/.env con:');
      console.log(`MONGO_URI=${uri}`);
      console.log(`MONGO_PASSWORD=STCYcH8pvIwy3Sbo`);
      console.log('\n💡 O con base de datos en la URI:');
      console.log(`MONGO_URI=mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline`);
      
      await client.close();
      process.exit(0);
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}\n`);
      await client.close().catch(() => {});
    }
  }

  console.log('='.repeat(60));
  console.log('❌ Node.js no puede resolver DNS SRV\n');
  console.log('💡 SOLUCIÓN: Usar formato estándar');
  console.log('   Compass resolvió los nodos, pero Node.js no puede.');
  console.log('   Necesitamos los nodos que Compass está usando.\n');
  console.log('📋 En Compass:');
  console.log('   1. Click en el cluster "Yassline" (izquierda)');
  console.log('   2. Ve a la pestaña "Overview" o "Connection"');
  console.log('   3. Busca "Host" o "Primary" o "Connection String"');
  console.log('   4. Debería mostrar algo como:');
  console.log('      ac-xxx-shard-00-xx.xxx.mongodb.net');
  console.log('   5. Comparte esos nodos aquí\n');
  console.log('💡 O prueba cambiar el DNS de tu sistema:');
  console.log('   - Usa 8.8.8.8 (Google DNS) o 1.1.1.1 (Cloudflare)');
  console.log('   - Reinicia y vuelve a intentar');
  
  process.exit(1);
}

test();
