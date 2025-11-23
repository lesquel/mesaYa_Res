# Checklist Backend — Contrato y prácticas para evitar fricciones con Frontend

Este documento recoge la checklist práctica (y accionable) que el backend debe aplicar para mejorar la compatibilidad con el frontend, evitar regresiones y mantener la especificación OpenAPI sincronizada.

Resumen rápido:

- Unificar forma de respuestas (listas y entidades individuales).
- Asegurar que Update\* DTOs permitan o protejan cambios explícitos (o exponer endpoints dedicados para acciones como cambiar `status`).
- Documentar y soportar uploads `multipart/form-data` (campo `file`).
- Estandarizar errores JSON y mapear errores de DB a códigos 4xx cuando correspondan.
- Mantener la spec OpenAPI actualizada y probarla en CI.

---

## 1) Respuesta / shape canon (obligatorio)

- Lista (paginada): devolver siempre la misma forma, por ejemplo:

  200 OK
  {
  "data": [ ... ],
  "pagination": {
  "page": 1,
  "pageSize": 20,
  "total": 123,
  "totalPages": 7
  }
  }

- Entidad individual:

  200 OK
  {
  "data": { ... }
  }

- No mezclar `response.data` con `response.reservation` o `response.result`; normalizar y reflejar esto en OpenAPI.

## 2) Update DTOs y endpoints dedicados

- Revisión obligatoria: revisar todos los `Update*Dto`.
  - Si un campo (por ejemplo `status`) puede cambiar, el `UpdateDto` debe exponerlo explícitamente con validaciones y roles permitidos.
  - Si se quiere restringir (por ejemplo cambios de `status` sólo via admin), crear endpoint dedicado y claro, p.ej:
    - PATCH /api/v1/reservations/{id}/status
    - PATCH /api/v1/restaurants/{id}/status
    - PATCH /api/v1/subscriptions/{id}/state
  - Documentar la semántica: qué roles pueden llamar, qué validaciones se aplican (ej. transiciones válidas).

- No dejar `UpdateXDto` como `Record<string, never>` o vacío si realmente acepta cambios.

## 3) Imágenes / media (multipart)

- Todos los endpoints que crean o actualizan media deben aceptar `multipart/form-data` y documentar explícitamente:
  - Nombre del campo de archivo: `file` (ejemplo consistente).
  - Campos metadata adicionales: `altText`, `title`, `entityId`, `entityType`.

- Ejemplos en OpenAPI: incluir un ejemplo `multipart/form-data` en la spec.

- Ejemplo para developers (PowerShell):

```powershell
# Subir imagen (multipart) - campo file
curl -X POST "http://localhost:3000/api/v1/images" \
  -H "Authorization: Bearer <token>" \
  -F "file=@C:\ruta\a\imagen.jpg" \
  -F "altText=Foto del local" \
  -F "entityId=abc123"
```

(En la spec mostrar esto como `requestBody.content["multipart/form-data"].schema` con `type: string`, `format: binary` para el campo `file`.)

## 4) Moderación de reseñas (ModerateReviewDto)

- Definir claramente la forma y documentarla en OpenAPI. Ejemplo recomendado:

  {
  "action": "approve|reject|hide",
  "moderationNotes": "string (opcional)",
  "notifyUser": true (opcional)
  }

- Contrato:
  - `approve` => publish/visible
  - `reject` => mark rejected + optional reason
  - `hide` => keep in DB but hidden from public

- Registrar `moderationNotes` en la entidad o en una tabla de audit si es necesario (documentar dónde queda la información).

## 5) Validación y manejo de errores (estándar JSON)

- Formato de error estándar (ejemplo):

  400 Bad Request
  {
  "statusCode": 400,
  "message": "Validation failed",
  "details": {
  "fieldName": "error message",
  "otherField": "..."
  },
  "timestamp": "...",
  "path": "..."
  }

- Uso de códigos semánticos:
  - 400: inputs inválidos (validation)
  - 401: no autenticado
  - 403: autorizado pero acceso denegado por ownership/permiso (incluir razón corta en response.details)
  - 404: recurso no encontrado
  - 409: conflicto de negocio (slug duplicado, estado inválido, intento de crear duplicado, o violación de integridad manejada)
  - 500: errores internos genuinos (evitar 500 para violaciones de FK o reglas de negocio)

- Recomendación: incluir `details` y un `code` interno opcional para facilitar mapeo en frontend.

## 6) FK / Deletes / Soft-delete

- Evitar 500 cuando un delete falla por FK.
  - Opciones:
    1. Soft delete: marcar registro como `deletedAt`/`isDeleted` y mantener FK válidas.
    2. Validación previa al delete: comprobar relaciones y responder 409 con detalle: "cannot delete: has X related reservations (id list sample)".
    3. Endpoint para forzar borrado (dangerous) con permisos `admin` y log/audit obligatorio.

- Documentar la política por entidad: qué sucede cuando se borra un restaurante, una reserva o una imagen.

## 7) Autorización / Ownership

- Documentar reglas por endpoint:
  - Quién puede ver, editar, borrar.
  - Ejemplos: `owner`, `restaurant_admin`, `global_admin`.
- Para 403 devolver una explicación breve en `details`, p.ej `{ reason: 'resource-owner-only' }`.
- Endpoints admin para cross-owner ops: documentar y proteger con roles/permissions claras.

