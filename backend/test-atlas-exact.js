/**
 * Test usando el formato EXACTO de Atlas Connect → Drivers
 * Formato: mongodb+srv://<username>:<password>@cluster.dns_name.mongodb.net/?retryWrites=true&w=majority&appName=CLUSTER_NAME
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

// Credenciales
const username = 'yasslinetour_db_user';
const password = 'STCYcH8pvIwy3Sbo'; // Sin caracteres especiales problemáticos

// Formato EXACTO de Atlas (sin base de datos en la ruta, se especifica después)
const uri = `mongodb+srv://${username}:${password}@yassline.v3oycnj.mongodb.net/?retryWrites=true&w=majority&appName=Yassline`;

async function test() {
  console.log('🔍 Test con formato EXACTO de Atlas\n');
  console.log('='.repeat(60));
  console.log('📋 Formato usado:');
  console.log('   mongodb+srv://<username>:<password>@cluster.dns_name.mongodb.net/');
  console.log('   ?retryWrites=true&w=majority&appName=CLUSTER_NAME');
  console.log('='.repeat(60));
  console.log('\n👤 Usuario:', username);
  console.log('🔑 Contraseña:', password);
  console.log('📍 Cluster: yassline.v3oycnj.mongodb.net');
  console.log('🔗 URI:', uri.replace(/:[^:@]+@/, ':****@'));
  console.log('');

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  try {
    console.log('🔄 Conectando...\n');
    await client.connect();
    console.log('✅ ¡Conexión exitosa!\n');

    // Especificar la base de datos después de conectar
    const db = client.db('yasslinetour');
    
    // Ping
    await db.admin().command({ ping: 1 });
    console.log('✅ Ping OK\n');

    // Listar colecciones
    const collections = await db.listCollections().toArray();
    console.log(`📁 Colecciones en 'yasslinetour': ${collections.length}`);
    collections.forEach((c) => console.log(`   - ${c.name}`));

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ¡CONEXIÓN EXITOSA!\n');
    console.log('💡 Actualiza backend/.env con:');
    console.log(`MONGO_URI=${uri}`);
    console.log(`MONGO_PASSWORD=${password}`);
    console.log('\n💡 O para usar con base de datos en la URI:');
    console.log(`MONGO_URI=mongodb+srv://${username}:${password}@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('\n' + '='.repeat(60));
    
    if (err.message.includes('authentication failed') || err.message.includes('bad auth')) {
      console.error('💡 Error de autenticación:\n');
      console.error('   1. Verifica que copiaste la connection string EXACTA de Atlas');
      console.error('      → Database → Connect → Drivers → Node.js');
      console.error('   2. Verifica usuario y contraseña en Database Access');
      console.error('   3. Asegúrate de reemplazar <username> y <password>');
      console.error('   4. Remueve los caracteres < y > de la connection string');
      console.error('   5. Si la contraseña tiene @ o /, codifícalos (encodeURIComponent)');
      console.error('\n📋 Connection string que deberías copiar de Atlas:');
      console.error('   mongodb+srv://yasslinetour_db_user:<password>@yassline.v3oycnj.mongodb.net/');
      console.error('   ?retryWrites=true&w=majority&appName=Yassline');
      console.error('\n   (Reemplaza <password> con: STCYcH8pvIwy3Sbo)');
    } else if (err.message.includes('querySrv') || err.message.includes('ECONNREFUSED')) {
      console.error('💡 Problema de DNS SRV. Verifica Network Access (0.0.0.0/0).');
    } else if (err.message.includes('timeout')) {
      console.error('💡 Timeout. Verifica que el cluster esté Active.');
    }
    
    process.exit(1);
  } finally {
    await client.close();
  }
}

test();
