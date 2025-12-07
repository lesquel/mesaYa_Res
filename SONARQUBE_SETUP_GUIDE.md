# Guía Rápida: Configuración de SonarQube Cloud

## ✅ Paso 3 Completado - CI/CD Configurado

Se han creado los siguientes archivos para integración con SonarQube Cloud:

### Archivos Creados
- ✅ `.github/workflows/sonarqube.yml` - Workflow para análisis de SonarQube
- ✅ `.github/workflows/ci.yml` - Workflow de CI general
- ✅ `scripts/verify-sonarqube-setup.ps1` - Script de verificación (Windows)
- ✅ `scripts/verify-sonarqube-setup.sh` - Script de verificación (Linux/Mac)

## 🚀 Instrucciones Paso a Paso

### Paso 1: Obtener Token de SonarQube Cloud

1. **Visita SonarQube Cloud**
   - Ve a: https://sonarcloud.io/
   - Click en **Log in** (esquina superior derecha)
   - Selecciona **GitHub** para iniciar sesión

2. **Crear Token**
   - Click en tu avatar (esquina superior derecha)
   - Selecciona **My Account**
   - Ve a la pestaña **Security**
   - En la sección "Generate Tokens":
     - **Name**: `GitHub-Actions-mesaYa_Res`
     - **Type**: `Global Analysis Token`
     - **Expires in**: `90 days` (o según prefieras)
   - Click en **Generate**
   - **⚠️ IMPORTANTE**: Copia el token inmediatamente (no podrás verlo después)

### Paso 2: Configurar Secret en GitHub

1. **Ir al Repositorio**
   - Ve a: https://github.com/lesquel/mesaYa_Res

2. **Acceder a Settings**
   - Click en **Settings** (en la barra superior del repositorio)
   - En el menú lateral izquierdo, busca **Secrets and variables**
   - Click en **Actions**

3. **Crear el Secret**
   - Click en **New repository secret**
   - Llena el formulario:
     - **Name**: `SONAR_TOKEN` (exactamente así, sin cambios)
     - **Secret**: Pega el token que copiaste de SonarQube
   - Click en **Add secret**

4. **Verificar**
   - Deberías ver el secret `SONAR_TOKEN` en la lista
   - El valor estará oculto por seguridad

### Paso 3: Configurar Proyecto en SonarQube Cloud

1. **Importar Proyecto**
   - Ve a: https://sonarcloud.io/
   - Click en el símbolo **+** (esquina superior derecha)
   - Selecciona **Analyze new project**

2. **Seleccionar Repositorio**
   - Busca y selecciona tu repositorio: `mesaYa_Res`
   - Click en **Set Up**

3. **Configurar Organización** (si es la primera vez)
   - Si no tienes una organización, créala
   - **Organization name**: `lesquel` (o tu nombre de usuario GitHub)
   - Click en **Continue**

4. **Método de Análisis**
   - Selecciona **With GitHub Actions**
   - SonarQube mostrará instrucciones (ya las implementamos)
   - Puedes cerrar esta ventana

5. **Verificar Configuración del Proyecto**
   - Ve a **Project Settings** → **General Settings**
   - Verifica que:
     - **Project Key**: `lesquel_mesaYa_Res`
     - **Organization**: `lesquel`

### Paso 4: Hacer Push y Ejecutar

1. **Commit y Push**
   ```bash
   git add .
   git commit -m "ci: add SonarQube integration and CI/CD workflows"
   git push origin main
   ```

2. **Verificar Ejecución en GitHub**
   - Ve a: https://github.com/lesquel/mesaYa_Res/actions
   - Deberías ver dos workflows ejecutándose:
     - **CI** - Build and Test
     - **SonarQube Analysis** - SonarQube Scan

3. **Ver Resultados en SonarQube**
   - Ve a: https://sonarcloud.io/project/overview?id=lesquel_mesaYa_Res
   - Espera a que termine el análisis (2-5 minutos)
   - Verás el dashboard con métricas de calidad

## 📊 Dashboard de SonarQube

Una vez completado el análisis, verás:

### Métricas Principales
- **Bugs**: Errores de código que deben corregirse
- **Vulnerabilities**: Problemas de seguridad
- **Code Smells**: Problemas de mantenibilidad
- **Coverage**: Porcentaje de código cubierto por tests (~1% actual)
- **Duplications**: Porcentaje de código duplicado
- **Security Hotspots**: Código que requiere revisión de seguridad

