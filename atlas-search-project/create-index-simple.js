const { MongoClient } = require('mongodb');
const dns = require('dns');

// Configurar DNS alternativo para resolver SRV
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * Versión simplificada - Solo SRV (Yassline M0).
 * Cluster: yassline.v3oycnj.mongodb.net
 */

// Yassline M0 - SRV only (cluster: yassline.v3oycnj.mongodb.net, primary: ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net)
const uri = 'mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline';

const databaseName = 'yasslinetour';
const collectionName = 'circuits';

async function run() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    retryWrites: true,
    retryReads: true,
  });

  try {
    console.log('🔄 Conectando a Yassline M0 (SRV)...\n');

    await client.connect();
    console.log('✅ Conectado a MongoDB Atlas\n');

    const database = client.db(databaseName);
    const collection = database.collection(collectionName);

    // Verificar que la colección existe
    const collections = await database.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
      console.error(`❌ La colección "${collectionName}" no existe en la base de datos "${databaseName}"`);
      process.exit(1);
    }
    console.log(`✅ Colección "${collectionName}" encontrada\n`);

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

    console.log(`📋 Creando índice de búsqueda en ${databaseName}.${collectionName}...\n`);
    const result = await collection.createSearchIndex(index);
    console.log('✅ Índice creado exitosamente:', result);
    console.log('\n🎉 ¡Completado! El índice estará disponible en unos minutos.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.codeName) console.error('   Código:', error.codeName);
    
    if (error.message.includes('timeout') || error.message.includes('Server selection timed out')) {
      console.error('\n🔍 El servidor no responde después de 60 segundos.');
      console.error('\n📋 SOLUCIÓN REQUERIDA:');
      console.error('   1. Ve a https://cloud.mongodb.com/');
      console.error('   2. Network Access → Add IP Address');
      console.error('   3. Agrega: 0.0.0.0/0 (Allow Access from Anywhere)');
      console.error('   4. Espera 2-3 minutos');
      console.error('   5. Vuelve a intentar\n');
      console.error('💡 ALTERNATIVA: Usa la interfaz web (ver create-index-via-atlas-ui.md)\n');
    } else if (error.message.includes('authentication failed')) {
      console.error('\n🔍 Error de autenticación.');
      console.error('   Verifica usuario y contraseña en MongoDB Atlas → Database Access\n');
    } else {
      console.error('\n🔍 Error completo:', error);
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('\n🔌 Conexión cerrada.');
    }
  }
}

run();
