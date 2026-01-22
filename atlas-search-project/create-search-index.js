const { MongoClient } = require('mongodb');
const dns = require('dns');

// Configurar DNS alternativo para resolver SRV
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Connection string: mongodb+srv://<user>:<password>@<cluster>.<host>.mongodb.net/<database>?retryWrites=true&w=majority
const uri =
  'mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline';

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

// Configuración: base de datos y colección
const databaseName = 'yasslinetour';
const collectionName = 'circuits';

async function run() {
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas\n');

    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Definición del índice Atlas Search (autocomplete)
    const index = {
      name: 'default',
      definition: {
        mappings: {
          dynamic: false,
          fields: {
            name: {
              type: 'autocomplete',
              analyzer: 'lucene.standard',
              tokenization: 'edgeGram',
              minGrams: 2,
              maxGrams: 15,
              foldDiacritics: true,
              similarity: { type: 'bm25' },
            },
            title: {
              type: 'autocomplete',
              analyzer: 'lucene.standard',
              tokenization: 'edgeGram',
              minGrams: 2,
              maxGrams: 15,
              foldDiacritics: true,
              similarity: { type: 'bm25' },
            },
            description: {
              type: 'string',
              analyzer: 'lucene.standard',
              similarity: { type: 'bm25' },
            },
          },
        },
      },
    };

    console.log('📋 Creando índice de búsqueda en', `${databaseName}.${collectionName}` + '...\n');
    const result = await collection.createSearchIndex(index);
    console.log('✅ Nuevo índice creado:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.codeName) console.error('   Código:', error.codeName);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada.');
  }
}

run();
