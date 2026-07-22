# RUTA DE DESARROLLO - MUISKA
## Plataforma de Comercio Comunitario Hyperlocal para Barranquilla

---

## 🎯 VISIÓN DEL PRODUCTO

**MUISKA** conecta vendedores locales (electricistas, plomeros, vendedores de comida, artesanos, etc.) de barrios de Barranquilla con personas que buscan sus servicios/productos **por cercanía geográfica**.

> **Ejemplo core**: *Soy electricista en barrio El Prado. Una persona a 3 calles necesita reparación eléctrica. Ella me encuentra por barrio/radio, ve mi perfil verificado, me contacta por WhatsApp, concertamos y cierro la venta.*

---

## 📊 RESUMEN DEL PROYECTO

### Volumen de archivos
- **Total archivos versionados (git ls-files):** 207
- **Archivos de código fuente (js/jsx/ts/css/html/json/md/sql/yml):** 163
- **Archivos estáticos (imágenes, fuentes):** 24
- **node_modules/.git:** 0 (no están versionados)

### Desglose por área
- **Frontend (`frontend/src/`):** 112 archivos
  - Componentes reutilizables (`components/`)
  - Páginas (`pages/`)
  - Servicios API (`services/`)
  - Estado (`state/`)
  - Estilos SCSS (`styles/scss/`)
  - Plantillas HTML (`templates/`)
  - Utilidades (`utils/`)
  - Hooks (`hooks/`)

- **Backend (`backend/src/`):** 60 archivos
  - Arquitectura por capas: controllers, services, routes, middlewares, db (migrations/seeds), utils, validators
  - 9 migraciones SQL + seeds

- **Tests (`backend/tests/`):** 1 archivo (solo `publication.utils.test.js`)

### Tecnologías
| Layer             | Technologies                                                    |
| ----------------- | --------------------------------------------------------------- |
| **Frontend**      | HTML5, JavaScript ES6 Modules, Tailwind CSS, Vite, SCSS         |
| **Backend**       | Node.js, Express.js, JWT, Zod, Multer, Pino, Swagger            |
| **Database**      | PostgreSQL 16, `pgcrypto` extension (UUID)                      |
| **Infrastructure**| Docker / Docker Compose                                         |
| **Testing**       | Node.js Test Runner (`node --test`)                             |

---

## 👥 ROLES Y FLUJOS DE AUTENTICACIÓN

### Roles Disponibles
| Rol | Quién lo asigna | Quién puede elegir al registrarse | Acceso |
|-----|----------------|----------------------------------|--------|
| **Cliente** | Auto (registro) | ✅ Sí | Buscar, contactar, comprar |
| **Vendedor/Emprendedor** | Auto (registro) | ✅ Sí | Crear perfil, publicaciones (tras verificación) |
| **Verificador** | **Solo Admin** | ❌ No | Verificar perfiles + moderar publicaciones |
| **Admin** | Sistema/Existente | ❌ No | Todo: usuarios, verificadores, métricas, todo |

### Flujo de Registro y Verificación

```
┌─────────────────────────────────────────────────────────────────┐
│                        NUEVO USUARIO                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
               ┌────────────┴────────────┐
               ▼                         ▼
         ┌─────────────┐           ┌─────────────┐
         │   CLIENTE   │           │ VENDEDOR/   │
         │             │           │ EMPRENDEDOR │
         └──────┬──────┘           └──────┬──────┘
                │                         │
                ▼                         ▼
         Acceso inmediato          Registro completado
         (buscar, contactar)       │
                                   ▼
                          ┌─────────────────────┐
                          │  ESTADO: PENDIENTE  │
                          │  VERIFICACIÓN       │
                          │                     │
                          │  Pantalla: "Tu      │
                          │   perfil está en    │
                          │   verificación.     │
                          │   Te notificaremos  │
                          │   cuando esté listo.│
                          └──────────┬──────────┘
                                     │
                     ┌───────────────┴───────────────┐
                     ▼                               ▼
             ┌───────────────┐               ┌───────────────┐
             │   APROBADO    │               │   RECHAZADO   │
             │               │               │               │
             │ • Notificación│               │ • Notificación│
             │   "Perfil      │               │   "Perfil     │
             │   verificado" │               │   rechazado:  │
             │ • Badge ✅    │               │   [motivo]    │
             │ • Acceso a    │               │ • Puede       │
             │   crear pubs  │               │   corregir y  │
             │ • Panel       │               │   reintentar  │
             │   vendedor    │               │               │
             └───────────────┘               └───────────────┘
```

### Flujo de Publicaciones (Moderación Obligatoria)

