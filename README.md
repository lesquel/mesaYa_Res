# 🔧 MesaYA - Backend API

Microservicio principal (Backend) de la plataforma MesaYA, construido con NestJS. Maneja toda la lógica de negocio relacionada con restaurantes, reservas, menús, mesas y secciones.

## 📋 Descripción

Este es el backend central de MesaYA que proporciona:

- **Gestión de restaurantes**: Crear, editar, listar restaurantes
- **Sistema de reservas**: Crear, modificar, cancelar reservas
- **Gestión de mesas**: Configurar mesas y su disponibilidad
- **Secciones del restaurante**: Organizar el layout del local
- **Menús digitales**: Gestión de platillos y categorías
- **Reseñas y calificaciones**: Sistema de reviews de clientes
- **Arquitectura limpia (Clean Architecture)** con separación de capas
- **Comunicación event-driven** con Kafka
- **API REST documentada** con Swagger

## 🏗️ Arquitectura

```
src/
├── domain/              # Entidades y lógica de negocio
├── application/         # Casos de uso
├── infrastructure/      # Implementaciones (DB, Kafka, etc.)
└── interfaces/          # Controladores y DTOs
```

## 👥 Tipos de Usuarios

- **Cliente**: Puede buscar restaurantes, hacer reservas y dejar reseñas
- **Dueño de Restaurante**: Puede gestionar su restaurante, mesas, menú y ver reservas
- **Administrador**: Acceso completo a todas las funcionalidades del sistema

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js 18+
- npm o pnpm
- PostgreSQL
- Kafka (debe estar corriendo)

### Instalación

```bash
# Instalar dependencias
npm install
```

### Variables de Entorno

Crear un archivo `.env` con las siguientes variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mesaya

# Server
PORT=3000

# JWT (para validación de tokens)
JWT_SECRET=tu_secreto_jwt

# Kafka
KAFKA_BROKERS=localhost:9092

# External Services
AUTH_SERVICE_URL=http://localhost:3001
```

### Ejecutar

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod

# Con Docker
docker compose up -d
```

## 📡 API Endpoints

La API está documentada con Swagger. Una vez iniciado el servidor, accede a:

```
http://localhost:3000/api
```

### Principales endpoints

#### Restaurantes

- `GET /restaurants` - Listar todos los restaurantes
- `GET /restaurants/:id` - Obtener un restaurante específico
- `POST /restaurants` - Crear restaurante (solo dueños)
- `PUT /restaurants/:id` - Actualizar restaurante
- `DELETE /restaurants/:id` - Eliminar restaurante

#### Reservas

- `GET /reservations` - Listar reservas
- `POST /reservations` - Crear nueva reserva
- `PUT /reservations/:id` - Actualizar reserva
- `DELETE /reservations/:id` - Cancelar reserva

#### Mesas

- `GET /tables` - Listar mesas del restaurante
- `POST /tables` - Crear mesa
- `PUT /tables/:id` - Actualizar mesa
- `DELETE /tables/:id` - Eliminar mesa

#### Menús

- `GET /menus` - Listar menús
- `POST /menus` - Crear menú/platillo
- `PUT /menus/:id` - Actualizar menú
- `DELETE /menus/:id` - Eliminar menú

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🛠️ Tecnologías

- **NestJS** - Framework backend
- **TypeScript** - Lenguaje de programación
- **TypeORM** - ORM para PostgreSQL
- **Swagger/OpenAPI** - Documentación de API
- **KafkaJS** - Cliente de Kafka para eventos
- **Class Validator** - Validación de DTOs
- **Passport** - Autenticación (integración con Auth MS)

## 📚 Más Información

Para más detalles sobre la arquitectura y funcionamiento del sistema completo, consulta la [documentación principal](../docs/).

## 📄 Licencia

Este proyecto es parte de MesaYA y está desarrollado por estudiantes de ULEAM.
