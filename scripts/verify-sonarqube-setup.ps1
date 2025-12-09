# Script para verificar la configuración de SonarQube localmente
# Uso: .\scripts\verify-sonarqube-setup.ps1

Write-Host "Verificando configuracion de SonarQube...`n" -ForegroundColor Cyan

$errors = 0

# Funcion para verificar archivos
function Test-FileExists {
    param($Path)
    if (Test-Path $Path) {
        Write-Host "[OK] $Path existe" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "[ERROR] $Path NO existe" -ForegroundColor Red
        return $false
    }
}

# Funcion para verificar contenido en archivo
function Test-FileContent {
    param($Path, $Content)
    if (Test-Path $Path) {
        if (Select-String -Path $Path -Pattern $Content -Quiet) {
            Write-Host "[OK] $Path contiene '$Content'" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "[ERROR] $Path NO contiene '$Content'" -ForegroundColor Red
            return $false
        }
    }
    else {
        Write-Host "[ERROR] $Path no existe" -ForegroundColor Red
        return $false
    }
}

# 1. Verificar archivos principales
Write-Host "[1/6] Verificando archivos de configuracion..." -ForegroundColor Yellow
if (-not (Test-FileExists "sonar-project.properties")) { $errors++ }
if (-not (Test-FileExists ".github\workflows\sonarqube.yml")) { $errors++ }
if (-not (Test-FileExists ".github\workflows\ci.yml")) { $errors++ }
if (-not (Test-FileExists "package.json")) { $errors++ }
Write-Host ""

# 2. Verificar configuracion en sonar-project.properties
Write-Host "[2/6] Verificando sonar-project.properties..." -ForegroundColor Yellow
if (-not (Test-FileContent "sonar-project.properties" "sonar.projectKey=lesquel_mesaYa_Res")) { $errors++ }
if (-not (Test-FileContent "sonar-project.properties" "sonar.organization=lesquel")) { $errors++ }
if (-not (Test-FileContent "sonar-project.properties" "sonar.javascript.lcov.reportPaths=coverage/lcov.info")) { $errors++ }
Write-Host ""

# 3. Verificar configuracion de Jest en package.json
Write-Host "[3/6] Verificando configuracion de Jest..." -ForegroundColor Yellow
if (-not (Test-FileContent "package.json" "coverageThreshold")) { $errors++ }
if (-not (Test-FileContent "package.json" '"coverageDirectory": "../coverage"')) { $errors++ }
if (-not (Test-FileContent "package.json" '"test:cov"')) { $errors++ }
Write-Host ""

# 4. Verificar que existe el script de tests
Write-Host "[4/6] Verificando scripts de npm..." -ForegroundColor Yellow
try {
    $testScript = (Get-Content package.json | ConvertFrom-Json).scripts.'test:cov'
    if ($testScript) {
        Write-Host "[OK] Script 'test:cov' esta disponible" -ForegroundColor Green
    }
    else {
        Write-Host "[ERROR] Script 'test:cov' NO esta definido" -ForegroundColor Red
        $errors++
    }
}
catch {
    Write-Host "[WARN] No se pudo verificar el script 'test:cov'" -ForegroundColor Yellow
}
Write-Host ""

# 5. Verificar que las dependencias estan instaladas
Write-Host "[5/6] Verificando dependencias..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "[OK] node_modules existe" -ForegroundColor Green
    
    if (Test-Path "node_modules\jest") {
        Write-Host "[OK] Jest esta instalado" -ForegroundColor Green
    }
    else {
        Write-Host "[ERROR] Jest NO esta instalado" -ForegroundColor Red
        $errors++
    }
}
else {
    Write-Host "[ERROR] node_modules NO existe" -ForegroundColor Red
    Write-Host "[WARN] Ejecuta: npm install" -ForegroundColor Yellow
    $errors++
}
Write-Host ""

# 6. Intentar generar reporte de cobertura
Write-Host "[6/6] Verificando reporte de cobertura..." -ForegroundColor Yellow
if (Test-Path "coverage\lcov.info") {
    Write-Host "[OK] coverage\lcov.info existe" -ForegroundColor Green
    
    $size = (Get-Item "coverage\lcov.info").Length
    Write-Host "   Tamano: $size bytes" -ForegroundColor Gray
    
    if ($size -gt 0) {
        Write-Host "[OK] El archivo lcov.info contiene datos" -ForegroundColor Green
    }
    else {
        Write-Host "[WARN] El archivo lcov.info esta vacio" -ForegroundColor Yellow
    }
}
else {
    Write-Host "[WARN] coverage\lcov.info no existe aun" -ForegroundColor Yellow
    Write-Host "   Ejecuta: npm run test:cov" -ForegroundColor Gray
}
Write-Host ""

# 7. Verificar GitHub Secrets (solo advertencia)
Write-Host "[INFO] Recordatorio sobre GitHub Secrets..." -ForegroundColor Yellow
Write-Host "[WARN] Asegurate de configurar el secret SONAR_TOKEN en GitHub:" -ForegroundColor Yellow
Write-Host "   1. Ve a GitHub > Settings > Secrets > Actions" -ForegroundColor Gray
Write-Host "   2. Crea un secret llamado: SONAR_TOKEN" -ForegroundColor Gray
Write-Host "   3. Valor: Tu token de SonarQube Cloud" -ForegroundColor Gray
Write-Host ""

# Resumen final
Write-Host "========================================" -ForegroundColor Cyan
if ($errors -eq 0) {
    Write-Host "[OK] Configuracion completada correctamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Configura SONAR_TOKEN en GitHub Secrets" -ForegroundColor Gray
    Write-Host "2. Haz push a tu repositorio: git push origin main" -ForegroundColor Gray
    Write-Host "3. Ve a GitHub Actions para ver el analisis" -ForegroundColor Gray
    Write-Host "4. Revisa los resultados en SonarQube Cloud" -ForegroundColor Gray
}
else {
    Write-Host "[ERROR] Se encontraron $errors errores" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, corrige los errores antes de continuar." -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan
