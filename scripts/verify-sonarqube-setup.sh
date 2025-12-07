#!/bin/bash

# Script para verificar la configuración de SonarQube localmente
# Uso: ./scripts/verify-sonarqube-setup.sh

echo "🔍 Verificando configuración de SonarQube..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar archivos
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 existe"
        return 0
    else
        echo -e "${RED}✗${NC} $1 NO existe"
        return 1
    fi
}

# Función para verificar contenido en archivo
check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 contiene '$2'"
        return 0
    else
        echo -e "${RED}✗${NC} $1 NO contiene '$2'"
        return 1
    fi
}

errors=0

# 1. Verificar archivos principales
echo "📁 Verificando archivos de configuración..."
check_file "sonar-project.properties" || ((errors++))
check_file ".github/workflows/sonarqube.yml" || ((errors++))
check_file ".github/workflows/ci.yml" || ((errors++))
check_file "package.json" || ((errors++))
echo ""

# 2. Verificar configuración en sonar-project.properties
echo "⚙️  Verificando sonar-project.properties..."
check_content "sonar-project.properties" "sonar.projectKey=lesquel_mesaYa_Res" || ((errors++))
check_content "sonar-project.properties" "sonar.organization=lesquel" || ((errors++))
check_content "sonar-project.properties" "sonar.javascript.lcov.reportPaths=coverage/lcov.info" || ((errors++))
echo ""

# 3. Verificar configuración de Jest en package.json
echo "🧪 Verificando configuración de Jest..."
check_content "package.json" "coverageThreshold" || ((errors++))
check_content "package.json" '"coverageDirectory": "../coverage"' || ((errors++))
check_content "package.json" '"test:cov"' || ((errors++))
echo ""

# 4. Verificar que existe el script de tests
echo "📝 Verificando scripts de npm..."
if npm run test:cov --version &> /dev/null; then
    echo -e "${GREEN}✓${NC} Script 'test:cov' está disponible"
else
    echo -e "${YELLOW}⚠${NC} No se pudo verificar el script 'test:cov'"
fi
echo ""

# 5. Verificar que las dependencias están instaladas
echo "📦 Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules existe"
    
    if [ -d "node_modules/jest" ]; then
        echo -e "${GREEN}✓${NC} Jest está instalado"
    else
        echo -e "${RED}✗${NC} Jest NO está instalado"
        ((errors++))
    fi
else
    echo -e "${RED}✗${NC} node_modules NO existe"
    echo -e "${YELLOW}⚠${NC} Ejecuta: npm install"
    ((errors++))
fi
echo ""

# 6. Intentar generar reporte de cobertura
echo "🔬 Intentando generar reporte de cobertura..."
if npm run test:cov > /dev/null 2>&1 || [ -f "coverage/lcov.info" ]; then
    if [ -f "coverage/lcov.info" ]; then
        echo -e "${GREEN}✓${NC} coverage/lcov.info se generó correctamente"
        
        # Verificar tamaño del archivo
        size=$(wc -c < "coverage/lcov.info")
        echo -e "   Tamaño: ${size} bytes"
        
        if [ "$size" -gt 0 ]; then
            echo -e "${GREEN}✓${NC} El archivo lcov.info contiene datos"
        else
            echo -e "${YELLOW}⚠${NC} El archivo lcov.info está vacío"
        fi
    else
        echo -e "${YELLOW}⚠${NC} No se pudo verificar coverage/lcov.info"
    fi
else
    echo -e "${YELLOW}⚠${NC} No se pudo generar el reporte de cobertura"
    echo "   Esto puede ser normal si no hay tests escritos aún"
fi
echo ""

# 7. Verificar GitHub Secrets (solo advertencia)
echo "🔐 Recordatorio sobre GitHub Secrets..."
echo -e "${YELLOW}⚠${NC} Asegúrate de configurar el secret SONAR_TOKEN en GitHub:"
echo "   1. Ve a GitHub → Settings → Secrets → Actions"
echo "   2. Crea un secret llamado: SONAR_TOKEN"
echo "   3. Valor: Tu token de SonarQube Cloud"
echo ""

# Resumen final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✓ Configuración completada correctamente${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. Configura SONAR_TOKEN en GitHub Secrets"
    echo "2. Haz push a tu repositorio"
    echo "3. Ve a GitHub Actions para ver el análisis"
    echo "4. Revisa los resultados en SonarQube Cloud"
else
    echo -e "${RED}✗ Se encontraron $errors errores${NC}"
    echo ""
    echo "Por favor, corrige los errores antes de continuar."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
