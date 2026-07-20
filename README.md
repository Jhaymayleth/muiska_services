<div align="center">

# 🏺 MUISKA

### Plataforma de comercio comunitario

![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📖 Descripción

**MUISKA** es una plataforma de comercio comunitario que conecta personas para publicar, explorar y gestionar artículos en venta dentro de un entorno colaborativo. El proyecto está estructurado como un monorepo con un **frontend SPA** en JavaScript vanilla, un **backend REST** en Express y una **base de datos** PostgreSQL, todo orquestable localmente con Docker.

---

## 🗂️ Estructura del proyecto

```
muiska/
├── backend/                   # API REST con Express
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── config/            # conexión a PostgreSQL (pg Pool)
│       ├── controllers/       # lógica de negocio
│       ├── middlewares/       # auth, upload, error handling
│       ├── routes/            # definición de endpoints
│       ├── db/                # SQL de inicialización
│       ├── app.js
│       └── server.js
│
├── frontend/                  # SPA con Vite + Tailwind + JS vanilla
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── components/        # common, layout, listing, ui
│   │   ├── pages/             # vistas de la aplicación
│   │   ├── router/            # enrutador basado en history.pushState
│   │   ├── services/          # cliente HTTP hacia el backend
│   │   ├── styles/            # estilos globales
│   │   └── utils/             # auth, helpers
│   └── public/
│
├── docker-compose.yml         # orquesta backend, frontend y PostgreSQL
├── ruta-desarrollo.txt        # backlog y tareas identificadas
└── README.md
```

---

## ⚙️ Tecnologías

| Capa                | Tecnologías                                       |
| ------------------- | ------------------------------------------------- |
| **Frontend**        | HTML5, JavaScript ES6 Modules, Tailwind CSS, Vite |
| **Backend**         | Node.js, Express.js, `pg` (driver de PostgreSQL)  |
| **Base de datos**   | PostgreSQL 16, extensión `pgcrypto` (UUID)        |
| **Infraestructura** | Docker / Docker Compose                           |

---

## 🧩 Modelo de datos

La tabla principal `publications` representa los artículos publicados en la plataforma:

| Campo                       | Tipo          | Detalle                                        |
| --------------------------- | ------------- | ---------------------------------------------- |
| `id`                        | UUID          | Generado automáticamente (`gen_random_uuid()`) |
| `title`                     | VARCHAR(255)  | Obligatorio                                    |
| `description`               | TEXT          | Opcional                                       |
| `price`                     | DECIMAL(10,2) | Por defecto `0`                                |
| `category`                  | VARCHAR(100)  | Opcional                                       |
| `images`                    | TEXT[]        | Arreglo de URLs, por defecto vacío             |
| `status`                    | VARCHAR(20)   | `active` \| `sold` \| `inactive`               |
| `created_at` / `updated_at` | TIMESTAMP     | Auto-gestionados                               |

Incluye índices sobre `status` y `created_at` para optimizar listados y filtros.

---

## 🔌 API REST

Prefijo base: `/api`

| Método   | Endpoint                      | Descripción                                         |
| -------- | ----------------------------- | --------------------------------------------------- |
| `GET`    | `/status`                     | Verifica que el backend esté activo                 |
| `GET`    | `/publications`               | Lista todas las publicaciones (ordenadas por fecha) |
| `GET`    | `/publications/:id`           | Obtiene una publicación por ID                      |
| `POST`   | `/publications`               | Crea una nueva publicación (requiere vendedor verificado) |
| `PUT`    | `/publications/:id`           | Actualiza una publicación existente                 |
| `DELETE` | `/publications/:id`           | Elimina una publicación                             |

### Nuevos endpoints FASE 1

| Método   | Endpoint                              | Descripción                                         |
| -------- | ------------------------------------- | --------------------------------------------------- |
| `GET`    | `/verificaciones/mi-estado`           | Usuario: su estado de verificación                  |
| `GET`    | `/verificaciones/pendientes`          | Verificador: lista perfiles pendientes              |
| `GET`    | `/verificaciones/:id`                 | Verificador: detalle de verificación                |
| `POST`   | `/verificaciones/:id/aprobar`         | Verificador: aprobar perfil                         |
| `POST`   | `/verificaciones/:id/rechazar`        | Verificador: rechazar perfil (requiere motivo)      |
| `GET`    | `/verificaciones/historial/mio`       | Verificador: su historial                           |
| `GET`    | `/notificaciones`                     | Usuario: listar sus notificaciones                  |
| `PATCH`  | `/notificaciones/:id/leer`            | Marcar notificación como leída                      |
| `POST`   | `/notificaciones/leer-todas`          | Marcar todas como leídas                            |
| `DELETE` | `/notificaciones/:id`                 | Eliminar notificación                               |
| `GET`    | `/admin/verificadores`                | Admin: listar verificadores                         |
| `POST`   | `/admin/verificadores/:id`            | Admin: asignar rol verificador                      |
| `DELETE` | `/admin/verificadores/:id`            | Admin: quitar rol verificador                       |

Todas las rutas cuentan con middleware de manejo de errores (`error.middleware.js`) y de rutas no encontradas (`notFound.middleware.js`).

---

## 🧭 Rutas del frontend

El enrutador (`router/router.js`) resuelve las siguientes vistas mediante `history.pushState`:

```
/                          → Home
/explorar                  → Explorar publicaciones
/login                     → Inicio de sesión
/registro                  → Registro de usuario
/dashboard                 → Panel del usuario
/admin                     → Panel administrativo
/crear-publicacion         → Crear nueva publicación
/editar-publicacion/:id    → Editar publicación existente
*                          → Página no encontrada
```

---

## 🚀 Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/Jhaymayleth/muiska.git
cd muiska
```

### 2. Levantar todo con un solo comando

```bash
docker compose up -d
```

Esto construye y levanta los servicios de `postgres`, `backend` y `frontend`.

- Backend: http://localhost:3001/api/status
- Frontend: http://localhost:8080
- PostgreSQL: localhost:5433

### 3. Credenciales de prueba

La base de datos se inicializa con usuarios de prueba para acceso directo al panel:

- Admin
  - Email: `admin@admin.com`
  - Contraseña: `Admin123!`
- Usuario normal
  - Email: `user@user.com`
  - Contraseña: `User123!`

Si usas el modo manual con `backend/src/db/init.sql`, esta semilla también aplica.

### 3. Ver el estado de los servicios

```bash
docker compose ps
```

### 4. Detener los servicios

```bash
docker compose down
```

### 5. Iniciar desarrollo local de forma manual (opcional)

#### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Variables de entorno esperadas (`.env`):

```
PORT=3000
DB_HOST=localhost
DB_PORT=5433
DB_NAME=muiska
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=muiska_jwt_secret_dev_2024
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend en modo desarrollo se sirve en **http://localhost:5173** y usa proxy hacia el backend.

---

## 🗺️ Flujo general

```
┌────────────┐        fetch()        ┌────────────┐        pg.Pool        ┌────────────┐
│  Frontend  │ ────────────────────▶ │  Backend   │ ────────────────────▶ │ PostgreSQL │
│  (Vite)    │ ◀──────────────────── │ (Express)  │ ◀──────────────────── │  (Docker)  │
└────────────┘        JSON           └────────────┘        rows           └────────────┘
   :5173                                :3000/api                            :5432
```

---

## 📌 Estado actual

El proyecto se encuentra en **FASE 1 (Backend completado)**:

**✅ FASE 0 - BASELINE**: Docker compose, Auth JWT, CRUD Publicaciones, Categorías, Admin panel básico, Tests

**✅ FASE 1 - Backend**: 
- Migración BD: nuevos campos `users` (`tipo_usuario`, `estado_verificacion`, `badge_verificado`, `barrio_id`, `lat`, `lng`, `telefono`, `whatsapp`, `bio`, `foto_perfil_url`, `rating_promedio`, `total_reviews`), tabla `verificaciones`, tabla `notificaciones`, tabla `barrios`
- Auth Service: registro con `tipo_usuario` (cliente/vendedor), estado verificación inicial según rol
- Verification Service: CRUD verificaciones + notificaciones automáticas
- Notification Service: gestión completa notificaciones
- Middleware `requireVerifiedSeller`: protege creación de publicaciones
- Admin: asignar/quitar verificadores
- Rutas registradas: `/api/verificaciones`, `/api/notificaciones`, `/admin/verificadores`

**🔄 FASE 1 - Frontend (En curso)**: RegisterPage selector, VerificationPendingPage, NotificationStore, Auth guards, Header con notificaciones

---

<div align="center">

Desarrollado como parte del proceso formativo en **Riwi**

</div>
