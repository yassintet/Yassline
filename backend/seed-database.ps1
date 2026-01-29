# Script PowerShell para poblar la base de datos MongoDB directamente
# Uso: .\seed-database.ps1

Write-Host "🌱 Poblando base de datos MongoDB desde PowerShell..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
$backendPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $backendPath

# Verificar que Node.js está instalado
$nodePath = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodePath) {
    Write-Host "❌ Error: Node.js no está instalado" -ForegroundColor Red
    Write-Host "Por favor, instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js encontrado: $($nodePath.Source)" -ForegroundColor Green

# Verificar que existe el script seed.js
$seedScript = Join-Path $backendPath "scripts\seed.js"
if (-not (Test-Path $seedScript)) {
    Write-Host "❌ Error: No se encontró scripts\seed.js" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Script seed encontrado: $seedScript" -ForegroundColor Green

# Verificar que existe .env
$envFile = Join-Path $backendPath ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Error: No se encontró .env" -ForegroundColor Red
    Write-Host "Por favor, crea el archivo .env con MONGO_URI" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Archivo .env encontrado" -ForegroundColor Green
Write-Host ""

# Verificar dependencias
Write-Host "📦 Verificando dependencias..." -ForegroundColor Cyan
$nodeModules = Join-Path $backendPath "node_modules"
if (-not (Test-Path $nodeModules)) {
    Write-Host "⚠️  node_modules no encontrado. Instalando dependencias..." -ForegroundColor Yellow
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencias encontradas" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Ejecutando script de seed..." -ForegroundColor Cyan
Write-Host ""

# Ejecutar el script seed
& npm run seed

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Base de datos poblada exitosamente!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error al poblar la base de datos" -ForegroundColor Red
    exit 1
}
