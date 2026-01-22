# Script de prueba para la API de Yassline Tour
# Ejecutar desde PowerShell: .\test-api.ps1

$baseUrl = "http://localhost:4000"

Write-Host "`n🧪 Probando API de Yassline Tour...`n" -ForegroundColor Cyan

# 1. Ruta principal
Write-Host "1. Probando ruta principal..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl" -Method Get
    Write-Host "✅ Respuesta: $($response.message)" -ForegroundColor Green
    Write-Host "   Endpoints disponibles: $($response.endpoints | ConvertTo-Json -Compress)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# 2. Obtener todos los circuitos
Write-Host "2. Probando GET /api/circuits..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/circuits" -Method Get
    Write-Host "✅ Encontrados $($response.count) circuitos" -ForegroundColor Green
    if ($response.data) {
        Write-Host "   Primer circuito: $($response.data[0].name)`n" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# 3. Obtener circuito por slug
Write-Host "3. Probando GET /api/circuits/slug/gran-tour-imperial..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/circuits/slug/gran-tour-imperial" -Method Get
    Write-Host "✅ Circuito encontrado: $($response.data.name)" -ForegroundColor Green
    Write-Host "   Precio: $($response.data.priceLabel)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# 4. Obtener vehículos
Write-Host "4. Probando GET /api/vehicles..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/vehicles" -Method Get
    Write-Host "✅ Encontrados $($response.count) vehículos" -ForegroundColor Green
    if ($response.data) {
        Write-Host "   Vehículos: $($response.data.name -join ', ')`n" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# 5. Obtener servicios de transporte
Write-Host "5. Probando GET /api/transport..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/transport" -Method Get
    Write-Host "✅ Encontrados $($response.count) servicios" -ForegroundColor Green
    if ($response.data) {
        Write-Host "   Servicios: $($response.data.name -join ', ')`n" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

# 6. Login
Write-Host "6. Probando POST /api/auth/login..." -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@yassline.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Login exitoso!" -ForegroundColor Green
    Write-Host "   Token recibido: $($response.token.Substring(0, 20))...`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
}

Write-Host "`n✨ Pruebas completadas!`n" -ForegroundColor Cyan
