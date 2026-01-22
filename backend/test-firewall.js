const net = require('net');

console.log('🔥 Test de Firewall/Conectividad\n');
console.log('='.repeat(60));

const hosts = [
  { name: 'Shard 00-00', host: 'ac-mzstv7l-shard-00-00.aw7fb7q.mongodb.net', port: 27017 },
  { name: 'Shard 00-01', host: 'ac-mzstv7l-shard-00-01.aw7fb7q.mongodb.net', port: 27017 },
  { name: 'Shard 00-02', host: 'ac-mzstv7l-shard-00-02.aw7fb7q.mongodb.net', port: 27017 }
];

function testConnection(host, port, timeout = 5000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let connected = false;
    
    socket.setTimeout(timeout);
    
    socket.once('connect', () => {
      connected = true;
      socket.destroy();
      resolve({ success: true, message: 'Conexión exitosa' });
    });
    
    socket.once('timeout', () => {
      socket.destroy();
      resolve({ success: false, message: 'Timeout - Puerto bloqueado o inaccesible' });
    });
    
    socket.once('error', (err) => {
      socket.destroy();
      resolve({ success: false, message: `Error: ${err.message}` });
    });
    
    socket.connect(port, host);
  });
}

async function runTests() {
  console.log('🧪 Probando conectividad TCP a los servidores MongoDB...\n');
  
  for (const { name, host, port } of hosts) {
    console.log(`🔄 ${name} (${host}:${port})...`);
    const result = await testConnection(host, port);
    
    if (result.success) {
      console.log(`   ✅ ${result.message}\n`);
    } else {
      console.log(`   ❌ ${result.message}\n`);
    }
  }
  
  console.log('='.repeat(60));
  console.log('\n💡 Interpretación:');
  console.log('   ✅ Conexión exitosa = Puerto accesible');
  console.log('   ❌ Timeout/Error = Posible bloqueo de firewall\n');
}

runTests();
