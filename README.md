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
muiska_services/
├── frontend/                  # SPA con Vite + Tailwind + JS vanilla
│   ├── src/
│   │   ├── components/        # common, layout, listing, ui
│   │   ├── pages/              # home, explore, login, register,
│   │   │                        # dashboard, admin, create/edit-listing, not-found
│   │   ├── router/             # enrutador basado en history.pushState
│   │   ├── services/           # cliente HTTP hacia el backend (api.js)
│   │   └── styles/             # estilos globales
│   ├── index.html
│   ├── login.html
│   └── tailwind.config.js
│
├── backend/                   # API REST con Express
│   └── src/
│       ├── controllers/        # lógica de negocio (status, publication)
│       ├── routes/              # definición de endpoints
│       ├── middlewares/         # manejo de errores y rutas no encontradas
│       ├── config/               # conexión a PostgreSQL (pg Pool)
│       ├── app.js
│       └── server.js
│
├── database/
│   └── init.sql               # esquema inicial (tabla publications)
│
└── docker-compose.yml         # contenedor de PostgreSQL
```

---

## ⚙️ Tecnologías

| Capa | Tecnologías |
|---|---|
| **Frontend** | HTML5, JavaScript ES6 Modules, Tailwind CSS, Vite |
| **Backend** | Node.js, Express.js, `pg` (driver de PostgreSQL) |
| **Base de datos** | PostgreSQL 16, extensión `pgcrypto` (UUID) |
| **Infraestructura** | Docker / Docker Compose |

---

## 🧩 Modelo de datos

La tabla principal `publications` representa los artículos publicados en la plataforma:

| Campo | Tipo | Detalle |
|---|---|---|
| `id` | UUID | Generado automáticamente (`gen_random_uuid()`) |
| `title` | VARCHAR(255) | Obligatorio |
| `description` | TEXT | Opcional |
| `price` | DECIMAL(10,2) | Por defecto `0` |
| `category` | VARCHAR(100) | Opcional |
| `images` | TEXT[] | Arreglo de URLs, por defecto vacío |
| `status` | VARCHAR(20) | `active` \| `sold` \| `inactive` |
| `created_at` / `updated_at` | TIMESTAMP | Auto-gestionados |

Incluye índices sobre `status` y `created_at` para optimizar listados y filtros.

---

## 🔌 API REST

Prefijo base: `/api`

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/status` | Verifica que el backend esté activo |
| `GET` | `/publications` | Lista todas las publicaciones (ordenadas por fecha) |
| `GET` | `/publications/:id` | Obtiene una publicación por ID |
| `POST` | `/publications` | Crea una nueva publicación |
| `PUT` | `/publications/:id` | Actualiza una publicación existente |
| `DELETE` | `/publications/:id` | Elimina una publicación |

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
git clone https://github.com/Jhaymayleth/muiska_services.git
cd muiska_services
```

### 2. Base de datos (Docker)

```bash
docker compose up -d
```

Esto levanta un contenedor PostgreSQL 16 en el puerto `5432` con la base `muiska`. Luego, ejecuta el script de inicialización:

```bash
docker exec -i muiska-postgres psql -U postgres -d muiska < backend/src/db/init.sql
```

### 3. Backend

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
DB_PORT=5432
DB_NAME=muiska
DB_USER=postgres
DB_PASSWORD=postgres
```

El backend queda disponible en **http://localhost:3000/api/status**

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend queda disponible en **http://localhost:5173**

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

El proyecto se encuentra en **fase inicial**: la base del CRUD de publicaciones ya está funcional (frontend, backend y base de datos conectados), y la estructura está preparada para escalar hacia autenticación, roles y nuevas funcionalidades de comercio comunitario.

---

<div align="center">

Desarrollado como parte del proceso formativo en **Riwi**

</div>