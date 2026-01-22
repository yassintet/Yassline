/**
 * MongoDB Node.js Driver – Conexión según Atlas "Connect"
 *
 * Connection string (Atlas):
 *   mongodb+srv://yasslinetour_db_user:<db_password>@yassline.v3oycnj.mongodb.net/?appName=Yassline
 *
 * 1. Define MONGO_URI en .env con tu contraseña, o usa la de abajo.
 * 2. npm run test:driver
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const dns = require('dns');

// Configurar DNS alternativo para resolver SRV
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Misma forma que Atlas; usa .env o define aquí
const uri =
  process.env.MONGO_URI ||
  'mongodb+srv://yasslinetour_db_user:REPLACE_WITH_PASSWORD@yassline.v3oycnj.mongodb.net/?appName=Yassline';

async function run() {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
  });

  try {
    console.log('MongoDB Driver – Connecting...\n');
    await client.connect();
    console.log('Connected successfully.\n');

    const db = client.db('yasslinetour');
    await db.admin().command({ ping: 1 });
    console.log('Ping OK.\n');

    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.length);
    collections.forEach((c) => console.log('  -', c.name));

    console.log('\nDone.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

run();
