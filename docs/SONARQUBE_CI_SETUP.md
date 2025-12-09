# Configuración de SonarQube en CI/CD

## Resumen

Se ha configurado el análisis automático de SonarQube en GitHub Actions para ejecutarse en cada push y pull request.

## Archivos Creados

### 1. `.github/workflows/sonarqube.yml`

Workflow dedicado para análisis de SonarQube que:

- Se ejecuta en push a `main` y `develop`
- Se ejecuta en pull requests
- Genera reporte de cobertura con Jest
- Envía resultados a SonarQube Cloud
- Verifica el Quality Gate

### 2. `.github/workflows/ci.yml`

Workflow de CI general que:

- Ejecuta linting
- Compila el proyecto
- Ejecuta tests unitarios
- Ejecuta tests e2e

## Configuración Requerida en GitHub

### Paso 1: Obtener el Token de SonarQube Cloud

1. Ve a [SonarQube Cloud](https://sonarcloud.io/)
2. Inicia sesión con tu cuenta de GitHub
3. Ve a **My Account** → **Security**
4. Genera un nuevo token:
   - Name: `GitHub Actions`
   - Type: `User Token`
   - Expiration: Elige según tu preferencia
5. **Copia el token** (no podrás verlo nuevamente)

### Paso 2: Configurar el Secret en GitHub

1. Ve a tu repositorio en GitHub: `https://github.com/lesquel/mesaYa_Res`
2. Ve a **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Agrega el secret:
   - **Name**: `SONAR_TOKEN`
   - **Value**: Pega el token que copiaste de SonarQube
5. Click en **Add secret**

### Paso 3: Configurar el Proyecto en SonarQube Cloud

1. Ve a [SonarQube Cloud](https://sonarcloud.io/)
2. Click en el símbolo **+** en la esquina superior derecha
3. Selecciona **Analyze new project**
4. Selecciona tu repositorio `mesaYa_Res`
5. Configura el proyecto:
   - **Project Key**: `lesquel_mesaYa_Res` (ya configurado en `sonar-project.properties`)
   - **Organization**: `lesquel` (ya configurado)
6. En **Analysis Method**, selecciona **With GitHub Actions**
7. SonarQube te mostrará instrucciones (ya las hemos implementado)

## Verificación de la Configuración

### 1. Verificar que los archivos existan

```bash
ls .github/workflows/
# Deberías ver: ci.yml y sonarqube.yml
```

### 2. Verificar el sonar-project.properties

```bash
cat sonar-project.properties
```

Debe contener:

```properties
sonar.projectKey=lesquel_mesaYa_Res
sonar.organization=lesquel
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info
```

### 3. Hacer Push y Verificar

```bash
git add .
git commit -m "ci: add SonarQube and CI workflows"
git push origin main
```

### 4. Verificar la Ejecución

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Deberías ver dos workflows ejecutándose:
   - ✅ **CI** - Build and Test
   - ✅ **SonarQube Analysis** - SonarQube Scan

## Visualizar Resultados en SonarQube Cloud

1. Ve a [SonarQube Cloud](https://sonarcloud.io/)
2. Selecciona tu proyecto `mesaYa_Res`
3. Verás el dashboard con:
   - **Code Coverage**: Porcentaje de cobertura actual
   - **Bugs**: Problemas de código detectados
   - **Vulnerabilities**: Problemas de seguridad
   - **Code Smells**: Problemas de calidad
   - **Security Hotspots**: Puntos críticos de seguridad
   - **Duplications**: Código duplicado

## Quality Gate

El Quality Gate está configurado para:

- ✅ Verificar automáticamente la calidad del código
- ⚠️ Continuar aunque falle (configurable)
- 📊 Mostrar el estado en el workflow

### Para que el workflow falle si no pasa el Quality Gate:

Edita `.github/workflows/sonarqube.yml` y cambia:

```yaml
continue-on-error: true
```

Por:

```yaml
continue-on-error: false
```

## Badges para el README

Puedes agregar badges de SonarQube a tu README.md:

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=lesquel_mesaYa_Res&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=lesquel_mesaYa_Res)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=lesquel_mesaYa_Res&metric=coverage)](https://sonarcloud.io/summary/new_code?id=lesquel_mesaYa_Res)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=lesquel_mesaYa_Res&metric=bugs)](https://sonarcloud.io/summary/new_code?id=lesquel_mesaYa_Res)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=lesquel_mesaYa_Res&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=lesquel_mesaYa_Res)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=lesquel_mesaYa_Res&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=lesquel_mesaYa_Res)
```

## Troubleshooting

### Error: "SONAR_TOKEN not found"

**Solución**: Verifica que agregaste el secret `SONAR_TOKEN` en GitHub Settings → Secrets.

### Error: "Shallow clone detected"

**Solución**: El workflow ya incluye `fetch-depth: 0` para evitar este problema.

### Error: "Project not found in SonarQube"

**Solución**: Asegúrate de haber creado el proyecto en SonarQube Cloud con el mismo `projectKey`.

### La cobertura no aparece en SonarQube

**Soluciones**:

1. Verifica que `coverage/lcov.info` se está generando: `ls coverage/`
2. Verifica que el path en `sonar-project.properties` es correcto
3. Revisa los logs del workflow de GitHub Actions

### Tests fallan en CI pero funcionan localmente

**Soluciones**:

1. Verifica las variables de entorno necesarias
2. Asegúrate de que las dependencias están correctamente instaladas
3. Revisa si hay diferencias entre el entorno local y CI (base de datos, servicios externos, etc.)

## Configuración Adicional (Opcional)

### Análisis de Pull Requests

El workflow ya está configurado para analizar pull requests. SonarQube mostrará:

- ✅ Nuevos bugs introducidos
- ✅ Nueva deuda técnica
- ✅ Cambios en la cobertura
- ✅ Comentarios directamente en el PR

### Notificaciones

Configura notificaciones en SonarQube Cloud:

1. Ve a **Project Settings** → **Notifications**
2. Configura notificaciones por email o Slack
3. Recibe alertas cuando:
   - El Quality Gate falla
   - Nuevos problemas son detectados
   - La cobertura disminuye

## Mantenimiento

### Actualizar el Token

Si el token expira:

1. Genera un nuevo token en SonarQube Cloud
2. Actualiza el secret `SONAR_TOKEN` en GitHub

### Modificar Exclusiones

Edita `sonar-project.properties` para agregar/remover archivos del análisis:

```properties
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**
```

### Ajustar Quality Gate

En SonarQube Cloud:

1. Ve a **Quality Gates**
2. Selecciona o crea un Quality Gate personalizado
3. Asigna el Quality Gate a tu proyecto

## Recursos

- [SonarQube Cloud](https://sonarcloud.io/)
- [Documentación de SonarQube](https://docs.sonarqube.org/latest/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SonarQube GitHub Action](https://github.com/SonarSource/sonarqube-scan-action)

## Estado Actual

- ✅ Workflows de CI/CD creados
- ✅ Configuración de SonarQube lista
- ✅ Quality Gate configurado
- ⏳ **Pendiente**: Configurar `SONAR_TOKEN` en GitHub Secrets
- ⏳ **Pendiente**: Hacer push para ejecutar el primer análisis