```
VENDEDOR VERIFICADO
        │
        ▼
┌──────────────────┐
│ Crear publicación │
│ (producto/servicio)│
└────────┬─────────┘
         │
         ▼
┌────────────────────────┐
│ ESTADO: PENDIENTE      │
│ MODERACIÓN             │
│                        │
│ "Tu publicación está   │
│  en revisión. Te      │
│  notificaremos cuando  │
│  sea aprobada."        │
└────────┬───────────────┘
         │
    ┌────┴────┐
    ▼         ▼
APROBADA   RECHAZADA
    │         │
    ▼         ▼
Se publica  Notificación
en la       con motivo +
plataforma  puede corregir
            y reenviar
```

---

## 🔐 MATRIZ DE PERMISOS

| Acción | Cliente | Vendedor (verificado) | Verificador | Admin |
|--------|---------|----------------------|-------------|-------|
| Registrarse | ✅ | ✅ | ❌ (solo admin asigna) | ✅ |
| Buscar/Explorar | ✅ | ✅ | ✅ | ✅ |
| Contactar vendedor | ✅ | ✅ | ✅ | ✅ |
| Crear perfil vendedor | ❌ | ✅ (tras verificación) | ❌ | ✅ |
| Crear publicaciones | ❌ | ✅ (pasa moderación) | ❌ | ✅ |
| Verificar perfiles | ❌ | ❌ | ✅ | ✅ |
| Moderar publicaciones | ❌ | ❌ | ✅ | ✅ |
| Asignar verificadores | ❌ | ❌ | ❌ | ✅ |
| Ver métricas/admin panel | ❌ | ❌ | ✅ (limitado) | ✅ |
| Banear usuarios | ❌ | ❌ | ❌ | ✅ |
| Ver auditoría completa | ❌ | ❌ | ❌ | ✅ |

---

## 🏗️ ARQUITECTURA TÉCNICA

### Backend - Estructura de archivos
```
backend/
├── src/
│   ├── config/               # PostgreSQL connection, logger, env vars
│   ├── controllers/          # Business logic per module (thin, delegates to services)
│   ├── middlewares/          # JWT auth, validation, file upload, rate-limit, error handling
│   ├── routes/               # REST endpoint definitions
│   ├── services/             # Service layer (business logic + DB queries)
│   ├── utils/                # Utilities (publication formatting)
│   ├── validators/           # Validation schemas (Zod)
│   ├── db/
│   │   ├── migrations/       # SQL migrations (001_users.sql ... 009_messages.sql)
│   │   └── seeds/            # Seed data
│   ├── app.js                # Express app setup, routes, middlewares
│   └── server.js             # Server bootstrap, runs migrate + seed
├── tests/                    # Unit tests (publication.utils.test.js)
└── uploads/                  # Uploaded files
```

### Frontend - Estructura de archivos
```
frontend/
├── src/
│   ├── components/           # common, layout, listing, ui
│   ├── pages/                # Application views (HomePage, ExplorePage, etc.)
│   │   └── admin/            # Admin panel
│   │   └── dashboard/        # User dashboard
│   ├── router/               # History pushState-based router
│   ├── services/             # HTTP client for the backend (api.js)
│   ├── state/                # Reactive stores (session, notifications)
│   ├── styles/               # Global SCSS styles
│   ├── templates/            # Reusable HTML fragments (loaded via templateLoader.js)
│   ├── utils/                # Auth, helpers, template loader
│   ├── hooks/                # Custom hooks (useGeolocation.js)
│   ├── App.js                # Root component
│   └── main.js               # Entry point
├── public/                   # Static assets
└── Dockerfile
```

### Patrones de código clave

#### Backend
- **Arquitectura por capas:** Controllers (HTTP) → Services (lógica de negocio + DB) → DB
- **Manejo de errores:** Los services lanzan errores con `error.code` (ej: `NOT_FOUND`, `INVALID_PRICE`), los controllers los capturan y envían el status HTTP apropiado
- **Validación:** Zod schemas en `validators/schemas.js`, aplicados vía middleware `validateBody`, `validateQuery`, `validateParams`
- **Autenticación:** JWT con `verifyToken` middleware, `requireRole` para roles específicos, `requireAdmin` para admin
- **Verificación de vendedores:** `requireVerifiedSeller` middleware verifica que el usuario sea vendedor verificado antes de crear publicaciones
- **Convenciones:** ES modules (`import/export`), camelCase para JS, snake_case para DB columns

