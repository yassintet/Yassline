# Script PowerShell para crear colecciones y datos directamente en MongoDB
# Uso: .\create-collections.ps1

Write-Host "📊 Creando colecciones y datos en MongoDB desde PowerShell..." -ForegroundColor Cyan
Write-Host ""

# Cargar variables de entorno desde .env
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
    Write-Host "✅ Variables de entorno cargadas" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Archivo .env no encontrado" -ForegroundColor Red
    exit 1
}

$MONGO_URI = $env:MONGO_URI
if (-not $MONGO_URI) {
    Write-Host "❌ Error: MONGO_URI no está definida" -ForegroundColor Red
    exit 1
}

# Verificar Node.js
$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) {
    Write-Host "❌ Error: Node.js no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js encontrado" -ForegroundColor Green
Write-Host ""

# Crear script temporal que crea las colecciones directamente
$createScript = @"
require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

// Importar modelos
const Circuit = require('./models/Circuit');
const Transport = require('./models/Transport');
const Vehicle = require('./models/Vehicle');
const User = require('./models/User');

// Datos de ejemplo
const sampleCircuits = [
  {
    name: 'Gran Tour Imperial',
    title: 'Descubre los tesoros imperiales de Marruecos',
    description: 'Un viaje inolvidable a través de las ciudades imperiales de Marruecos.',
    duration: '5 Días / 4 Noches',
    price: 450,
    priceLabel: 'Desde 450€ / persona',
    image: '/images/circuits/imperial.jpg',
    itinerary: [
      { day: 1, title: 'Llegada a Marrakech', description: 'Recepción en el aeropuerto y traslado al hotel.' },
      { day: 2, title: 'Marrakech - Fez', description: 'Salida temprano hacia Fez atravesando las montañas del Atlas.' },
    ],
    includes: ['Chofer privado', 'Combustible', 'Hoteles 4 estrellas', 'Desayunos'],
    featured: true,
    active: true,
  },
];

const sampleTransports = [
  {
    type: 'airport',
    name: 'Traslado Aeropuerto',
    description: 'Servicio de traslado desde/hacia el aeropuerto de Marrakech.',
    icon: 'plane',
    price: 50,
    priceLabel: 'Desde 50€',
    route: { from: 'Aeropuerto Marrakech', to: 'Centro de Marrakech' },
    active: true,
  },
];

const sampleVehicles = [
  {
    name: 'Mercedes V-Class',
    type: 'v-class',
    capacity: { passengers: 7, luggage: '2 maletas grandes' },
    description: 'Vehículo de lujo con todas las comodidades.',
    image: '/images/fleet/v-class.jpg',
    features: ['WiFi gratuito', 'Aire acondicionado', 'Asientos de cuero'],
    active: true,
  },
];

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const createDatabase = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };
    
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ Conectado a MongoDB');
    console.log('📊 Base de datos:', mongoose.connection.db.databaseName);
    
    // Limpiar colecciones
    console.log('🧹 Limpiando colecciones existentes...');
    await Circuit.deleteMany({});
    await Transport.deleteMany({});
    await Vehicle.deleteMany({});
    
    // Crear circuitos
    console.log('📦 Creando circuitos...');
    const circuitsWithSlugs = sampleCircuits.map(c => ({ ...c, slug: generateSlug(c.name) }));
    const circuits = await Circuit.insertMany(circuitsWithSlugs);
    console.log(\`✅ \${circuits.length} circuitos creados\`);
    
    // Crear transportes
    console.log('📦 Creando servicios de transporte...');
    const transports = await Transport.insertMany(sampleTransports);
    console.log(\`✅ \${transports.length} transportes creados\`);
    
    // Crear vehículos
    console.log('📦 Creando vehículos...');
    const vehicles = await Vehicle.insertMany(sampleVehicles);
    console.log(\`✅ \${vehicles.length} vehículos creados\`);
    
    // Crear usuario admin
    console.log('👤 Creando usuario admin...');
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: 'admin@yassline.com',
        password: 'admin123',
        role: 'admin',
        active: true,
      });
      await admin.save();
      console.log('✅ Usuario admin creado (username: admin, password: admin123)');
    } else {
      console.log('ℹ️  Usuario admin ya existe');
    }
    
    // Listar colecciones creadas
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('');
    console.log('📋 Colecciones en la base de datos:');
    collections.forEach(c => console.log(\`   - \${c.name}\`));
    
    console.log('');
    console.log('🎉 Base de datos creada exitosamente!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createDatabase();
"@

$tempFile = Join-Path $env:TEMP "create-mongodb-collections.js"
$createScript | Out-File -FilePath $tempFile -Encoding UTF8

Write-Host "🚀 Ejecutando creación de colecciones..." -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio backend
Set-Location $PSScriptRoot

# Ejecutar script
& node $tempFile

$exitCode = $LASTEXITCODE

# Limpiar archivo temporal
Remove-Item $tempFile -ErrorAction SilentlyContinue

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ Proceso completado exitosamente!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error en el proceso" -ForegroundColor Red
    exit $exitCode
}
