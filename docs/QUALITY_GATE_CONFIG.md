# 📊 Configuración del Quality Gate de SonarQube

## 🎯 Estado Actual

El análisis de SonarQube funciona correctamente, pero el **Quality Gate está fallando** debido a la baja cobertura de tests (~1-2%).

## ✅ Solución: Ajustar Quality Gate en SonarQube Cloud

### Paso 1: Accede a la Configuración del Quality Gate

1. Ve a: https://sonarcloud.io/project/quality_gates/show?id=lesquel_mesaYa_Res
2. O navega: Tu Proyecto > **Quality Gates** > **Project Settings**

### Paso 2: Opciones de Configuración

#### Opción A: Usar un Quality Gate más Permisivo (Recomendado para Inicio)

1. En SonarQube Cloud, ve a **Project Settings** > **Quality Gate**
2. Selecciona **"Sonar way - Minimal"** en lugar de "Sonar way"
   - Este tiene requisitos más bajos de cobertura
3. Guarda los cambios

#### Opción B: Crear un Quality Gate Personalizado

1. Ve a **Organization Settings** > **Quality Gates**
2. Click en **"Create"**
3. Nombre: `Development Gate` o `Progressive Coverage`
4. Configura las condiciones:

```yaml
Condiciones Sugeridas para Desarrollo:
├─ Coverage on New Code: > 20%  (en lugar de 80%)
├─ Duplicated Lines: < 5%
├─ Maintainability Rating: A
├─ Reliability Rating: A
└─ Security Rating: A
```

5. Asigna este Quality Gate a tu proyecto

#### Opción C: Desactivar Verificación de Coverage (Temporal)

1. Ve a **Project Settings** > **Quality Gate**
2. Edita las condiciones actuales
3. **Elimina** o **desactiva** la condición de "Coverage on New Code"
4. Guarda

### Paso 3: Plan de Cobertura Progresiva

Una vez configurado un Quality Gate permisivo, incrementa gradualmente:

**Sprint 1-2:** Quality Gate con 20% coverage

```yaml
Coverage on New Code: > 20%
```

**Sprint 3-4:** Incrementar a 40%

```yaml
Coverage on New Code: > 40%
```

**Sprint 5-6:** Incrementar a 60%

```yaml
Coverage on New Code: > 60%
```

**Sprint 7+:** Meta final 80%

```yaml
Coverage on New Code: > 80%
```

## 🔄 Alternativa: Mantener Quality Gate Estricto

Si prefieres mantener el Quality Gate estricto (80% coverage) pero permitir que el CI pase:

### Ya está configurado en tu workflow:

```yaml
continue-on-error: true # Ya lo tienes
```

Esto permite que:

- ✅ El workflow de GitHub Actions pase (verde)
- ⚠️ SonarQube siga reportando las métricas reales
- 📊 Puedas ver el progreso sin bloquear deployments

## 📈 Estrategia Recomendada

1. **Ahora (Semana 1):**
   - Usar "Sonar way - Minimal" Quality Gate
   - O configurar coverage mínimo en 20%
   - Esto desbloquea el workflow

2. **Corto Plazo (Mes 1):**
   - Escribir tests para módulos críticos:
     - Autenticación: 90%+
     - Pagos: 90%+
     - Reservaciones: 85%+
     - Entidades de dominio: 80%+

3. **Mediano Plazo (Mes 2-3):**
   - Incrementar Quality Gate progresivamente
   - Meta: 60-70% cobertura general

4. **Largo Plazo (Mes 4+):**
   - Meta: 80-90% cobertura en código crítico
   - 70%+ en código general

## 🛠️ Scripts de Ayuda

### Verificar Cobertura Actual

```bash
npm test -- --coverage --coverageReporters=text-summary
```

### Ver Archivos sin Cobertura

```bash
npm test -- --coverage --coverageReporters=lcov
# Luego abre: coverage/lcov-report/index.html
```

## 📊 Métricas Actuales vs Objetivos

| Métrica    | Actual | Objetivo Corto Plazo | Objetivo Final |
| ---------- | ------ | -------------------- | -------------- |
| Statements | ~1%    | 30%                  | 80%            |
| Branches   | ~1%    | 25%                  | 75%            |
| Functions  | ~1%    | 35%                  | 85%            |
| Lines      | ~1%    | 30%                  | 80%            |

## 🎯 Próximos Pasos

1. **Inmediato:** Ajusta el Quality Gate en SonarQube Cloud (Opción A o B)
2. **Esta semana:** Escribe tests para 3-5 módulos críticos
3. **Este mes:** Alcanza 30% de cobertura general
4. **Próximos meses:** Incrementa progresivamente hasta 80%

---

**Tiempo estimado para configurar:** 5 minutos
**Impacto:** Workflow pasará en verde mientras trabajas en aumentar cobertura