### Quality Gate
- **Status**: Passed ✅ / Failed ❌
- Muestra si el código cumple con los estándares de calidad
- Por defecto requiere:
  - 0 nuevos bugs
  - 0 nuevas vulnerabilidades
  - Cobertura > 80% en código nuevo

## 🔄 Flujo Automático

Cada vez que hagas **push** o crees un **pull request**:

1. Se ejecuta el workflow de CI:
   - Instala dependencias
   - Ejecuta linting
   - Compila el proyecto
   - Ejecuta tests

2. Se ejecuta el workflow de SonarQube:
   - Genera reporte de cobertura
   - Envía código y métricas a SonarQube Cloud
   - Verifica Quality Gate
   - Comenta en PRs con resultados

## 🎯 Badges para README

Agrega estos badges a tu `README.md`:

\`\`\`markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=lesquel_mesaYa_Res&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=lesquel_mesaYa_Res)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=lesquel_mesaYa_Res&metric=coverage)](https://sonarcloud.io/summary/new_code?id=lesquel_mesaYa_Res)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=lesquel_mesaYa_Res&metric=bugs)](https://sonarcloud.io/summary/new_code?id=lesquel_mesaYa_Res)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=lesquel_mesaYa_Res&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=lesquel_mesaYa_Res)
\`\`\`

## 🛠️ Comandos Útiles

### Verificar Configuración Local
\`\`\`powershell
# Windows
.\scripts\verify-sonarqube-setup.ps1

# Linux/Mac
bash scripts/verify-sonarqube-setup.sh
\`\`\`

### Generar Reporte de Cobertura Local
\`\`\`bash
npm run test:cov
\`\`\`

### Ver Reporte HTML
Abrir: `coverage/index.html`

## ❓ Troubleshooting

### Error: "SONAR_TOKEN not found"
**Causa**: El secret no está configurado o tiene un nombre incorrecto.
**Solución**: Verifica que el secret se llame exactamente `SONAR_TOKEN` en GitHub Settings.

### Error: "Shallow clone detected"
**Causa**: Git clone superficial no permite análisis completo.
**Solución**: El workflow ya incluye `fetch-depth: 0`, no requiere acción.

### Error: "Project not found"
**Causa**: El proyecto no existe en SonarQube Cloud.
**Solución**: Completa el Paso 3 (Configurar Proyecto en SonarQube Cloud).

### Coverage no aparece
**Causa**: El archivo `coverage/lcov.info` no se generó o está vacío.
**Solución**: 
1. Ejecuta `npm run test:cov` localmente
2. Verifica que se cree el archivo `coverage/lcov.info`
3. Verifica los logs del workflow en GitHub Actions

### Workflow falla pero tests pasan localmente
**Posibles causas**:
1. Variables de entorno faltantes
2. Servicios externos (BD, Kafka) no disponibles en CI
3. Diferencias en dependencias

**Solución**:
1. Revisa los logs del workflow en GitHub Actions
2. Considera agregar `continue-on-error: true` temporalmente
3. Configura servicios necesarios en el workflow

## 📚 Recursos Adicionales

- [SonarQube Cloud Dashboard](https://sonarcloud.io/)
- [Documentación SonarQube](https://docs.sonarqube.org/latest/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Jest Coverage Docs](https://jestjs.io/docs/configuration#coveragethreshold-object)

## ✅ Checklist Final

- [ ] Token de SonarQube Cloud generado
- [ ] Secret `SONAR_TOKEN` configurado en GitHub
- [ ] Proyecto creado en SonarQube Cloud
- [ ] Cambios committeados y pusheados
- [ ] Workflows ejecutándose en GitHub Actions
- [ ] Primer análisis completado en SonarQube
- [ ] Badges agregados al README (opcional)

## 🎉 ¡Listo!

Tu proyecto ahora tiene:
- ✅ Análisis automático de calidad de código
- ✅ Reportes de cobertura de tests
- ✅ Quality Gate para mantener estándares
- ✅ Integración continua con GitHub Actions
- ✅ Dashboard visual en SonarQube Cloud

**Próximo objetivo**: Escribir tests para alcanzar 90% de cobertura 🚀
