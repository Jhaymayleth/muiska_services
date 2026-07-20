# Skill Prompt - MUISKA Development Assistant

## Project Context
**MUISKA** - Hyperlocal marketplace for Barranquilla, Colombia. Connects local sellers (electricians, plumbers, food vendors, artisans) with nearby buyers via geolocation.

**Stack**: Node.js/Express + PostgreSQL (pg) + Vanilla JS/Vite Frontend + Docker Compose

---

## 🎯 Current Working State (as of 2026-07-18)

### Completed (Phases 0-4 + Extras)
- ✅ Docker Compose (PostgreSQL 16, Backend 3001, Frontend 8080, Nginx)
- ✅ Auth JWT (register, login, middleware, sessions)
- ✅ CRUD Publications + Categories
- ✅ Admin Panel (users, publications, categories)
- ✅ Favorites system (toggle, list, check)
- ✅ Frontend: SCSS, assets, sessionStore, router auth guards
- ✅ Tests passing, Docker builds clean

### Branch: `refactor/reorganizacion-estructura` (commit `ae168c9`)

---

## 🚫 Current Blockers (CRÍTICOS - Priority Order)

### 1. **Roles BD vs Código vs Docs desalineados**
- **BD**: solo `user` / `admin`
- **Plan requiere**: `cliente`, `vendedor`, `emprendedor`, `verificador`, `admin`
- **Archivos**: `init.sql`, `seeds`, `auth.middleware.js`, `session.store.js`

### 2. **Esquema BD incompleto** (~25 campos faltantes en users, ~10 en publications, 7 tablas nuevas)

### 3. **Seed categorías** - ✅ FIXED (15 categorías en init.sql)

### 4. **Migración 005 favorites** - falta en init.sql, índices individuales

---

## 🎯 Próximos Pasos Inmediatos (Orden de Prioridad)

### PRÓXIMO: **Seed Roles / Corrección Roles BD** (Crítico #1)
1. Migración BD: agregar `tipo_usuario`, `estado_verificacion`, campos geo, etc.
2. Seeds: actualizar passwords admin/user a `Admin123!` / `User123!` (README)
3. Auth Service: registro con selector `tipo_usuario` (cliente/vendedor)
4. Middleware: `requireVerifiedSeller` para crear publicaciones

### LUEGO: **Verificación/Moderación** (Fase 2)
- Verification Service + Moderation Service
- Verificador Dashboard (tabs Perfiles/Publicaciones)
- Admin: asignar verificadores

### LUEGO: **Geo Hyperlocal** (Fase 3)
- Tabla `barrios` + seed 70+ barrios Barranquilla
- API geo: radio km, autocomplete barrio
- Frontend: BarrioAutocomplete, RadioSelector

---

## 🛠️ Cómo Trabajar Eficientemente

### Comandos Clave
```bash
# Backend
cd backend && npm test           # Tests
cd backend && node --check src/server.js  # Syntax check

# Frontend
cd frontend && npm run build     # Build check

# Docker
docker compose build backend && docker compose up -d backend
docker compose logs -f backend

# DB
docker exec muiska-postgres psql -U postgres -d muiska -c "SELECT * FROM categories;"
docker cp file.sql muiska-postgres:/tmp/file.sql && docker exec muiska-postgres psql -U postgres -d muiska -f /tmp/file.sql

# Git
git status && git add -A && git commit -m "mensaje"
```

### Patrones de Código Establecidos
- **Backend**: Controllers → Services → SQL (controllers delgados)
- **Frontend**: Services API → Components → Pages → Router con auth guards
- **Estilo**: Comentarios explicativos, nombres claros, sin hardcodeos
- **Commits**: `tipo(scope): mensaje` en español, un commit por paso lógico

### Docker/DB Reset
```bash
docker compose down -v && docker compose up -d
# Re-ejecutar seeds si necesario:
docker cp backend/src/db/seeds/archivo.sql muiska-postgres:/tmp/ && docker exec muiska-postgres psql -U postgres -d muiska -f /tmp/archivo.sql
```

