# Script PowerShell para configurar .env local de forma segura
# Este script SOLO afecta tu entorno local, NO afecta producción

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURACIÓN .env LOCAL (DESARROLLO)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Esto solo afecta tu entorno LOCAL" -ForegroundColor Yellow
Write-Host "    No afecta yassline.com ni Railway" -ForegroundColor Yellow
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "server.js")) {
    Write-Host "❌ Error: Ejecuta este script desde la carpeta backend" -ForegroundColor Red
    exit 1
}

# Verificar si .env ya existe
$envExists = Test-Path ".env"
if ($envExists) {
    Write-Host "📄 Archivo .env encontrado" -ForegroundColor Green
    Write-Host ""
    Write-Host "¿Qué deseas hacer?" -ForegroundColor Cyan
    Write-Host "1. Crear nuevo .env desde .env.example" -ForegroundColor White
    Write-Host "2. Actualizar solo MONGO_URI en .env existente" -ForegroundColor White
    Write-Host "3. Cancelar" -ForegroundColor White
    Write-Host ""
    $opcion = Read-Host "Selecciona una opción (1-3)"
    
    if ($opcion -eq "3") {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
        exit 0
    }
} else {
    $opcion = "1"
}

# Opción 1: Crear nuevo .env
if ($opcion -eq "1") {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Archivo .env creado desde .env.example" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env.example no encontrado, creando .env básico..." -ForegroundColor Yellow
$envTemplate = @"
PORT=4000
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/nombre-database?retryWrites=true`&w=majority
MONGO_PASSWORD=tu-password-aqui
JWT_SECRET=tu-secret-key-super-segura-aqui-cambiar-en-produccion
NODE_ENV=development

# Email Configuration
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-app-password-de-gmail

# Configuración de la empresa
COMPANY_NAME=Yassline Tour
COMPANY_EMAIL=info@yassline.com
COMPANY_ADDRESS=Marruecos
COMPANY_PHONE=+212 XXX XXX XXX
ADMIN_EMAIL=admin@yassline.com
"@
        $envTemplate | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✅ Archivo .env básico creado" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CONFIGURAR MONGO_URI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Necesitas tu cadena de conexión de MongoDB Atlas" -ForegroundColor Yellow
Write-Host ""
Write-Host "Formato esperado:" -ForegroundColor Cyan
Write-Host "mongodb+srv://usuario:contraseña@cluster.mongodb.net/nombre-database?retryWrites=true`&w=majority" -ForegroundColor Gray
Write-Host ""
Write-Host "Si ya tienes una URI configurada en Railway, puedes usar la misma" -ForegroundColor Yellow
Write-Host "pero recuerda: esta configuración SOLO es para desarrollo local" -ForegroundColor Yellow
Write-Host ""

# Información basada en los archivos de documentación
Write-Host "Informacion encontrada en tu proyecto:" -ForegroundColor Cyan
Write-Host "   Usuario: yasslinetour_db_user" -ForegroundColor Gray
Write-Host "   Cluster: yassline.v3oycnj.mongodb.net" -ForegroundColor Gray
Write-Host "   Base de datos: yasslinetour" -ForegroundColor Gray
Write-Host ""
Write-Host "   Necesitarás tu contraseña de MongoDB Atlas" -ForegroundColor Yellow
Write-Host ""

$mongoUri = Read-Host "Ingresa tu MONGO_URI completa (o presiona Enter para usar plantilla)"

if ([string]::IsNullOrWhiteSpace($mongoUri)) {
    Write-Host ""
    Write-Host "Usando plantilla. Necesitarás editar manualmente con tu contraseña:" -ForegroundColor Yellow
    $mongoUri = "mongodb+srv://yasslinetour_db_user:TU_PASSWORD_AQUI@yassline.v3oycnj.mongodb.net/yasslinetour?retryWrites=true`&w=majority`&appName=Yassline"
    Write-Host "MONGO_URI=$mongoUri" -ForegroundColor Gray
}

# Leer el archivo .env
$envContent = Get-Content ".env" -Raw

# Reemplazar MONGO_URI
if ($envContent -match "MONGO_URI=.*") {
    $envContent = $envContent -replace "MONGO_URI=.*", "MONGO_URI=$mongoUri"
    Write-Host "✅ MONGO_URI actualizada" -ForegroundColor Green
} else {
    # Agregar MONGO_URI si no existe
    $envContent += "`nMONGO_URI=$mongoUri`n"
    Write-Host "✅ MONGO_URI agregada" -ForegroundColor Green
}

# Asegurar que NODE_ENV=development
if ($envContent -match "NODE_ENV=.*") {
    $envContent = $envContent -replace "NODE_ENV=.*", "NODE_ENV=development"
} else {
    $envContent += "`nNODE_ENV=development`n"
}

# Guardar el archivo
$envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "CONFIGURACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Archivo .env configurado para desarrollo local" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Verificar conexión: node verify-db.js" -ForegroundColor White
Write-Host "2. Si la base de datos está vacía: npm run seed" -ForegroundColor White
Write-Host "3. Iniciar servidor: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  RECUERDA: Este .env SOLO afecta tu entorno local" -ForegroundColor Yellow
Write-Host "    yassline.com usa las variables de Railway" -ForegroundColor Yellow
Write-Host ""
