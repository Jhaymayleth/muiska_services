# Errores Pendientes - MUISKA

## Backend

| # | Archivo | Problema | Estado |
|---|---------|----------|--------|
| 8 | `middlewares/error.middleware.js` | Regex `/^\d{5}$/` no matchea códigos alfanuméricos como `22P02`, cambiado a `/^[A-Z0-9]{5}$/` | ✅ |
| 9 | `utils/publication.utils.js` | `price: Number.isFinite(price) && price > 0 ? price : NaN` — ya rechaza 0 y retorna NaN | ✅ |
| 10 | `controllers/favorite.controller.js` | Endpoint `/favorites/:pubId/toggle` — verificado, sí existe | ✅ Falso positivo |
| 11 | `services/barrio.service.js` | Solo usa PostGIS (`ST_DistanceSphere` + `ST_DWithin`), sin Haversine manual | ✅ |
| 12 | `routes/barrio.routes.js` | Rutas estáticas (`/search`, `/nearby`, `/locality/`) antes de `/:id` — correcto | ✅ |
| 13 | `controllers/barrio.controller.js` | Param `locality` en inglés, correcto | ✅ |
| 14 | `app.js` | `healthRouter` montado en `/api/health` con rutas `/health`, `/health/live`, `/health/ready` | ✅ |
| 15 | `db/migrations/005_verification.sql` | Añadido índice `idx_users_verified_by` antes del FK, movido `idx_users_neighborhood_id` antes de su FK | ✅ |

## Frontend

| # | Archivo | Problema | Estado |
|---|---------|----------|--------|
| 16 | `pages/PublicationDetailPage.js` | Navegaba a `/publicacion/:id` | ✅ Cambiado a `/listing/:id` |
| 17 | `pages/CreateListingPage.js` | Navegaba a `/explorar` | ✅ Cambiado a `/explore` |
| 18 | `pages/HomePage.js` | Usaba `/explorar` y `/publicacion/` | ✅ Cambiado a `/explore` y `/listing/` |
| 19 | `pages/dashboard/DashboardPage.js` | Usaba `/editar-publicacion/` y `/dashboard/favoritos` | ✅ Cambiado a `/edit/` y `/dashboard/favorites` |
| 20 | `pages/admin/AdminDashboard.js` | Navegaba a `/crear-publicacion` | ✅ Cambiado a `/create` |
| 21 | `components/listing/ListingCard.js` | Navegaba a `/publicacion/` | ✅ Cambiado a `/listing/` |
| 22 | `pages/PublicationDetailPage.js` | Navegaba a `/editar-publicacion/` | ✅ Cambiado a `/edit/` |
| 23 | `components/ui/Avatar.js` | Placeholder sin props | Pendiente |
| 24 | `components/ui/Badge.js` | Placeholder sin props | Pendiente |
| 25 | `components/ui/EmptyState.js` | Placeholder sin props | Pendiente |
| 26 | `components/ui/Input.js` | Placeholder sin props | Pendiente |
| 27 | `components/ui/Loader.js` | Placeholder sin props | Pendiente |
| 28 | `components/ui/Modal.js` | Placeholder sin props | Pendiente |
| 29 | `components/ui/SearchBar.js` | Placeholder sin props | Pendiente |
| 30 | `components/ui/Tabs.js` | Placeholder sin props | Pendiente |
| 31 | `components/common/Button.js` | Placeholder sin props | Pendiente |
| 32 | `components/common/Card.js` | Placeholder sin props | Pendiente |
| 33 | `components/ui/Toast.js` | Placeholder sin props | Pendiente |
| 34 | `pages/ChatPage.js` | Depende de socket.io pero backend no tiene WebSocket | Pendiente |
| 35 | `pages/VerificacionPendientePage.js` | El archivo real es `VerificationPendingPage.js` | ✅ Ya existe |

## Rutas Incorrectas (Frontend — todas corregidas ✅)

| Ruta usada (antes) | Ahora usa | Archivos |
|--------------------|-----------|----------|
| `/publicacion/:id` | `/listing/:id` | HomePage, ListingCard, PublicationDetailPage |
| `/explorar` | `/explore` | HomePage, CreateListingPage |
| `/editar-publicacion/:id` | `/edit/:id` | DashboardPage, PublicationDetailPage |
| `/crear-publicacion` | `/create` | AdminDashboard, DashboardPage template |
| `/perfil` | `/profile` | DashboardPage template |
| `/verificacion-pendiente` | `/verification-pending` | RegisterPage |

## Español → Inglés (Backend — corregido ✅)

| Archivo | Cambios |
|---------|---------|
| `error.middleware.js` | Todos los mensajes de error traducidos al inglés |
| `rateLimit.middleware.js` | Mensajes de rate limit traducidos |
| `favorite.controller.js` | "Agregado/Eliminado de favoritos" → "Added/Removed from favorites" |
| `favorite.service.js` | "Publicación no encontrada" → "Publication not found" |
| `upload.middleware.js` | Mensajes de error y validación traducidos |
| `validate.middleware.js` | Mensajes de validación traducidos |
| `category.service.js` | "Categoría no encontrada/eliminada" → "Category not found/deleted" |

## Español → Inglés (Frontend — corregido ✅)

| Archivo | Cambios |
|---------|---------|
| `index.html` | `lang="es"` → `lang="en"`, meta description traducida |
| `RadioSelector.js` | "Usar mi ubicación" → "Use my location" |
| `AdminCategories.js` | "Acciones" → "Actions" |
| `PerfilPublicoVendedorPage.js` | "A X km de ti" → "X km away" |
| `icons.js` | Keywords de categorías: español → inglés |
| `HomePage.js` | Keywords de categorías + locale: español → inglés |
| `helpers.js` | Locale `es-CO` → `en-US` |
| Varios pages | Locale `es-CO`/`es-ES` → `en-US` |
| `auth.js` | Ruta protegida `verificador-dashboard` → `verifier-dashboard` |

## Funcionalidades Faltantes

| # | Funcionalidad | Estado |
|---|--------------|--------|
| 36 | WebSocket server para chat en tiempo real | Implementado (socket.io en mismo HTTP server, `/socket.io/`) |
| 37 | Endpoint `/api/users/:id/profile` para perfil público | Implementado en `user.routes.js` |
| 38 | Reviews/ratings | Implementado: tabla `reviews`, endpoints CRUD, `avg_rating` en publicaciones |
| 39 | Geolocalización en publicaciones | Implementado: PostGIS, `ST_DWithin`, endpoint `/nearby` |
| 40 | Notificaciones push (Service Worker) | Implementado: endpoint `/api/push/subscribe`, tabla `push_subscriptions` |
| 41 | PWA (offline-first, Add to Home Screen) | Parcial: meta tag `mobile-web-app-capable`, falta service worker completo |
| 42 | Admin Dashboard con Chart.js | Rechazado explícitamente por el usuario — charts eliminados |
