# Script PowerShell para verificar el estado de la base de datos MongoDB
# Uso: .\verify-database.ps1

Write-Host "🔍 Verificando estado de la base de datos MongoDB..." -ForegroundColor Cyan
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

# Cambiar al directorio backend
Set-Location $PSScriptRoot

# Verificar que existe el script de verificación
$verifyScript = Join-Path $PSScriptRoot "verify-db.js"
if (-not (Test-Path $verifyScript)) {
    Write-Host "❌ Error: verify-db.js no encontrado" -ForegroundColor Red
    exit 1
}

# Ejecutar script
& node $verifyScript

$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "✅ Verificación completada!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Error en la verificación" -ForegroundColor Red
    exit $exitCode
}
