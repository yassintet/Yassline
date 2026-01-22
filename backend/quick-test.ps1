# Prueba rapida de la API
Write-Host "`nProbando endpoints basicos...`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:4000"

# Test 1: Ruta principal
Write-Host "1. GET /" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri $baseUrl -ErrorAction Stop
    Write-Host "   OK: $($r.message)" -ForegroundColor Green
} catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Circuitos
Write-Host "`n2. GET /api/circuits" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "$baseUrl/api/circuits" -ErrorAction Stop
    Write-Host "   OK: $($r.count) circuitos encontrados" -ForegroundColor Green
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Write-Host "   Error $status : $($_.Exception.Message)" -ForegroundColor Red
    if ($status -eq 404) {
        Write-Host "   La ruta no esta registrada. Verifica los logs del servidor." -ForegroundColor Yellow
    }
}

Write-Host "`nPrueba completada`n" -ForegroundColor Cyan
