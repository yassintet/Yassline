# Script simple para configurar MONGO_URI en .env local
# SOLO afecta desarrollo local, NO afecta produccion

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURAR MONGO_URI (SOLO LOCAL)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE: Esto solo afecta tu entorno LOCAL" -ForegroundColor Yellow
Write-Host "            No afecta yassline.com ni Railway" -ForegroundColor Yellow
Write-Host ""

# Verificar que estamos en backend
if (-not (Test-Path "server.js")) {
    Write-Host "Error: Ejecuta desde la carpeta backend" -ForegroundColor Red
    exit 1
}

# Verificar si .env existe
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Archivo .env creado desde .env.example" -ForegroundColor Green
    } else {
        Write-Host "Creando .env basico..." -ForegroundColor Yellow
        "PORT=4000`nNODE_ENV=development`nMONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/nombre-database?retryWrites=true&w=majority" | Out-File -FilePath ".env" -Encoding UTF8
    }
}

Write-Host ""
Write-Host "Informacion de tu proyecto MongoDB:" -ForegroundColor Cyan
Write-Host "  Usuario: yasslinetour_db_user" -ForegroundColor Gray
Write-Host "  Cluster: yassline.v3oycnj.mongodb.net" -ForegroundColor Gray
Write-Host "  Base de datos: yasslinetour" -ForegroundColor Gray
Write-Host ""
Write-Host "Necesitas tu contraseña de MongoDB Atlas" -ForegroundColor Yellow
Write-Host ""
Write-Host "Formato completo:" -ForegroundColor Cyan
Write-Host "mongodb+srv://yasslinetour_db_user:TU_PASSWORD@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline" -ForegroundColor Gray
Write-Host ""

$password = Read-Host "Ingresa tu contraseña de MongoDB (o presiona Enter para usar plantilla)"

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host ""
    Write-Host "Usando plantilla. Edita manualmente .env con tu contraseña" -ForegroundColor Yellow
    $mongoUri = "mongodb+srv://yasslinetour_db_user:TU_PASSWORD_AQUI@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline"
} else {
    $mongoUri = "mongodb+srv://yasslinetour_db_user:$password@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true&w=majority&appName=Yassline"
}

# Leer .env
$envLines = Get-Content ".env"
$newEnvLines = @()

$mongoUriUpdated = $false
foreach ($line in $envLines) {
    if ($line -match "^MONGO_URI=") {
        $newEnvLines += "MONGO_URI=$mongoUri"
        $mongoUriUpdated = $true
    } else {
        $newEnvLines += $line
    }
}

# Si no se encontró MONGO_URI, agregarlo
if (-not $mongoUriUpdated) {
    $newEnvLines += "MONGO_URI=$mongoUri"
}

# Asegurar NODE_ENV=development
$nodeEnvUpdated = $false
for ($i = 0; $i -lt $newEnvLines.Length; $i++) {
    if ($newEnvLines[$i] -match "^NODE_ENV=") {
        $newEnvLines[$i] = "NODE_ENV=development"
        $nodeEnvUpdated = $true
        break
    }
}
if (-not $nodeEnvUpdated) {
    $newEnvLines += "NODE_ENV=development"
}

# Guardar
$newEnvLines | Out-File -FilePath ".env" -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "CONFIGURACION COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Archivo .env actualizado para desarrollo local" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Cyan
Write-Host "1. Verificar conexion: node verify-db.js" -ForegroundColor White
Write-Host "2. Si BD vacia: npm run seed" -ForegroundColor White
Write-Host "3. Iniciar servidor: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "RECUERDA: Este .env SOLO afecta localhost" -ForegroundColor Yellow
Write-Host "          yassline.com usa variables de Railway" -ForegroundColor Yellow
Write-Host ""
