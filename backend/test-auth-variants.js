/**
 * Prueba diferentes variantes de codificación de contraseña
 * para diagnosticar problemas de autenticación
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const username = 'yasslinetour_db_user';
const passwordRaw = 'Yassin123.123.';

// Diferentes formas de codificar/tratar la contraseña
const passwordVariants = [
  { name: 'Sin codificar', password: passwordRaw },
  { name: 'encodeURIComponent', password: encodeURIComponent(passwordRaw) },
  { name: 'Sin punto final', password: 'Yassin123.123' },
  { name: 'Con espacios recortados', password: passwordRaw.trim() },
];

const node = 'ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net';

async function testVariant(name, password) {
  const uri = `mongodb://${username}:${password}@${node}:27017/yasslinetour?ssl=true&authSource=admin&retryWrites=true&w=majority`;
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });

  try {
    await client.connect();
    await client.db('yasslinetour').admin().command({ ping: 1 });
    await client.close();
    return { success: true, name, password };
  } catch (err) {
    await client.close().catch(() => {});
    return { success: false, name, error: err.message };
  }
}

async function run() {
  console.log('🔍 Probando variantes de autenticación\n');
  console.log('📍 Nodo:', node);
  console.log('👤 Usuario:', username);
  console.log('🔑 Contraseña original:', passwordRaw);
  console.log('');

  for (const variant of passwordVariants) {
    console.log(`🔄 Probando: ${variant.name}...`);
    const result = await testVariant(variant.name, variant.password);
    
    if (result.success) {
      console.log(`✅ ¡ÉXITO con "${variant.name}"!\n`);
      console.log('💡 Usa esta contraseña en .env:');
      console.log(`MONGO_PASSWORD=${variant.password}`);
      console.log(`MONGO_URI=mongodb+srv://${username}:${variant.password}@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline`);
      process.exit(0);
    } else {
      console.log(`❌ Falló: ${result.error}\n`);
    }
  }

  console.log('❌ Todas las variantes fallaron.\n');
  console.log('💡 SOLUCIÓN: Crea un usuario nuevo en Atlas\n');
  console.log('1. Ve a MongoDB Atlas → Database Access');
  console.log('2. Click "Add New Database User"');
  console.log('3. Username: test_user');
  console.log('4. Password: Test123456 (sin caracteres especiales)');
  console.log('5. Privileges: Atlas admin');
  console.log('6. Click "Add User"');
  console.log('7. Espera 1 minuto');
  console.log('8. Prueba con:');
  console.log('   mongodb+srv://test_user:Test123456@yassline.v3oycnj.mongodb.net/?appName=Yassline');
  console.log('');
  console.log('O verifica en Atlas:');
  console.log('- Usuario yasslinetour_db_user está "Active"');
  console.log('- Contraseña es exactamente: Yassin123.123.');
  console.log('- Permisos: "Atlas admin" o "Read and write to any database"');
  
  process.exit(1);
}

run();
