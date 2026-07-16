# MUISKA

Plataforma de comercio comunitario. Backend con Express.js + PostgreSQL y frontend SPA con Vite + Tailwind CSS.

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recomendado) o Docker Engine + Docker Compose
- Git

## Inicio rápido (Docker)

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio> muiska
cd muiska

# 2. Iniciar todos los servicios
docker compose up -d

# 3. Verificar el estado
docker compose ps
```

La aplicación estará disponible en:

| Servicio | URL |
|---|---|
| Frontend | http://localhost |
| Backend API | http://localhost/api/status |
| PostgreSQL | localhost:5433 |

### Comandos útiles

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend

# Detener y eliminar contenedores
docker compose down

# Reconstruir imágenes tras cambios
docker compose up -d --build

# Eliminar también los volúmenes (borra la BD)
docker compose down -v
```

## Desarrollo manual (sin Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Base de datos

Opción A — Con Docker (solo PostgreSQL):

```bash
docker compose up -d postgres
```

Opción B — PostgreSQL local con los datos del `.env`.

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5433` |
| `DB_NAME` | Nombre de la BD | `muiska` |
| `DB_USER` | Usuario de la BD | `postgres` |
| `DB_PASSWORD` | Contraseña de la BD | `postgres` |
| `JWT_SECRET` | Secreto para firmar tokens JWT | `muiska_jwt_secret_dev_2024` |

> En Docker, `DB_HOST` se sobreescribe automáticamente al nombre del servicio (`postgres`).

## API

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/status` | Estado del servidor |
| `POST` | `/api/auth/register` | Registrar usuario |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET` | `/api/auth/me` | Perfil del usuario autenticado |
| `GET` | `/api/publications` | Listar publicaciones |
| `GET` | `/api/publications/:id` | Obtener publicación |
| `POST` | `/api/publications` | Crear publicación |
| `PUT` | `/api/publications/:id` | Actualizar publicación |
| `DELETE` | `/api/publications/:id` | Eliminar publicación |
| `GET` | `/api/categories` | Listar categorías |

## Estructura del proyecto

```
muiska/
├── docker-compose.yml          # Orquestación de servicios
├── backend/
│   ├── Dockerfile              # Imagen del backend
│   ├── .dockerignore
│   └── src/
│       ├── server.js            # Punto de entrada
│       ├── app.js               # Configuración de Express
│       ├── config/database.js   # Conexión a PostgreSQL
│       ├── db/init.sql          # Esquema de la BD
│       ├── routes/              # Rutas de la API
│       ├── controllers/         # Lógica de negocio
│       └── middlewares/         # Middlewares (auth, upload, errores)
├── frontend/
│   ├── Dockerfile              # Imagen del frontend (multi-stage)
│   ├── .dockerignore
│   ├── nginx.conf              # Configuración de Nginx para producción
│   ├── vite.config.js
│   └── src/
│       ├── main.js
│       ├── App.js
│       ├── router/
│       ├── pages/
│       ├── components/
│       └── services/
└── README.md
```
