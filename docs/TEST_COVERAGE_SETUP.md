# Configuración de Cobertura de Tests con SonarQube

## Resumen

Se ha configurado exitosamente la cobertura de tests con Jest y SonarQube Cloud con un objetivo del 90%.

## Archivos Configurados

### 1. `sonar-project.properties`

Archivo de configuración de SonarQube con:
- **projectKey**: `lesquel_mesaYa_Res`
- **organization**: `lesquel`
- **Rutas de cobertura**: `coverage/lcov.info`
- **Exclusiones**: node_modules, dist, coverage, tests, seed, types

### 2. `package.json` - Configuración de Jest

Se agregaron las siguientes configuraciones:

```json
{
  "coverageDirectory": "../coverage",
  "coverageReporters": ["text", "text-summary", "html", "lcov"],
  "coverageThreshold": {
    "global": {
      "branches": 90,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  },
  "collectCoverageFrom": [
    "**/*.(t|j)s",
    "!**/seed/**",
    "!**/types/**",
    "!**/*.spec.ts",
    "!**/*.e2e-spec.ts",
    "!**/main.ts",
    "!**/app.module.ts",
    "!**/node_modules/**"
  ]
}
```

## Uso

### Generar Reporte de Cobertura

```bash
npm run test:cov
```

Este comando:
1. Ejecuta todos los tests
2. Genera reportes de cobertura en formato LCOV, HTML y texto
3. Crea el archivo `coverage/lcov.info` requerido por SonarQube

### Ver Reporte HTML Localmente

Abrir el archivo: `coverage/index.html` en un navegador

### Integración con SonarQube (CI/CD)

Para integrar con SonarQube en tu pipeline de CI/CD:

```bash
# 1. Ejecutar tests y generar cobertura
npm run test:cov

# 2. Ejecutar análisis de SonarQube
sonar-scanner
```

**Nota**: Necesitas tener `sonar-scanner` instalado y configurado con tu token de SonarQube Cloud.

#### Ejemplo para GitHub Actions

```yaml
- name: Run tests with coverage
  run: npm run test:cov

- name: SonarQube Scan
  uses: SonarSource/sonarqube-scan-action@master
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

## Estado Actual

- ✅ Configuración completa
- ✅ Generación de reportes LCOV funcionando
- ✅ Umbral de cobertura configurado al 90%
- ⚠️ Cobertura actual: ~1% (necesita escribir más tests)

## Próximos Pasos

1. **Escribir más tests unitarios** para alcanzar el objetivo del 90%
2. **Configurar CI/CD** con SonarQube Scanner
3. **Revisar exclusiones** en `sonar-project.properties` según necesidades del proyecto
4. **Monitorear cobertura** en SonarQube Cloud dashboard

## Estructura de Archivos de Cobertura

```
coverage/
├── lcov.info          # Formato LCOV para SonarQube
├── index.html         # Reporte HTML visual
└── src/               # Reportes detallados por archivo
```

## Notas Importantes

- El comando `npm run test:cov` fallará si la cobertura es menor al 90% (comportamiento esperado)
- Los archivos en `seed/`, `types/`, y tests están excluidos del análisis de cobertura
- El reporte se regenera completamente en cada ejecución
- La carpeta `coverage/` NO debe subirse a git (ya está en `.gitignore`)
