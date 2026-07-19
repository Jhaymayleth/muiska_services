# 🐛 INFORME DE ERRORES Y PROBLEMAS - MUISKA

Fecha: 2026-07-18  
Rama: `refactor/reorganizacion-estructura` (commit `0506fa4`)

---

## 🔴 CRÍTICOS (Bloquean funcionalidad core)

### 1. **Inconsistencia de Roles: BD vs Código vs Documentación**
| Origen | Valores de Rol |
|--------|----------------|
| **BD (init.sql + seeds)** | `'user'`, `'admin'` |
| **Backend auth.middleware.js** | Usa `role` del token, `requireRole('admin')` |
| **Frontend session.store.js** | `isAdmin()` verifica `role === 'admin'` |
| **README.md** | Documenta roles: `admin`, `user` |
| **Planificación (RUTA_DESARROLLO)** | Requiere: `cliente`, `vendedor`, `emprendedor`, `verificador`, `admin` |

**Problema**: El código actual solo soporta `user` y `admin`. No existen roles `cliente`, `vendedor`, `emprendedor`, `verificador`. El plan de desarrollo requiere 5 roles pero el código solo implementa 2.

**Archivos afectados**:
- `backend/src/db/init.sql` - Tabla users: `role VARCHAR(20) DEFAULT 'user'`
- `backend/src/db/seeds/dev_users_seed.sql` - Roles `'admin'`, `'user'`
- `backend/src/middlewares/auth.middleware.js` - `requireRole('admin')`
- `frontend/src/state/session.store.js` - `isAdmin()` verifica `role === 'admin'`
- `frontend/src/utils/auth.js` - `protectedRoutes` incluye `/dashboard`, `/crear-publicacion`, etc.
- `README.md` - Documenta solo `admin` y `user`

---

### 2. **Esquema de BD Incompleto para Planificación Requerida**
Faltan columnas/campos necesarios para la funcionalidad planificada:

| Tabla | Campos Faltantes |
|-------|------------------|
| `users` | `tipo_usuario` (cliente/vendedor/verificador/admin), `estado_verificacion`, `verificado_por`, `verificado_en`, `motivo_rechazo_verificacion`, `barrio_id`, `lat`, `lng`, `telefono`, `whatsapp`, `bio`, `foto_perfil_url`, `rating_promedio`, `total_reviews`, `tiempo_respuesta_promedio`, `badge_verificado`, `telefono`, `whatsapp`, `documento_tipo`, `documento_numero`, `documento_foto_url` |
| `publications` | `tipo` (producto/servicio), `estado_moderacion`, `moderado_por`, `moderado_en`, `motivo_rechazo_moderacion`, `horario_atencion`, `area_cobertura`, `precio_tipo` (fijo/por_hora/cotizar) |
| **Tablas nuevas faltantes** | `barrios`, `verificaciones`, `moderaciones`, `notificaciones`, `conversaciones`, `mensajes`, `reviews` |

---

### 3. **Seed de Categorías Faltante**
- `init.sql` crea tabla `categories` pero **no inserta datos**
- `dev_users_seed.sql` solo inserta usuarios
- Al crear publicaciones falla la FK `category` si no existen categorías

---

### 4. **Migración 005 Favorites Incompleta**
- `005_favorites.sql` crea tabla `favorites` con PK compuesta `(user_id, publication_id)`
- **Falta**: Índices individuales en `user_id` y `publication_id` para consultas eficientes
- **Falta**: Trigger o constraint para evitar duplicados (aunque PK compuesta lo previene, mensajes de error no son amigables)

---

## 🟠 ALTOS (Funcionalidad importante incompleta)

### 5. **Frontend: Registro No Permite Seleccionar Rol**
- `RegisterPage.js` no tiene selector de rol (Cliente / Vendedor / Emprendedor)
- Todos los registros crean usuarios con rol por defecto `'user'`
- No hay validación para evitar que se registren como `verificador` o `admin`

### 6. **Frontend: Falta Vista de Verificación Pendiente**
- No existe `VerificacionPendientePage` para usuarios vendedores/emprendedores pendientes
- Usuario registrado como vendedor queda en limbo sin feedback visual

### 7. **Frontend: Verificador No Tiene Panel**
- No existe `VerificadorDashboardPage`, `VerificarPerfilesPage`, `ModerarPublicacionesPage`
- Rutas `/verificador` no existen en router

### 7. **Backend: Falta Middleware de Verificación**
- No existe `verification.middleware.js` para validar `estado_verificacion === 'aprobado'` antes de permitir crear publicaciones
- Vendedor no verificado puede crear publicaciones (bypass de seguridad)

### 8. **Backend: Faltan Servicios de Verificación/Moderación**
- No existe `verification.service.js` ni `moderation.service.js`
- Lógica de verificación/moderación no existe en backend

### 9. **Frontend: Falta Selector de Barrio en Registro/Publicación**
- No existe componente `BarrioAutocomplete`
- No existe `RadioSelector` para radio de búsqueda
- `CreateListingPage` usa input text libre para `location` y `category`

### 10. **Frontend: Perfil Público Vendedor Incompleto**
- `PublicationDetailPage` tiene botón de favoritos pero no muestra perfil vendedor completo
- Falta `PerfilPublicoVendedorPage` con badge verificado, rating, servicios/productos, contacto WhatsApp