## 8) OpenAPI / CI

- Mantener la spec sincronizada con el código.
  - Estrategias: generar el YAML/JSON en runtime y/o durante build, y **comparar** en CI con la spec commiteada.
  - Si la política es no commitear artefactos generados, añadir un job en CI que genere y compare y falle si hay diffs.

- Tests de contrato (sugeridos):
  - Test que valida que `GET /api/v1/restaurants` responde con `data` + `pagination`.
  - Test que valida `multipart/form-data` schema para imagen.
  - Test que verifica que una FK violation se convierte en 409 (ejecutar un request de borrado que falla y comprobar código y body).

- Versionar breaking changes en la spec (semver): `v1 -> v2` si se cambian shapes.

## 9) Ejemplos concretos de endpoints recomendados

- Reservations — cambiar estado
  - PATCH /api/v1/reservations/{id}/status
  - Body: `{ "status": "confirmed|cancelled|seated", "adminNote": "..." }`

- Restaurants — cambiar estado
  - PATCH /api/v1/restaurants/{id}/status
  - Body: `{ "status": "ACTIVE|SUSPENDED|ARCHIVED", "adminNote": "..." }`

- Images — metadata
  - PATCH /api/v1/images/{id}/metadata
  - Content-Type: application/json
  - Body: `{ "altText": "...", "title": "...", "entityId": "..." }`

- Images — upload
  - POST /api/v1/images
  - Content-Type: multipart/form-data
  - Fields: `file` (binary), `altText`, `entityId`

- Reviews — moderación
  - POST /api/v1/reviews/{id}/moderate
  - Body: `{ "action": "approve|reject|hide", "moderationNotes": "..." }`

## 10) Contrato pequeño (inputs/outputs, errores) — plantilla para cada endpoint

- Inputs: validar con `class-validator` y documentar los alias (ej: `page`/`pageSize` y `limit` aceptados).
- Outputs: siempre `{ data: ... }` o `{ data: [...], pagination: {...} }`.
- Errores: el body debe tener `statusCode`, `message`, `details`.

## 11) Pruebas / Quality gates (sugerido)

- CI jobs:
  1. `build` — TypeScript compile
  2. `lint` — ESLint
  3. `test` — unit + integration quick set
  4. `openapi-check` — generar spec y comparar con `docs/swagger/swagger.yml` o con la versión commiteada.

- Herramientas: `openapi-diff`, `swagger-cli` o `@openapitools/openapi-generator` para validación.

## 12) Pasos prácticos para regenerar OpenAPI localmente

- Levantar la app en modo desarrollo para que la rutina que crea `docs/swagger/*.yml` se ejecute (si el proyecto ya lo hace en `bootstrap`):

```powershell
# Instalar dependencias (si no están)
npm install

# Lanzar en dev (ej: genera swagger en arranque)
npm run start:dev

# Alternativa: build + run
npm run build; node dist/main.js
```

- Luego revisar `docs/swagger/swagger.yml` y `docs/swagger/swagger.json`.

> Nota: el repositorio actual puede ignorar `docs/swagger/*` en git. Si se desea commitear la spec, acordarlo en el equipo; alternativa recomendada: generar en CI y publicar artefacto en releases o en la documentación del API.

## 13) Recomendaciones rápidas y prioridades

- Prioridad alta:
  1. Unificar shapes de respuesta (listas y entidades) y actualizar OpenAPI.
  2. Revisar `Update*Dto` y exponer endpoints dedicados para cambios sensibles (status, slug).
  3. Manejar deletes que fallan por FK y mapear a 409 + mensaje claro.

- Prioridad media: 4) Documentar multipart en spec y añadir ejemplos. 5) Añadir contract-tests en CI que fallen si la spec cambia.

- Prioridad baja: 6) Añadir endpoints de forzar borrado/transferencia de relaciones (solo con audit y permisos).

## 14) Edge cases a cubrir durante la implementación

- Campos adicionales (extra properties): decidir strict vs permissive y documentarlo; preferer versionar si se hace strict.
- Rango de fechas grandes: validar y limitar (ej. max 365 días) en DTOs para endpoints analytics.
- Concurrency: cambios de status concurrentes — retornar 409 on conflict e informar estado actual.
- Archivos grandes: usar limits y retornar 413 Payload Too Large cuando supere el límite.

## 15) Checklist de salida (para PRs)

Antes de cerrar PR que modifica endpoints:

- [ ] OpenAPI regenerada o tests que validen la spec.
- [ ] Ejemplos de multipart añadidos en la spec.
- [ ] Update DTOs documentados y/o endpoints dedicados creados.
- [ ] Tests unitarios/integración para validaciones y errores (al menos happy path + 1 caso de error).
- [ ] Documentación en `docs/backend-api-checklist.md` revisada.

---

Si quieres, puedo:

- Generar un PR con este archivo `docs/backend-api-checklist.md` y los tests básicos para OpenAPI/contract.
- Añadir ejemplos concretos de DTOs (clases `class-validator`) y snippets de controlador para endpoints como `PATCH /.../status` y `multipart`.
- Regenerar la spec localmente y proponerte si commitear los artefactos o dejar la generación en CI.

Di cuál de estas acciones quieres que ejecute ahora y lo hago (crear PR, añadir tests, regenerar spec, o generar ejemplos de DTOs y controladores).
