const { MongoClient } = require('mongodb');
const dns = require('dns');

// Configurar DNS alternativo para resolver SRV
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Connection string: mongodb+srv://<user>:<password>@<cluster>.<host>.mongodb.net/<database>?retryWrites=true&w=majority
const uri =
  'mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline';

async function run() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });

  console.log('🧪 Test de conexión con MongoDB Driver nativo\n');
  console.log('🔄 Intentando conectar...\n');

  try {
    await client.connect();
    console.log('✅ ¡Conexión exitosa!\n');
    
    const admin = client.db().admin();
    const result = await admin.command({ ping: 1 });
    console.log('📊 Ping:', result);
    
    const db = client.db('yasslinetour');
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Colecciones en yasslinetour:', collections.length);
    collections.forEach(c => console.log('   -', c.name));
    
    await client.close();
    console.log('\n🎉 Test completado correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error de conexión:\n');
    console.error('   Tipo:', error.name);
    console.error('   Mensaje:', error.message);
    process.exit(1);
  }
}

run();