#### Frontend
- **SPA con routing manual:** `router.js` usa History API (`pushState`), con guards de autenticación
- **Templates HTML:** Archivos `.html` en `templates/` cargados via `templateLoader.js`, con soporte para `{{#if}}`, `{{#repeat}}`, `{{variable}}`
- **Componentes:** Funciones que retornan `HTMLElement`, usan `loadTemplate` para HTML y manipulan el DOM directamente
- **Estado:** `sessionStore` (localStorage) y `notificationStore` (con subscribe pattern + toast notifications)
- **API client:** `api.js` centraliza todas las llamadas HTTP, maneja tokens, FormData, snake_case conversion
- **Estilos:** Tailwind CSS + SCSS, variables en `_variables.scss`, componentes en `_components/`

### Base de Datos - Esquema actual

#### Tabla `users` (001_users.sql)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla `publications` (003_publications.sql)
```sql
CREATE TABLE publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    location VARCHAR(255),
    contact_method VARCHAR(50),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    type VARCHAR(20) NOT NULL DEFAULT 'product',
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP,
    rejection_reason TEXT,
    business_hours JSONB,
    coverage_area JSONB,
    price_type VARCHAR(20) NOT NULL DEFAULT 'fixed',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (base: `/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/status` | Backend status |
| `GET` | `/api/health` | Health check with database |
| `POST` | `/api/auth/register` | User registration (con `userType`: client/seller) |
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/auth/me` | Authenticated user profile |
| `PUT` | `/api/auth/profile` | Update user profile |
| `GET` | `/api/publications` | List publications |
| `GET` | `/api/publications/:id` | Publication details |
| `POST` | `/api/publications` | Create publication (verified seller) |
| `PUT` | `/api/publications/:id` | Update publication |
| `DELETE` | `/api/publications/:id` | Delete publication |
| `GET` | `/api/categories` | List categories |
| `GET` | `/api/favorites` | List user favorites |
| `POST` | `/api/favorites/:pubId` | Add to favorites |
| `DELETE` | `/api/favorites/:pubId` | Remove from favorites |
| `GET` | `/api/verifications/my-status` | User verification status |
| `GET` | `/api/verifications/pending` | List pending verifications |
| `GET` | `/api/verifications/:id` | Verification details |
| `POST` | `/api/verifications/:id/approve` | Approve verification |
| `POST` | `/api/verifications/:id/reject` | Reject verification |
| `GET` | `/api/notifications` | List user notifications |
| `PATCH` | `/api/notifications/:id/read` | Mark as read |
| `POST` | `/api/notifications/read-all` | Mark all as read |
| `DELETE` | `/api/notifications/:id` | Delete notification |
| `GET` | `/api/admin/users` | List users |
| `PATCH` | `/api/admin/users/:id` | Update user |
| `DELETE` | `/api/admin/users/:id` | Delete user |
| `GET` | `/api/admin/verifiers` | List verifiers |
| `POST` | `/api/admin/verifiers/:id` | Assign verifier role |
| `DELETE` | `/api/admin/verifiers/:id` | Remove verifier role |
| `GET` | `/api/admin/publications` | List publications |
| `PATCH` | `/api/admin/publications/:id` | Update publication |
| `DELETE` | `/api/admin/publications/:id` | Delete publication |
| `PATCH` | `/api/publications/:id/moderation` | Moderate publication |
| `GET` | `/api/barrios` | List barrios |
| `GET` | `/api/barrios/:id` | Barrio details |

### Frontend Routes
```
/                          → Home / Landing
/explore                   → Browse publications
/login                     → Login
/register                  → User registration
/verification-pending      → Verification pending screen (sellers)
/dashboard                 → User dashboard
/dashboard/favorites       → User favorites
/admin                     → Admin panel
/create                    → Create new publication
/edit/:id                  → Edit existing publication
/listing/:id               → Publication details
/profile                   → User profile
/chat                      → Chat page
/chat/:id                  → Chat conversation
/perfil-publico            → Public seller profile
/perfil-publico/:id        → Public seller profile by ID
/verificador-dashboard     → Verifier dashboard
*                          → Not found page
```

---

## 🛠️ INSTRUCCIONES DE DESARROLLO

### Cómo correr el proyecto

#### Con Docker (recomendado)
```bash
docker compose up -d
```
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3001/api/status
- **Swagger docs:** http://localhost:3001/api/docs
- **PostgreSQL:** puerto 5433

#### Sin Docker (desarrollo manual)

##### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

##### Frontend
```bash
cd frontend
npm install
npm run dev
```
- Frontend en dev mode: http://localhost:5173

### Cómo correr tests
```bash
cd backend
npm test
```
El backend usa Node.js native test runner (`node --test`).