### 11. **Frontend: Chat/Mensajería No Implementado**
- No existe `ChatPage`, `ChatWidget`
- No hay WebSocket/Socket.io configurado
- Contacto solo vía `contact_method` text field

### 11. **Backend: Falta Tabla `favorites` en init.sql**
- La migración `005_favorites.sql` existe pero `init.sql` no crea la tabla
- Docker compose ejecuta `init.sql` al primer arranque, falla si no existe

---

## 🟡 MEDIOS (Mejoras de arquitectura/UX)

### 12. **Inconsistencia Nombres Campos BD vs Código**
| BD | Código Frontend |
|----|-----------------|
| `contact_method` | `contactMethod` (camelCase) |
| `user_id` | `user_id` / `userId` (inconsistente) |
| `created_at` | `created_at` / `createdAt` |
| `category` (varchar) | `category` (string) vs `category_id` (FK) |

### 13. **Frontend: `api.js` Monolítico**
- `src/services/api.js` tiene 188 líneas con todos los endpoints mezclados
- Plan indica separar en `auth.service.js`, `publication.service.js`, `admin.service.js`

### 14. **Frontend: Falta Página de Estadísticas Admin (`/admin/estadisticas`)**
- Plan indica Chart.js para gráficas
- No existe `AdminStatsPage.js`

### 15. **Backend: Falta Documentación API (Swagger/OpenAPI)**
- No hay `swagger-jsdoc` ni `swagger-ui-express`

### 16. **Tests E2E Ausentes**
- Solo 1 test unitario backend (`publication.utils.test.js`)
- 0 tests frontend, 0 tests E2E (Playwright)

---

## 🟢 BAJOS (Deuda técnica / Mejores prácticas)

### 17. **Archivos Basura en Repositorio**
- `frontend/src/pages/admin/AdminPage_fixed.js` - archivo basura del intento fallido de AdminStats
- `frontend/src/pages/admin/AdminStatsPage.js` - archivo incompleto/roto
- `.opencode/plans/RUTA_DESARROLLO_MUISKA.md` - duplicado del documento raíz

### 18. **README Desactualizado**
- Documenta contraseñas `Admin123!`/`User123!` pero `init.sql` tiene hashes diferentes (no verificables)
- No documenta roles nuevos (`cliente`, `vendedor`, `emprendedor`, `verificador`)

### 19. **Docker: Puerto Backend Inconsistente**
- `docker-compose.yml`: backend expone `3001:3000`
- `backend/package.json`: `PORT=3000`
- Frontend nginx proxy pasa a `backend:3000` (correcto)
- Pero desarrollo local usa `localhost:3001` para backend, `localhost:5173` para frontend (Vite)

### 19. **Frontend: `vite.config.js` Proxy Hardcodeado**
```js
proxy: {
  "/api": {
    target: "http://localhost:3000",  // Hardcoded
    changeOrigin: true,
  },
}
```
No usa variable de entorno para puerto backend.

---

## 📋 RESUMEN DE ACCIÓN REQUERIDA (Prioridad)

| Prioridad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔴 Crítico | 4 | Roles BD vs Código, Esquema BD incompleto, Seed categorías, Migración favorites |
| 🟠 Alto | 11 | Registro con selector rol, Vista verificación pendiente, Panel verificador, Middleware verificación, Servicios verificación/moderación, Selector barrio, Perfil público vendedor, Chat, Tabla favorites en init.sql, Inconsistencia campos, api.js monolítico |
| 🟡 Medio | 6 | Stats Admin, Swagger, Tests E2E, Inconsistencia nombres, api.js monolítico, AdminStats |
| 🟢 Bajo | 4 | Archivos basura, README desactualizado, Docker puertos, Proxy hardcodeado |

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS (Orden Sugerido)

1. **Corregir esquema BD** - Migraciones 006-010 + seeds barrios + corrección roles en seeds
2. **Backend: Auth Service** - Registro con selector rol, estado_verificacion, middleware requireVerifiedSeller
3. **Backend: Verification Service + Moderation Service** - CRUD verificaciones/moderaciones + endpoints
4. **Backend: Verification/Moderation Middleware** - requireVerifiedSeller, requireVerifiedOrAdmin
5. **Frontend: RegisterPage** - Selector rol (Cliente/Vendedor/Emprendedor)
6. **Frontend: VerificacionPendientePage** - Pantalla loading para vendedores pendientes
7. **Frontend: VerificadorDashboard** - Tabs Perfiles/Publicaciones con approve/reject + modales motivo
8. **Frontend: AdminVerificadoresPage** - Asignar verificadores
8. **Backend: Migración Barrios + API Geo** - Tabla barrios + endpoints geo + búsqueda radio
9. **Frontend: BarrioAutocomplete + RadioSelector** - Componentes reutilizables
10. **Frontend: PerfilPublicoVendedor + WhatsApp** - Perfil público con contacto
11. **Backend: Chat Service + WebSocket** - Mensajería real-time
12. **Frontend: ChatPage + ChatWidget** - UI mensajería
13. **Admin: Stats Dashboard + Chart.js** - Gráficas + export CSV
12. **Tests + Swagger + Limpieza** - E2E, docs, limpieza archivos basura

---

*Generado automáticamente - Revisar y priorizar según capacidad del equipo*