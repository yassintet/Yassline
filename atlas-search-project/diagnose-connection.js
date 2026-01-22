const { MongoClient } = require('mongodb');
const dns = require('dns');
const dnsPromises = require('dns').promises;
const https = require('https');

// Configurar DNS alternativo para resolver SRV
dns.setServers(['8.8.8.8', '1.1.1.1']);

console.log('🔍 Diagnóstico Yassline M0\n');
console.log('='.repeat(60));

const uri = 'mongodb+srv://yasslinetour_db_user:STCYcH8pvIwy3Sbo@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline';
const clusterHost = 'yassline.v3oycnj.mongodb.net';
const nodes = [
  'ac-mzstv7l-shard-00-00.aw7fb7q.mongodb.net',
  'ac-mzstv7l-shard-00-01.aw7fb7q.mongodb.net',
  'ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net',
];

async function testDNS() {
  console.log('\n1️⃣  DNS SRV...');
  try {
    const srv = await dnsPromises.resolveSrv('_mongodb._tcp.' + clusterHost);
    console.log('   ✅ OK –', srv.length, 'registros');
    srv.forEach((r, i) => console.log(`      ${i + 1}. ${r.name}:${r.port}`));
    return true;
  } catch (e) {
    console.log('   ❌', e.message);
    return false;
  }
}

async function testTCP(host, port) {
  return new Promise((resolve) => {
    const net = require('net');
    const s = new net.Socket();
    s.setTimeout(5000);
    s.once('connect', () => { s.destroy(); resolve(true); });
    s.once('timeout', () => { s.destroy(); resolve(false); });
    s.once('error', () => resolve(false));
    s.connect(port, host);
  });
}

async function testNetwork() {
  console.log('\n2️⃣  TCP 27017 (nodos Yassline M0)...');
  let ok = 0;
  for (const host of nodes) {
    const r = await testTCP(host, 27017);
    console.log(r ? `   ✅ ${host}` : `   ❌ ${host}`);
    if (r) ok++;
  }
  return ok === nodes.length;
}

async function testMongo() {
  console.log('\n3️⃣  Conexión MongoDB (SRV)...');
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000, connectTimeoutMS: 15000 });
  try {
    await client.connect();
    await client.db('yasslinetour').admin().command({ ping: 1 });
    console.log('   ✅ OK');
    await client.close();
    return true;
  } catch (e) {
    console.log('   ❌', e.message);
    return false;
  }
}

async function runDiagnostics() {
  const dnsOk = await testDNS();
  const netOk = await testNetwork();
  const mongoOk = await testMongo();

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN\n');
  console.log('   DNS SRV:     ' + (dnsOk ? '✅' : '❌'));
  console.log('   TCP 27017:   ' + (netOk ? '✅' : '❌'));
  console.log('   MongoDB:     ' + (mongoOk ? '✅' : '❌'));
  console.log('\n' + '='.repeat(60));

  if (!netOk) {
    console.log('💡 Configura Network Access (0.0.0.0/0) y comprueba que el cluster esté Active.');
  }
  if (!mongoOk && (dnsOk || netOk)) {
    console.log('💡 DNS/TCP OK pero MongoDB falla: revisa usuario/contraseña y que apuntes al cluster Yassline M0.');
  }
  console.log('');
  process.exit(0);
}

runDiagnostics().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
