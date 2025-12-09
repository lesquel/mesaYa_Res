# 📖 MesaYa - Documentación Completa del Sistema REST API

> **Sistema de Gestión de Reservas de Restaurantes**  
> Versión: 0.0.1  
> Framework: NestJS + TypeScript + Clean Architecture + DDD

---

## 📑 Tabla de Contenidos

1. [Descripción General](#1-descripción-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#3-tecnologías-utilizadas)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Configuración e Instalación](#5-configuración-e-instalación)
6. [Módulos del Sistema](#6-módulos-del-sistema)
7. [API REST - Endpoints](#7-api-rest---endpoints)
8. [Autenticación y Autorización](#8-autenticación-y-autorización)
9. [Modelos de Datos (DTOs y Entidades)](#9-modelos-de-datos-dtos-y-entidades)
10. [Servicios de Infraestructura](#10-servicios-de-infraestructura)
11. [Rate Limiting](#11-rate-limiting)
12. [Kafka - Mensajería](#12-kafka---mensajería)
13. [Base de Datos](#13-base-de-datos)
14. [Testing](#14-testing)
15. [Docker y Despliegue](#15-docker-y-despliegue)
16. [Variables de Entorno](#16-variables-de-entorno)

---

## 1. Descripción General

**MesaYa** es un sistema completo de gestión de reservas para restaurantes, desarrollado con NestJS siguiendo los principios de **Clean Architecture** y **Domain-Driven Design (DDD)**.

### Funcionalidades Principales

- 🔐 **Autenticación y Autorización** - Sistema completo con roles y permisos
- 🏪 **Gestión de Restaurantes** - CRUD completo con estados y propietarios
- 🍽️ **Gestión de Menús y Platos** - Catálogo de productos con categorías
- 📅 **Sistema de Reservas** - Reservas con estados y flujo de trabajo
- 🪑 **Gestión de Mesas y Secciones** - Layout visual del restaurante
- 💳 **Sistema de Pagos** - Pagos para reservas y suscripciones
- 📊 **Analytics** - Dashboards con métricas e indicadores
- 🔔 **Sistema de Reseñas** - Reviews y moderación
- 💼 **Suscripciones** - Planes de suscripción para restaurantes
- 🖼️ **Gestión de Imágenes** - Upload con Supabase Storage
- 📤 **Upgrade de Owner** - Solicitudes de upgrade de usuario a propietario

### Tipos de Usuario

| Rol | Descripción |
|-----|-------------|
| **ADMIN** | Administrador del sistema con acceso total |
| **OWNER** | Propietario de restaurante |
| **USER** | Usuario cliente que hace reservas |

---

## 2. Arquitectura del Sistema

### Clean Architecture + DDD

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACE LAYER                          │
│  (Controllers, DTOs, Decorators, Guards)                   │
├─────────────────────────────────────────────────────────────┤
│                   APPLICATION LAYER                         │
│  (Use Cases, Services, Commands, Queries)                  │
├─────────────────────────────────────────────────────────────┤
│                     DOMAIN LAYER                            │
│  (Entities, Value Objects, Repository Interfaces)          │
├─────────────────────────────────────────────────────────────┤
│                 INFRASTRUCTURE LAYER                        │
│  (TypeORM, Kafka, Supabase, External Services)            │
└─────────────────────────────────────────────────────────────┘
```

### Patrón de Organización por Feature

```
src/
├── features/
│   ├── auth/
│   │   ├── application/      # Casos de uso
│   │   ├── domain/           # Entidades y value objects
│   │   ├── infrastructure/   # Repositorios TypeORM
│   │   └── interface/        # Controllers y DTOs
│   ├── restaurants/
│   ├── reservation/
│   └── ...
└── shared/
    ├── application/          # Servicios compartidos
    ├── core/                 # Configuración central
    ├── domain/               # Entidades base
    └── infrastructure/       # Adaptadores
```

---

## 3. Tecnologías Utilizadas

### Core

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | ^11.0.1 | Framework principal |
| **TypeScript** | ^5.7.3 | Lenguaje de programación |
| **TypeORM** | ^0.3.27 | ORM para base de datos |
| **PostgreSQL** | - | Base de datos |
| **Passport** | ^0.7.0 | Autenticación |
| **JWT** | ^11.0.0 | Tokens de autenticación |

### Infraestructura

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **KafkaJS** | ^2.2.4 | Mensajería asíncrona |
| **Supabase** | ^2.76.1 | Storage de imágenes |
| **Winston** | ^3.18.3 | Logging |
| **Throttler** | ^6.4.0 | Rate limiting |
| **Swagger** | ^11.2.0 | Documentación API |

### Validación y Transformación

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **class-validator** | ^0.14.2 | Validación de DTOs |
| **class-transformer** | ^0.5.1 | Transformación de datos |
| **Joi** | ^18.0.1 | Validación de configuración |
| **bcrypt** | ^6.0.0 | Hash de contraseñas |

### Testing

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Jest** | ^30.0.0 | Framework de testing |
| **Supertest** | ^7.0.0 | Testing HTTP |

---

## 4. Estructura del Proyecto

```
mesa-ya-res/
├── 📁 src/
│   ├── 📁 features/                    # Módulos de negocio
│   │   ├── 📁 auth/                    # Autenticación
│   │   ├── 📁 restaurants/             # Restaurantes
│   │   ├── 📁 reservation/             # Reservas
│   │   ├── 📁 tables/                  # Mesas
│   │   ├── 📁 sections/                # Secciones
│   │   ├── 📁 menus/                   # Menús
│   │   ├── 📁 reviews/                 # Reseñas
│   │   ├── 📁 payment/                 # Pagos
│   │   ├── 📁 subscription/            # Suscripciones
│   │   ├── 📁 images/                  # Imágenes
│   │   ├── 📁 objects/                 # Objetos gráficos
│   │   ├── 📁 section-objects/         # Relaciones sección-objeto
│   │   └── 📁 owner-upgrade/           # Solicitudes de upgrade
│   ├── 📁 shared/                      # Código compartido
│   │   ├── 📁 application/             # Servicios compartidos
│   │   ├── 📁 core/                    # Configuración
│   │   │   └── 📁 config/              # Archivos de config
│   │   ├── 📁 domain/                  # Entidades base
│   │   └── 📁 infrastructure/          # Adaptadores
│   │       ├── 📁 adapters/            # Database, Logger, Config
│   │       ├── 📁 guards/              # Guards personalizados
│   │       ├── 📁 decorators/          # Decoradores
│   │       ├── 📁 kafka/               # Kafka producer/consumer
│   │       ├── 📁 pagination/          # Utilidades paginación
│   │       ├── 📁 persistence/         # Repositorios base
│   │       └── 📁 supabase/            # Storage de imágenes
│   ├── 📁 seed/                        # Datos iniciales
│   ├── 📁 types/                       # Tipos TypeScript
│   ├── 📄 app.module.ts                # Módulo raíz
│   ├── 📄 app.controller.ts            # Controller raíz
│   ├── 📄 app.bootstrap.ts             # Bootstrap de la app
│   └── 📄 main.ts                      # Entry point
├── 📁 test/                            # Tests E2E
├── 📁 docs/                            # Documentación
│   └── 📁 swagger/                     # Swagger JSON/YAML
├── 📁 scripts/                         # Scripts de utilidad
├── 📄 docker-compose.yml               # Docker Compose
├── 📄 Dockerfile                       # Dockerfile
├── 📄 package.json                     # Dependencias
├── 📄 tsconfig.json                    # Config TypeScript
└── 📄 nest-cli.json                    # Config NestJS CLI
```

---

## 5. Configuración e Instalación

### Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- PostgreSQL >= 14
- Docker (opcional, para Kafka)

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/lesquel/mesaYa_Res.git
cd mesa-ya-res

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Compilar
npm run build

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm run start:prod
```

### Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar proyecto |
| `npm run start` | Iniciar aplicación |
| `npm run start:prod` | Producción |
| `npm run test` | Tests unitarios |
| `npm run test:cov` | Coverage de tests |
| `npm run test:e2e` | Tests end-to-end |
| `npm run lint` | Linting con ESLint |
| `npm run format` | Formatear con Prettier |

---

## 6. Módulos del Sistema

### 6.1 AuthModule - Autenticación

Gestiona usuarios, roles, permisos y tokens JWT.

**Funcionalidades:**
- Registro e inicio de sesión
- Gestión de roles (ADMIN, OWNER, USER)
- Gestión de permisos granulares
- Analytics de usuarios

### 6.2 RestaurantsModule - Restaurantes

CRUD completo de restaurantes con estados y propietarios.

**Funcionalidades:**
- Crear, leer, actualizar, eliminar restaurantes
- Estados: ACTIVE, SUSPENDED, ARCHIVED
- Asignación de propietarios
- Búsqueda por cercanía geográfica
- Horarios de apertura (schedule slots)

### 6.3 ReservationModule - Reservas

Sistema de reservas con flujo de estados.

**Estados de Reserva:**
- PENDING → CONFIRMED → CHECKED_IN → COMPLETED
- PENDING → REJECTED
- PENDING/CONFIRMED → CANCELLED
- CONFIRMED → NO_SHOW

### 6.4 TablesModule - Mesas

Gestión de mesas con posicionamiento visual.

**Funcionalidades:**
- CRUD de mesas
- Posicionamiento (posX, posY, width, height)
- Selección temporal de mesas
- Estados: AVAILABLE, OCCUPIED, BLOCKED

### 6.5 SectionsModule - Secciones

Áreas del restaurante para organizar mesas.

**Funcionalidades:**
- CRUD de secciones
- Metadata de layout
- Estados: ACTIVE, INACTIVE, MAINTENANCE

### 6.6 MenusModule - Menús

Catálogo de menús y platos.

**Funcionalidades:**
- CRUD de menús
- CRUD de platos (dishes)
- Categorías de menú
- Analytics de precios

### 6.7 ReviewsModule - Reseñas

Sistema de reseñas con moderación.

**Funcionalidades:**
- Crear reseñas con rating (1-5)
- Moderación por administradores
- Analytics de reseñas

### 6.8 PaymentModule - Pagos

Gestión de pagos para reservas y suscripciones.

**Estados de Pago:**
- PENDING
- COMPLETED
- CANCELLED

**Tipos de Pago:**
- RESERVATION
- SUBSCRIPTION

### 6.9 SubscriptionModule - Suscripciones

Planes de suscripción para restaurantes.

**Periodos:**
- WEEKLY
- MONTHLY
- YEARLY

**Estados:**
- ACTIVE
- INACTIVE

### 6.10 ImagesModule - Imágenes

Gestión de imágenes con Supabase Storage.

**Funcionalidades:**
- Upload de imágenes
- Asociación a entidades
- Metadata (title, description, alt)

### 6.11 ObjectsModule - Objetos Gráficos

Elementos decorativos para el layout del restaurante.

### 6.12 SectionObjectsModule - Relaciones Sección-Objeto

Vincular objetos gráficos a secciones.

### 6.13 OwnerUpgradeModule - Solicitudes de Upgrade

Proceso para que usuarios regulares se conviertan en propietarios.

**Estados:**
- PENDING
- APPROVED
- REJECTED

---

## 7. API REST - Endpoints

### Base URL
```
/api/v1
```

### 7.1 Información de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Información de la API |

### 7.2 Seed - Datos Iniciales

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/seed` | Ejecutar seed completo | No |
| GET | `/api/v1/seed/auth-only` | Seed solo auth | No |

### 7.3 Auth - Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/signup` | Registro de usuario | No |
| POST | `/api/v1/auth/login` | Inicio de sesión | No |
| GET | `/api/v1/auth/me` | Perfil del usuario actual | Sí |
| GET | `/api/v1/auth/check` | Verificar rol ADMIN | Sí |
| GET | `/api/v1/auth/analytics` | Analytics de usuarios | Admin |
| GET | `/api/v1/auth/users` | Listar usuarios (admin) | Admin |
| GET | `/api/v1/auth/users/{id}` | Detalle de usuario | Admin |
| PATCH | `/api/v1/auth/users/{id}/roles` | Cambiar roles de usuario | Admin |
| GET | `/api/v1/auth/roles` | Listar roles | Admin |
| PATCH | `/api/v1/auth/roles/{name}/permissions` | Cambiar permisos de rol | Admin |
| GET | `/api/v1/auth/permissions` | Listar permisos | Admin |

#### Request: Registro de Usuario
```json
POST /api/v1/auth/signup
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "0999999999",
  "password": "StrongP4ss"
}
```

#### Response: Token de Autenticación
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "0999999999",
    "roles": ["USER"]
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 7.4 Users - Usuarios Públicos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users` | Listar usuarios públicos | No |
| GET | `/api/v1/users/{id}` | Perfil público de usuario | No |
| GET | `/api/v1/users/analytics` | Analytics públicos | No |
| GET | `/api/v1/users/analytics/restaurant/{restaurantId}` | Analytics por restaurante | Sí |

### 7.5 Restaurants - Restaurantes

#### Endpoints Públicos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/restaurants` | Listar restaurantes | No |
| GET | `/api/v1/restaurants/{id}` | Detalle de restaurante | No |
| GET | `/api/v1/restaurants/{id}/schedule-slots` | Horarios públicos | No |
| GET | `/api/v1/restaurants/nearby` | Restaurantes cercanos | No |
| GET | `/api/v1/restaurants/{id}/reservations` | Reservas del restaurante | No |

#### Endpoints Autenticados

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/restaurants` | Crear restaurante | Admin |
| PATCH | `/api/v1/restaurants/{id}` | Actualizar restaurante | Owner/Admin |
| DELETE | `/api/v1/restaurants/{id}` | Eliminar restaurante | Admin |
| GET | `/api/v1/restaurants/me` | Mis restaurantes | Owner |
| PATCH | `/api/v1/restaurants/{id}/status` | Cambiar estado | Admin |
| GET | `/api/v1/restaurants/{id}/analytics` | Analytics | Owner/Admin |

#### Endpoints Admin

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/admin/restaurants` | Listar todos | Admin |
| POST | `/api/v1/admin/restaurants` | Crear | Admin |
| GET | `/api/v1/admin/restaurants/{id}` | Detalle | Admin |
| PATCH | `/api/v1/admin/restaurants/{id}` | Actualizar | Admin |
| DELETE | `/api/v1/admin/restaurants/{id}` | Eliminar | Admin |
| GET | `/api/v1/admin/restaurants/owners` | Listar propietarios | Admin |
| GET | `/api/v1/admin/restaurants/me` | Mis restaurantes | Admin |
| GET | `/api/v1/admin/restaurants/analytics` | Analytics globales | Admin |
| POST | `/api/v1/admin/restaurants/{id}/owners` | Reasignar propietario | Admin |
| PATCH | `/api/v1/admin/restaurants/{id}/status` | Cambiar estado | Admin |

#### Request: Crear Restaurante
```json
POST /api/v1/restaurants
{
  "name": "My Resto",
  "description": "Casual dining with local flavors",
  "location": {
    "address": "Av. Amazonas 200 y Colón",
    "city": "Quito",
    "province": "Pichincha",
    "country": "Ecuador",
    "latitude": -0.180653,
    "longitude": -78.467834
  },
  "openTime": "09:00",
  "closeTime": "18:00",
  "daysOpen": ["MONDAY", "TUESDAY", "WEDNESDAY"],
  "totalCapacity": 50,
  "subscriptionId": "9a4d5c78-3d9f-427c-9f5c-a4c9b6f0c2d1",
  "imageId": "5e2f7c1a-0d83-4fe1-bbe6-01baf2ea9871"
}
```

### 7.6 Schedules - Horarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/restaurants/{restaurantId}/schedules` | Listar excepciones | Owner |
| POST | `/api/v1/restaurants/{restaurantId}/schedules` | Crear excepción | Owner |
| PATCH | `/api/v1/restaurants/{restaurantId}/schedules/{id}` | Actualizar excepción | Owner |
| DELETE | `/api/v1/restaurants/{restaurantId}/schedules/{id}` | Eliminar excepción | Owner |
| GET | `/api/v1/restaurants/{restaurantId}/schedules/slots` | Listar slots | Owner |
| POST | `/api/v1/restaurants/{restaurantId}/schedules/slots` | Crear slot | Owner |
| PATCH | `/api/v1/restaurants/{restaurantId}/schedules/slots/{id}` | Actualizar slot | Owner |
| DELETE | `/api/v1/restaurants/{restaurantId}/schedules/slots/{id}` | Eliminar slot | Owner |

### 7.7 Reservations - Reservas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/reservations` | Listar reservas | Sí |
| POST | `/api/v1/reservations` | Crear reserva | Sí |
| GET | `/api/v1/reservations/{id}` | Detalle de reserva | Sí |
| PATCH | `/api/v1/reservations/{id}` | Actualizar reserva | Sí |
| DELETE | `/api/v1/reservations/{id}` | Eliminar reserva | Sí |
| PATCH | `/api/v1/reservations/{id}/status` | Cambiar estado | Sí |
| GET | `/api/v1/reservations/analytics` | Analytics | Admin |

#### Request: Crear Reserva
```json
POST /api/v1/reservations
{
  "restaurantId": "uuid",
  "tableId": "uuid",
  "reservationDate": "2025-01-15T00:00:00.000Z",
  "reservationTime": "2025-01-15T19:00:00.000Z",
  "numberOfGuests": 4
}
```

#### Request: Cambiar Estado
```json
PATCH /api/v1/reservations/{id}/status
{
  "status": "CONFIRMED",
  "reason": "Mesa disponible confirmada",
  "notifyCustomer": true
}
```

### 7.8 Sections - Secciones

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/sections` | Listar secciones | Sí |
| POST | `/api/v1/sections` | Crear sección | Sí |
| GET | `/api/v1/sections/{id}` | Detalle de sección | No |
| PATCH | `/api/v1/sections/{id}` | Actualizar sección | Sí |
| DELETE | `/api/v1/sections/{id}` | Eliminar sección | Sí |
| GET | `/api/v1/sections/restaurant/{restaurantId}` | Secciones por restaurante | No |
| GET | `/api/v1/sections/analytics` | Analytics | Sí |

#### Request: Crear Sección
```json
POST /api/v1/sections
{
  "restaurantId": "uuid",
  "name": "Terraza",
  "description": "Área exterior con vista al jardín",
  "width": 120,
  "height": 80
}
```

### 7.9 Tables - Mesas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/tables` | Listar mesas | Sí |
| POST | `/api/v1/tables` | Crear mesa | Sí |
| GET | `/api/v1/tables/{id}` | Detalle de mesa | No |
| PATCH | `/api/v1/tables/{id}` | Actualizar mesa | Sí |
| DELETE | `/api/v1/tables/{id}` | Eliminar mesa | Sí |
| GET | `/api/v1/tables/section/{sectionId}` | Mesas por sección | No |
| POST | `/api/v1/tables/{id}/select` | Seleccionar mesa temporalmente | Sí |
| POST | `/api/v1/tables/{id}/release` | Liberar mesa | Sí |
| GET | `/api/v1/tables/analytics` | Analytics | Sí |

#### Request: Crear Mesa
```json
POST /api/v1/tables
{
  "sectionId": "uuid",
  "number": 1,
  "capacity": 4,
  "posX": 60,
  "posY": 40,
  "width": 90,
  "height": 90,
  "tableImageId": "uuid",
  "chairImageId": "uuid"
}
```

### 7.10 Menus - Menús

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/menus?restaurantId={id}` | Listar menús | No |
| POST | `/api/v1/menus` | Crear menú | Sí |
| GET | `/api/v1/menus/{menuId}` | Detalle de menú | No |
| PATCH | `/api/v1/menus/{menuId}` | Actualizar menú | Sí |
| DELETE | `/api/v1/menus/{menuId}` | Eliminar menú | Sí |
| GET | `/api/v1/menus/restaurant/{restaurantId}` | Menús por restaurante | No |
| GET | `/api/v1/menus/analytics` | Analytics | No |

### 7.11 Dishes - Platos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/dishes` | Listar platos | No |
| POST | `/api/v1/dishes` | Crear plato | Sí |
| GET | `/api/v1/dishes/{dishId}` | Detalle de plato | No |
| PATCH | `/api/v1/dishes/{dishId}` | Actualizar plato | Sí |
| DELETE | `/api/v1/dishes/{dishId}` | Eliminar plato | Sí |
| GET | `/api/v1/dishes/restaurant/{restaurantId}` | Platos por restaurante | No |
| GET | `/api/v1/dishes/menu/{menuId}` | Platos por menú | No |
| GET | `/api/v1/dishes/analytics` | Analytics | No |

#### Request: Crear Plato
```json
POST /api/v1/dishes
{
  "restaurantId": "uuid",
  "name": "Lomo Saltado",
  "description": "Plato tradicional peruano",
  "price": 15.99,
  "imageId": "uuid",
  "menuId": "uuid",
  "categoryId": "uuid"
}
```

### 7.12 Menu Categories - Categorías de Menú

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/menu-categories` | Listar categorías | Sí |
| POST | `/api/v1/menu-categories` | Crear categoría | Sí |
| PATCH | `/api/v1/menu-categories/{categoryId}` | Actualizar | Sí |
| DELETE | `/api/v1/menu-categories/{categoryId}` | Eliminar | Sí |

### 7.13 Reviews - Reseñas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/reviews` | Listar reseñas | No |
| POST | `/api/v1/reviews` | Crear reseña | Sí |
| GET | `/api/v1/reviews/{id}` | Detalle de reseña | No |
| PATCH | `/api/v1/reviews/{id}` | Actualizar reseña propia | Sí |
| DELETE | `/api/v1/reviews/{id}` | Eliminar reseña propia | Sí |
| GET | `/api/v1/reviews/restaurant/{restaurantId}` | Reseñas por restaurante | No |
| POST | `/api/v1/reviews/{id}/moderate` | Moderar reseña | Admin |
| GET | `/api/v1/reviews/analytics/stats` | Analytics | Sí |

#### Request: Crear Reseña
```json
POST /api/v1/reviews
{
  "restaurantId": "uuid",
  "rating": 5,
  "comment": "Excelente servicio y comida"
}
```

### 7.14 Subscriptions - Suscripciones

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/subscriptions` | Listar suscripciones | Admin |
| POST | `/api/v1/subscriptions` | Crear suscripción | Sí |
| GET | `/api/v1/subscriptions/{subscriptionId}` | Detalle | Sí |
| PATCH | `/api/v1/subscriptions/{subscriptionId}` | Actualizar | Admin |
| DELETE | `/api/v1/subscriptions/{subscriptionId}` | Eliminar | Admin |
| GET | `/api/v1/subscriptions/restaurant/{restaurantId}` | Por restaurante | Sí |
| PATCH | `/api/v1/subscriptions/{subscriptionId}/state` | Cambiar estado | Admin |
| GET | `/api/v1/subscriptions/analytics` | Analytics | Sí |

### 7.15 Subscription Plans - Planes de Suscripción

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/subscription-plans` | Listar planes | No |
| POST | `/api/v1/subscription-plans` | Crear plan | Sí |
| GET | `/api/v1/subscription-plans/{subscriptionPlanId}` | Detalle | No |
| PATCH | `/api/v1/subscription-plans/{subscriptionPlanId}` | Actualizar | Sí |
| DELETE | `/api/v1/subscription-plans/{subscriptionPlanId}` | Eliminar | Sí |
| GET | `/api/v1/subscription-plans/analytics` | Analytics | No |

### 7.16 Payments - Pagos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/payments` | Listar pagos (admin) | Admin |
| GET | `/api/v1/payments/{paymentId}` | Detalle (admin) | Admin |
| DELETE | `/api/v1/payments/{paymentId}` | Eliminar | Admin |
| PATCH | `/api/v1/payments/{paymentId}/status` | Cambiar estado | Admin |
| POST | `/api/v1/payments/user` | Crear pago (user) | Sí |
| GET | `/api/v1/payments/user/{paymentId}` | Mi pago | Sí |
| POST | `/api/v1/payments/restaurant` | Pago de suscripción | Owner |
| GET | `/api/v1/payments/restaurant/by-restaurant/{restaurantId}` | Pagos de mi restaurante | Owner |
| GET | `/api/v1/payments/restaurant/{paymentId}` | Detalle pago restaurante | Owner |
| GET | `/api/v1/payments/analytics` | Analytics | Admin |

### 7.17 Images - Imágenes

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/images` | Listar imágenes | No |
| POST | `/api/v1/images` | Subir imagen | Admin |
| GET | `/api/v1/images/{id}` | Detalle de imagen | No |
| PATCH | `/api/v1/images/{id}` | Actualizar imagen | Admin |
| DELETE | `/api/v1/images/{id}` | Eliminar imagen | Admin |
| PATCH | `/api/v1/images/{id}/metadata` | Actualizar metadata | Admin |
| GET | `/api/v1/images/analytics/stats` | Analytics | Admin |

### 7.18 Objects - Objetos Gráficos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/objects` | Listar objetos | No |
| POST | `/api/v1/objects` | Crear objeto | Sí |
| GET | `/api/v1/objects/{id}` | Detalle de objeto | No |
| PATCH | `/api/v1/objects/{id}` | Actualizar objeto | Sí |
| DELETE | `/api/v1/objects/{id}` | Eliminar objeto | Sí |
| GET | `/api/v1/objects/analytics/stats` | Analytics | Sí |

### 7.19 Section Objects - Relaciones

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/section-objects` | Listar relaciones | Sí |
| POST | `/api/v1/section-objects` | Crear relación | Sí |
| GET | `/api/v1/section-objects/{id}` | Detalle | Sí |
| PATCH | `/api/v1/section-objects/{id}` | Actualizar | Sí |
| DELETE | `/api/v1/section-objects/{id}` | Eliminar | Sí |

### 7.20 Owner Upgrades - Solicitudes de Upgrade

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/owner-upgrades` | Listar solicitudes | Admin |
| POST | `/api/v1/owner-upgrades` | Crear solicitud | Sí |
| GET | `/api/v1/owner-upgrades/{requestId}` | Detalle | Admin |
| PATCH | `/api/v1/owner-upgrades/{requestId}/decision` | Aprobar/Rechazar | Admin |

#### Request: Solicitud de Upgrade
```json
POST /api/v1/owner-upgrades
{
  "restaurantName": "Restaurante la Esquina",
  "restaurantLocation": "Av. Central 123, Quito",
  "restaurantDescription": "Cocina fusión y cartas degustación",
  "subscriptionPlanId": "uuid",
  "message": "Tengo experiencia atendiendo 150 comensales diarios"
}
```

---

## 8. Autenticación y Autorización

### JWT Bearer Token

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token>
```

### Roles del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **ADMIN** | Administrador | Acceso total al sistema |
| **OWNER** | Propietario | Gestión de sus restaurantes |
| **USER** | Cliente | Reservas y reseñas |

### Permisos Granulares

Los permisos siguen el formato `entidad:acción`:

```
restaurant:create, restaurant:read, restaurant:update, restaurant:delete
section:create, section:read, section:update, section:delete
table:create, table:read, table:update, table:delete
reservation:create, reservation:read, reservation:update, reservation:delete
menu:create, menu:read, menu:update, menu:delete
dish:create, dish:read, dish:update, dish:delete
review:create, review:read, review:update, review:delete
payment:create, payment:read, payment:update, payment:delete
subscription:create, subscription:read, subscription:update, subscription:delete
image:create, image:read, image:update, image:delete
object:create, object:read, object:update, object:delete
section-object:create, section-object:read, section-object:update, section-object:delete
```

### Decoradores de Autorización

```typescript
// Requiere autenticación
@UseGuards(JwtAuthGuard)

// Requiere roles específicos
@Roles('ADMIN', 'OWNER')

// Requiere permisos específicos
@Permissions('restaurant:create')
```

---

## 9. Modelos de Datos (DTOs y Entidades)

### 9.1 AuthUser - Usuario

```typescript
interface AuthUser {
  id: string;              // UUID
  email: string;           // Único, máx 100 chars
  name: string;            // Máx 100 chars
  phone: string;           // Máx 15 chars
  passwordHash: string;    // Hash bcrypt
  roles: AuthRole[];       // Relación con roles
  active: boolean;         // Estado activo
  createdAt: Date;
  updatedAt: Date;
}
```

### 9.2 Restaurant - Restaurante

```typescript
interface Restaurant {
  id: string;                      // UUID
  name: string;                    // Máx 100 chars
  description: string | null;
  location: RestaurantLocation;    // Objeto con dirección y coordenadas
  openTime: string;                // HH:mm
  closeTime: string;               // HH:mm
  daysOpen: string[];              // ['MONDAY', 'TUESDAY', ...]
  totalCapacity: number;           // Mínimo 1
  subscriptionId: string;          // UUID del plan
  imageId: string | null;          // UUID de imagen
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  adminNote: string | null;        // Máx 500 chars
  active: boolean;
  ownerId: string | null;          // UUID del propietario
  createdAt: Date;
  updatedAt: Date;
}

interface RestaurantLocation {
  address: string;                 // Requerido
  city: string;                    // Requerido
  province?: string;
  country: string;                 // Requerido
  latitude?: number;               // Coordenada
  longitude?: number;              // Coordenada
  placeId?: string;                // Google Place ID
}
```

### 9.3 Reservation - Reserva

```typescript
interface Reservation {
  id: string;                      // UUID
  restaurantId: string;            // UUID
  userId: string;                  // UUID del cliente
  tableId: string;                 // UUID de la mesa
  reservationDate: string;         // ISO 8601 date
  reservationTime: string;         // ISO 8601 time
  numberOfGuests: number;
  status: ReservationStatus;
  createdAt: Date;
  updatedAt: Date;
}

type ReservationStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'REJECTED' 
  | 'CANCELLED' 
  | 'CHECKED_IN' 
  | 'COMPLETED' 
  | 'NO_SHOW';
```

### 9.4 Section - Sección

```typescript
interface Section {
  id: string;                      // UUID
  restaurantId: string;            // UUID
  name: string;                    // Máx 50 chars
  description: string | null;
  posX: number;                    // Posición X
  posY: number;                    // Posición Y
  width: number;                   // Ancho (mín 1)
  height: number;                  // Alto (mín 1)
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  layoutMetadata: SectionLayoutMetadata;
  createdAt: Date;
  updatedAt: Date;
}

interface SectionLayoutMetadata {
  layoutId: string | null;
  orientation: 'LANDSCAPE' | 'PORTRAIT';
  zIndex: number;
  notes: string | null;
}
```

### 9.5 Table - Mesa

```typescript
interface Table {
  id: string;                      // UUID
  sectionId: string;               // UUID
  number: number;                  // Número visible
  capacity: number;                // Capacidad (mín 1)
  posX: number;                    // Posición X
  posY: number;                    // Posición Y
  width: number;                   // Ancho
  height: number;                  // Alto
  tableImageId: string;            // UUID imagen mesa
  chairImageId: string;            // UUID imagen silla
  status: 'AVAILABLE' | 'OCCUPIED' | 'BLOCKED';
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 9.6 Menu - Menú

```typescript
interface Menu {
  menuId: string;                  // UUID
  restaurantId: string;            // UUID
  name: string;                    // Máx 100 chars
  description: string;
  price: number;                   // Ej: 15.50
  imageId: string | null;          // UUID
  imageUrl: string | null;
  dishes: Dish[];                  // Platos incluidos
  createdAt: Date;
  updatedAt: Date;
}
```

### 9.7 Dish - Plato

```typescript
interface Dish {
  dishId: string;                  // UUID
  restaurantId: string;            // UUID
  name: string;                    // Máx 100 chars
  description: string;
  price: number;                   // Ej: 8.99
  imageId: string | null;          // UUID
  menuId: string | null;           // UUID
  categoryId: string | null;       // UUID
  categoryName: string | null;     // Máx 100 chars
  categoryDescription: string | null;
  categoryOrder: number | null;    // Mín 0
  createdAt: Date;
  updatedAt: Date;
}
```

### 9.8 Review - Reseña

```typescript
interface Review {
  id: string;                      // UUID
  restaurantId: string;            // UUID
  userId: string;                  // UUID
  rating: number;                  // 1-5
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### 9.9 Payment - Pago

```typescript
interface Payment {
  paymentId: string;               // UUID
  reservationId: string | null;    // UUID
  subscriptionId: string | null;   // UUID
  amount: number;                  // Ej: 100.50
  date: string;                    // ISO 8601
  paymentStatus: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}
```

### 9.10 Subscription - Suscripción

```typescript
interface Subscription {
  subscriptionId: string;          // UUID
  subscriptionPlanId: string;      // UUID
  restaurantId: string;            // UUID
  subscriptionStartDate: string;   // ISO 8601
  stateSubscription: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}
```

### 9.11 SubscriptionPlan - Plan de Suscripción

```typescript
interface SubscriptionPlan {
  subscriptionPlanId: string;      // UUID
  name: string;                    // Máx 100 chars
  price: number;                   // Ej: 29.99
  subscriptionPeriod: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  stateSubscriptionPlan: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 10. Servicios de Infraestructura

### 10.1 Database (TypeORM)

Conexión a PostgreSQL configurada en `DatabaseModule`.

```typescript
// src/shared/infrastructure/adapters/database/database.module.ts
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true, // Solo desarrollo
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

### 10.2 Logger (Winston)

Sistema de logging centralizado.

```typescript
// Niveles de log
- error: Errores críticos
- warn: Advertencias
- info: Información general
- debug: Debugging
```

### 10.3 Supabase Storage

Almacenamiento de imágenes.

```typescript
// Operaciones
- upload: Subir imagen
- download: Descargar imagen
- delete: Eliminar imagen
- getPublicUrl: Obtener URL pública
```

---

## 11. Rate Limiting

Configuración del throttler para prevenir abuso.

```typescript
// src/shared/core/config/throttler/
export const THROTTLER_CONFIG = {
  ttl: 60000,      // Ventana de tiempo (ms)
  limit: 100,      // Límites por ventana
};
```

### Límites por Endpoint

| Tipo | TTL | Límite |
|------|-----|--------|
| Default | 60s | 100 req |
| Auth | 60s | 10 req |
| Upload | 60s | 5 req |

---

## 12. Kafka - Mensajería

### Configuración

```yaml
# docker-compose.yml
KAFKA_BROKER: kafka:9092
KAFKA_CLIENT_ID: mesa-ya-service
KAFKA_GROUP_ID: mesa-ya-group
```

### Topics

| Topic | Descripción |
|-------|-------------|
| `reservations.created` | Nueva reserva creada |
| `reservations.updated` | Reserva actualizada |
| `reservations.cancelled` | Reserva cancelada |
| `payments.completed` | Pago completado |
| `users.registered` | Usuario registrado |

### Uso

```typescript
// Producer
@Inject(KAFKA_PRODUCER)
private kafkaProducer: Producer;

await this.kafkaProducer.send({
  topic: 'reservations.created',
  messages: [{ value: JSON.stringify(reservation) }],
});

// Consumer
@EventPattern('reservations.created')
async handleReservationCreated(data: ReservationDto) {
  // Procesar evento
}
```

---

## 13. Base de Datos

### Diagrama ER (Simplificado)

```
┌─────────────────┐     ┌─────────────────┐
│   auth_users    │────<│   auth_roles    │
└────────┬────────┘     └─────────────────┘
         │
         │ owns
         ▼
┌─────────────────┐     ┌─────────────────┐
│   restaurants   │────<│  subscriptions  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │ has                   │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│    sections     │     │ subscription    │
└────────┬────────┘     │     plans       │
         │              └─────────────────┘
         │ contains
         ▼
┌─────────────────┐     ┌─────────────────┐
│     tables      │     │     menus       │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │ reserved              │ contains
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  reservations   │     │     dishes      │
└────────┬────────┘     └─────────────────┘
         │
         │ paid by
         ▼
┌─────────────────┐     ┌─────────────────┐
│    payments     │     │    reviews      │
└─────────────────┘     └─────────────────┘
```

### Migraciones

TypeORM maneja las migraciones automáticamente en desarrollo (`synchronize: true`).

Para producción, usar migraciones manuales:

```bash
# Generar migración
npm run typeorm migration:generate -n MigrationName

# Ejecutar migraciones
npm run typeorm migration:run

# Revertir última migración
npm run typeorm migration:revert
```

---

## 14. Testing

### Estructura de Tests

```
test/
├── app.e2e-spec.ts           # Tests E2E
├── jest-e2e.json             # Config Jest E2E
└── unit/                     # Tests unitarios
    ├── auth-analytics.spec.ts
    ├── public-users.controller.spec.ts
    └── ...
```

### Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests con watch
npm run test:watch

# Coverage
npm run test:cov

# Tests E2E
npm run test:e2e
```

### Ejemplo de Test

```typescript
describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should register a user', async () => {
    const dto = { email: 'test@test.com', name: 'Test', phone: '123', password: 'Pass123' };
    const result = { user: { ...dto, id: '1' }, token: 'jwt' };
    
    jest.spyOn(service, 'signup').mockResolvedValue(result);
    
    expect(await controller.signup(dto)).toBe(result);
  });
});
```

---

## 15. Docker y Despliegue

### Docker Compose

```yaml
# docker-compose.yml
services:
  kafka:
    image: apache/kafka:3.9.0
    ports:
      - '9092:9092'
      - '29092:29092'

  kafka-init:
    image: apache/kafka:3.9.0
    depends_on:
      kafka:
        condition: service_healthy

  app:
    build: .
    depends_on:
      kafka:
        condition: service_healthy
    env_file:
      - .env
    ports:
      - '3000:3000'
```

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Comandos Docker

```bash
# Construir e iniciar
docker-compose up --build

# Solo Kafka
docker-compose up kafka kafka-init

# Parar servicios
docker-compose down

# Ver logs
docker-compose logs -f app
```

---

## 16. Variables de Entorno

### Archivo `.env`

```env
# App
APP_PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=mesa_ya

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Kafka
KAFKA_BROKER=localhost:29092
KAFKA_CLIENT_ID=mesa-ya-service
KAFKA_GROUP_ID=mesa-ya-group

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_BUCKET=images

# Rate Limiting
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
```

### Validación con Joi

```typescript
// src/shared/core/config/joi.validation.ts
export const envValidationSchema = Joi.object({
  APP_PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
});
```

---

## Paginación

Todos los endpoints de listado soportan paginación con los siguientes parámetros:

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | number | 1 | Número de página (1-based) |
| `limit` | number | 10 | Elementos por página (1-100) |
| `offset` | number | 0 | Desplazamiento alternativo |
| `sortBy` | string | createdAt | Campo de ordenamiento |
| `sortOrder` | ASC/DESC | DESC | Dirección |
| `q` | string | - | Búsqueda de texto |

### Response de Paginación

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "totalPages": 5,
    "totalItems": 42,
    "hasNext": true,
    "hasPrev": false,
    "offset": 0,
    "links": {
      "self": "/api/v1/restaurants?page=1",
      "next": "/api/v1/restaurants?page=2",
      "prev": null,
      "first": "/api/v1/restaurants?page=1",
      "last": "/api/v1/restaurants?page=5"
    }
  }
}
```

---

## Códigos de Error HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto de datos |
| 422 | Unprocessable Entity - Validación fallida |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

---

## Swagger / OpenAPI

Documentación interactiva disponible en:

```
http://localhost:3000/api/docs
```

Archivos de especificación:
- `docs/swagger/swagger.json`
- `docs/swagger/swagger.yml`

---

## Contacto y Soporte

- **Repositorio**: https://github.com/lesquel/mesaYa_Res
- **Branch Principal**: main

---

*Documentación generada el 9 de diciembre de 2025*