---

## 📁 Archivos Clave del Proyecto

```
backend/
├── src/
│   ├── config/database.js          # Pool pg
│   ├── config/database.js          # Pool pg
│   ├── services/
│   │   ├── auth.service.js         # register, login, getMe, updateProfile
│   │   ├── publication.service.js  # CRUD + favoritos
│   │   ├── category.service.js
│   │   └── admin.service.js
│   ├── controllers/                # Solo HTTP, delegan a services
│   ├── routes/
│   ├── middlewares/
│   │   └── auth.middleware.js      # verifyToken, requireRole, requireAdmin
│   ├── db/
│   │   ├── init.sql                # Schema + seeds (users, categories, publications)
│   │   ├── migrations/             # 001-005 (users, categories, pubs, cat_fk, favorites)
│   │   └── seeds/
│   │       ├── dev_users_seed.sql
│   │       └── dev_categories_seed.sql
│   └── middlewares/auth.middleware.js
│
frontend/
├── src/
│   ├── pages/
│   │   ├── admin/AdminPage.js      # Tabs: dashboard, publications, categories, users
│   │   ├── dashboard/DashboardPage.js  # Tabs: Mis pubs / Favoritos
│   │   ├── ExplorePage.js          # Filtros + grid
│   │   ├── HomePage.js             # Hero + categorías + destacadas
│   │   ├── LoginPage/RegisterPage
│   │   └── PublicationDetailPage.js
│   ├── services/
│   │   ├── api.js                  # Cliente HTTP base + auth/admin/pub methods
│   │   ├── auth.service.js         # login, register, getMe, etc.
│   │   └── publication.service.js  # getPublications, toggleFavorite, etc.
│   ├── state/session.store.js      # Centralizado localStorage (token, user, isAdmin)
│   ├── utils/auth.js               # Wrappers + protectedRoutes/guestRoutes
│   ├── router/router.js            # SPA router + auth guards
│   └── components/listing/ListingCard.js  # Card con botón favorito
```

---

## 🧪 Verificación Rápida Antes de Continuar

```bash
# 1. Tests backend
cd backend && npm test
# ✅ 1 passing (publication.utils.test.js)

# 2. Build frontend
cd frontend && npm run build
# ✅ builds in ~1.5s, ~103kB gzipped JS

# 3. Docker up + login test
docker compose up -d
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"Admin123!"}'
# ✅ Returns token + user{role:"admin"}

# 4. Categorías cargadas
curl http://localhost:3001/api/categories
# ✅ 15 categorías
```

---

## 📋 Documentos de Referencia (en `.opencode/plans/`)

| Archivo | Descripción |
|---------|-------------|
| `RUTA_DESARROLLO_MUISKA.md` | Roadmap completo 7 fases + esquema BD + estructura archivos |
| `INFORME_ERRORES_MUISKA.md` | Informe detallado 31 issues (4 críticos, 11 altos, 6 medios, 4 bajos) |

---

## ⚠️ Reglas de Trabajo

1. **NO committear** archivos `.opencode/plans/*` ni `RUTA_DESARROLLO_MUISKA.md` en raíz
2. **Un commit por paso lógico** con mensaje en español
3. **Tests + Build** deben pasar antes de commit
4. **Docker rebuild** tras cambios en `init.sql`, `Dockerfile`, `package.json`
5. **Seed passwords**: `Admin123!` / `User123!` (según README)
7. **Roles actuales**: solo `user` / `admin` — NO implementar verificador/admin en registro aún

---

## 🚀 Próximo Comando Sugerido

```bash
# Empezar con Seed Roles / Corrección Roles BD
# 1. Crear migración 006_users_roles_verificacion.sql
# 2. Actualizar dev_users_seed.sql con passwords Admin123! / User123!
# 3. Actualizar auth.service.js register() para aceptar tipo_usuario
# 4. Crear verification.middleware.js (requireVerifiedSeller)
```

---

*Última actualización: 2026-07-19 | Commit actual: ae168c9 | Rama: refactor/reorganizacion-estructura*