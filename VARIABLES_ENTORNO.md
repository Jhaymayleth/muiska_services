# Variables de entorno — MUISKA

**Fecha:** 2026-11-18
**Arquitectura:** backend Express + PostgreSQL (`:3001` en Docker) y frontend SPA servido por Nginx (`:8080`).

## Cómo se cargan

- **Backend:** `dotenv.config()` en `backend/src/config/index.js:3` lee `backend/.env` (o las variables inyectadas por Docker Compose). `getEnv()` lanza error si falta una variable **sin valor por defecto**.
- **Frontend:** no usa variables propias. Su cliente llama a rutas relativas `/api` (`frontend/src/services/api.js:1`) y Nginx las proxya a `http://backend:3000` (`frontend/nginx.conf`). Por eso **no necesita `VITE_*`**.
- `.env` no está versionado; el repo solo incluye `backend/.env.example`.

## Backend

| Variable | ¿Obligatoria? | Valor por defecto | Ejemplo | Descripción / evidencia |
|---|---|---|---|---|
| `NODE_ENV` | No (Sí en producción) | `development` | `production` | Activa comportamientos de producción (`config/index.js:19`). |
| `PORT` | No | `3000` | `3000` | Puerto del API (`server.js:7`, `config/index.js:22`). En Compose se publica como `3001:3000`. |
| `DB_HOST` | No (Sí en producción) | `localhost` | `postgres` | Host PostgreSQL (`config/index.js:26`). |
| `DB_PORT` | No | `5432` | `5432` | Puerto interno de PostgreSQL. |
| `DB_NAME` | No | `muiska` | `muiska` | Base de datos. |
| `DB_USER` | No | `postgres` | `postgres` | Usuario. |
| `DB_PASSWORD` | No (Sí en producción) | `postgres` | `postgres` | Contraseña. **Cambiar en producción.** |
| `JWT_SECRET` | **Sí en producción** | `dev-secret-key-change-in-production` | cadena larga aleatoria | Firma de JWT (`config/index.js:35`). El valor por defecto es inseguro. |
| `JWT_EXPIRES_IN` | No | `7d` | `1h` / `7d` | Vigencia del token (`config/index.js:36`). |
| `CORS_ORIGIN` | No | `http://localhost:5173` | `http://localhost:8080` | Origen permitido por CORS (`config/index.js:40`). En Docker el frontend es `:8080`; con Nginx el API es mismo origen, pero conviene declararlo. |
| `MAX_FILE_SIZE` | No | `5242880` (5 MB) | `5242880` | Tamaño máximo de subida (`config/index.js:44`). Multer además limita a 5 archivos. |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | `900000` | Ventana del rate limit (`config/index.js:48`). El límite global usa una ventana fija de 15 min (`rateLimit.middleware.js`). |
| `RATE_LIMIT_MAX` | No | `100` | `100` | Máximo de peticiones por ventana; `apiLimiter` se monta sobre `/api` (`app.js`). |
| `RATE_LIMIT_AUTH_MAX` | No | `10` | `10` | Intentos de login por IP cada 15 min (`rateLimit.middleware.js`). Compose local usa `50` para poder repetir el E2E. |
| `RATE_LIMIT_REGISTER_MAX` | No | `3` | `3` | Registros por IP cada hora. En producción debe mantenerse bajo. |
| `VAPID_PUBLIC_KEY` | No (recomendada) | se genera al arrancar | clave pública base64url | Clave pública de Web Push. Si falta, se genera una nueva en cada arranque y las suscripciones se invalidan. |
| `VAPID_PRIVATE_KEY` | No (recomendada) | se genera al arrancar | clave privada base64url | Clave privada de Web Push; debe ser estable entre despliegues. |
| `VAPID_SUBJECT` | No | `mailto:muiska@localhost` | `mailto:soporte@muiska.com` | Contacto que exige el protocolo VAPID. |
| `RUN_SEEDS` | No | *(vacío)* | `true` | Solo con `true` se ejecutan seeds al arrancar (`db/seed.js:57`). Compose lo pone en `true`. |

## Frontend

| Variable | ¿Obligatoria? | Nota |
|---|---|---|
| — | — | No requiere variables. Usa `/api` relativo y Nginx proxya al backend. |

## `.env` mínimo para local (sin Docker)

Crear `backend/.env`:

```bash
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=muiska
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=cambia-esta-clave-por-una-larga-y-aleatoria
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
RUN_SEEDS=true
```

## Variables que faltan en `backend/.env.example`

El ejemplo actual solo lista `PORT`, `DB_*` y `JWT_SECRET`. Faltan:

- `NODE_ENV`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `MAX_FILE_SIZE`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX`
- `RUN_SEEDS`

## Con Docker Compose

No hace falta `.env`: `docker-compose.yml` inyecta `PORT`, `NODE_ENV`, `DB_*`, `JWT_SECRET` y `RUN_SEEDS` directamente, con `DB_HOST=postgres`.

## Notas de seguridad

- `JWT_SECRET` y `DB_PASSWORD` son los secretos críticos; no reutilices los valores de ejemplo.
- `backend/uploads/` guarda archivos subidos y no debe versionarse.
- Las claves VAPID de Web Push se leen de `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY` (`services/push.service.js:6`). Si no se definen, se generan en cada arranque y las suscripciones se invalidan al reiniciar: configúralas en producción.
- Todo el tráfico del frontend pasa por `/api`; si publicas el API en otro dominio, actualiza `CORS_ORIGIN` y el `baseURL` del cliente.
