# Script PowerShell para conectar y crear base de datos MongoDB directamente
# Uso: .\connect-mongodb.ps1

Write-Host "🚀 Conectando a MongoDB Atlas desde PowerShell..." -ForegroundColor Cyan

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
    Write-Host "✅ Variables de entorno cargadas desde .env" -ForegroundColor Green
} else {
    Write-Host "⚠️  Archivo .env no encontrado. Usando variables del sistema." -ForegroundColor Yellow
}

# URI de conexión
$MONGO_URI = $env:MONGO_URI
if (-not $MONGO_URI) {
    Write-Host "❌ Error: MONGO_URI no está definida" -ForegroundColor Red
    Write-Host "Por favor, configura MONGO_URI en el archivo .env" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 URI de conexión: $($MONGO_URI -replace ':[^:@]+@', ':****@')" -ForegroundColor Gray

# Verificar si mongosh está instalado
$mongoshPath = Get-Command mongosh -ErrorAction SilentlyContinue
if ($mongoshPath) {
    Write-Host "✅ MongoDB Shell (mongosh) encontrado" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔌 Conectando a MongoDB Atlas..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Una vez conectado, puedes ejecutar comandos como:" -ForegroundColor Yellow
    Write-Host "  use yasslinetour" -ForegroundColor Gray
    Write-Host "  db.circuits.find()" -ForegroundColor Gray
    Write-Host "  show collections" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Para salir, escribe: exit" -ForegroundColor Yellow
    Write-Host ""
    
    # Conectar usando mongosh
    & mongosh $MONGO_URI
} else {
    Write-Host "⚠️  MongoDB Shell (mongosh) no está instalado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Cyan
    Write-Host "1. Instalar mongosh desde: https://www.mongodb.com/try/download/shell" -ForegroundColor White
    Write-Host "2. Usar Node.js directamente (ejecuta: .\seed-database.ps1)" -ForegroundColor White
    Write-Host ""
    
    # Alternativa: usar Node.js directamente
    $nodePath = Get-Command node -ErrorAction SilentlyContinue
    if ($nodePath) {
        Write-Host "✅ Node.js encontrado. Ejecutando script de conexión..." -ForegroundColor Green
        Write-Host ""
        
        # Crear script temporal de conexión
        $tempScript = @"
require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    };
    
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log('✅ Conectado a MongoDB exitosamente!');
    console.log('📊 Base de datos:', mongoose.connection.db.databaseName);
    console.log('📦 Colecciones:', (await mongoose.connection.db.listCollections().toArray()).map(c => c.name).join(', ') || 'Ninguna');
    
    // Mantener la conexión abierta
    console.log('\n💡 La conexión está activa. Presiona Ctrl+C para salir.');
    
    // No cerrar la conexión
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('\n👋 Conexión cerrada.');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }
};

connectDB();
"@
        
        $tempFile = Join-Path $env:TEMP "mongodb-connect-temp.js"
        $tempScript | Out-File -FilePath $tempFile -Encoding UTF8
        
        & node $tempFile
        
        # Limpiar archivo temporal
        Remove-Item $tempFile -ErrorAction SilentlyContinue
    } else {
        Write-Host "❌ Node.js no está instalado" -ForegroundColor Red
        Write-Host "Por favor, instala Node.js o mongosh para continuar." -ForegroundColor Yellow
        exit 1
    }
}
