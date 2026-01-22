const { MongoClient } = require('mongodb');
const dns = require('dns');

// Configurar DNS alternativo para resolver SRV
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * Atlas Search - Create autocomplete index
 * Doc: https://www.mongodb.com/docs/atlas/atlas-search/field-types/autocomplete-type/
 *
 * Cluster: Yassline M0
 * cluster_hostname: yassline.v3oycnj.mongodb.net
 * Primary node: ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net
 *
 * Use SRV format ONLY. Standard format with wrong nodes targets a different cluster.
 * 1. Replace <db_password> with your password.
 * 2. Run: node create-index.js
 */

const uri =
  'mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline';

const databaseName = 'yasslinetour';
const collectionName = 'circuits';

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 60000,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 60000,
  retryWrites: true,
  retryReads: true,
});

async function run() {
  try {
    console.log('🔄 Conectando a Yassline M0 (SRV)...\n');
    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas\n');

    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

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

    console.log('📋 Creando índice en', `${databaseName}.${collectionName}` + '...\n');
    const result = await collection.createSearchIndex(index);
    console.log('✅ Índice creado:', result);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.codeName) console.error('   Código:', error.codeName);

    if (error.message.includes('ECONNREFUSED') || error.message.includes('querySrv')) {
      console.error('\n🔍 DNS SRV no resuelve. Verifica internet y DNS (8.8.8.8 / 1.1.1.1).');
    } else if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('\n🔍 Usuario/contraseña incorrectos. Database Access → yasslinetour_db_user.');
    } else if (error.message.includes('timeout') || error.message.includes('Server selection timed out')) {
      console.error('\n🔍 Timeout. Verifica Network Access (0.0.0.0/0) y que el cluster esté Active.');
    }
    console.error('\n📋 Cluster Yassline M0: https://cloud.mongodb.com/v2/696fed8e58c68fde768f0cc4#/clusters/detail/Yassline\n');
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Conexión cerrada.');
  }
}

run();