### Credenciales de prueba
| Role    | Email              | Password    |
| ------- | ------------------ | ----------- |
| Admin   | admin@admin.com    | Admin123!   |
| User    | user@user.com      | User123!    |

---

## 📋 ESTADO ACTUAL DEL PROYECTO

### Backend ✅ (Completado)
- [x] Migración BD: nuevos campos users, tabla verificaciones, notificaciones
- [x] Auth Service: registro con `userType` (client/seller)
- [x] Verification Service: CRUD verificaciones, notificaciones
- [x] Notification Service: CRUD notificaciones
- [x] Middleware: `requireVerifiedSeller` para crear publicaciones
- [x] Admin Controller: asignar/quitar verificadores
- [x] Rutas: `/api/verifications`, `/api/notifications`, `/api/admin/verifiers`
- [x] Controllers: `verification.controller.js`, `notification.controller.js`

### Frontend ✅ (Completado)
- [x] RegisterPage: selector "Cliente" / "Vendedor/Emprendedor"
- [x] VerificacionPendientePage: pantalla loading "Tu perfil en verificación..."
- [x] NotificationStore + toast notifications + badge en header
- [x] Auth guard: redirigir vendedor no verificado a /verification-pending
- [x] Header: badge notificaciones + dropdown
- [x] VerificadorDashboardPage: panel con tabs para verificaciones y moderación

### Pendiente (Faltante)
- [ ] Tabla `barrios` + seed 70+ barrios oficiales con lat/lng/localidad
- [ ] Migración users: `barrio_id`, `lat`, `lng`, `phone`, `whatsapp`, `bio`, `profile_image_url`, `avg_rating`, `total_reviews`
- [ ] API barrios: `GET /api/barrios?q=`, `GET /api/barrios/:id`
- [ ] API publicaciones: `GET /api/publications?lat=x&lng=y&radius_km=3`
- [ ] Índices geoespaciales
- [ ] BarrioAutocomplete component
- [ ] RadioSelector: 1km, 3km, 5km, 10km + "Usar mi ubicación"
- [ ] ExplorarPage: filtros barrio + radio km + mapa resultados
- [ ] Perfil público vendedor con contacto WhatsApp
- [ ] Chat in-app entre comprador-vendedor
- [ ] Notificaciones push (Service Worker + Web Push API)
- [ ] Admin Dashboard con Chart.js
- [ ] PWA (Service Worker, offline-first, push notifications)
- [ ] Tests E2E (Playwright)
- [ ] Documentación API (Swagger/OpenAPI)

---

## ⚠️ NOTAS CLAVE PARA TRABAJAR EN EL PROYECTO

1. **Verificador NO se registra** → Solo Admin lo asigna vía `/api/admin/verifiers/:id`
2. **Cliente NO se verifica** → Acceso inmediato, `verification_status = 'approved'` al registrarse como cliente
3. **Publicación SIN moderación NO sale** → `moderation_status = 'pending'` por defecto, requiere aprobación de verificador
4. **Verificador ve TODO** → Perfiles + Publicaciones en un panel (`/verificador-dashboard`)
5. **Admin todopoderoso** → Asigna verificadores, ve métricas, gestiona todo
6. **Barranquilla first** → Datos reales de barrios, no genéricos
7. **Verificador ve motivos** → Transparencia total en rechazos (campo `reason` obligatorio al rechazar)
8. **Frontend es SPA con routing manual** → No usa React/Vue, usa History API + templates HTML
9. **API client convierte camelCase a snake_case** → El frontend envía `businessHours` y el backend recibe `business_hours`
10. **Error handling con códigos** → Los services lanzan errores con `error.code`, los controllers los mapean a HTTP status
11. **Migraciones corren automáticamente** → `server.js` ejecuta `migrate()` y `seed()` al iniciar
12. **Rate limiting activo** → `apiLimiter` en todas las rutas, `registerLimiter` y `authLimiter` en auth

---

## 📝 NOTAS CLAVE DE IMPLEMENTACIÓN

1. **Verificador NO se registra** → Solo Admin lo asigna
2. **Cliente NO se verifica** → Acceso inmediato
3. **Publicación SIN moderación NO sale** → Seguridad total
4. **Verificador ve TODO** → Perfiles + Publicaciones en un panel
5. **Admin todopoderoso** → Asigna verificadores, ve métricas, gestiona todo
6. **Barranquilla first** → Datos reales de barrios, no genéricos
7. **Verificador ve motivos** → Transparencia total en rechazos

---

*Documento vivo - Actualizar conforme avanza el desarrollo*
*Última actualización: 2026-07-21*