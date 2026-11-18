# Auditoría técnica — MUISKA

**Fecha:** 2026-11-18
**Rama auditada:** `refactor/reorganizacion-estructura` (commit `3dc9dad`, 21 commits por delante de `main`, 3 por detrás)
**Árbol de trabajo:** limpio (`git status` sin cambios)
**Alcance:** `backend/src` (rutas, controladores, servicios, middlewares, migraciones/seeds), `frontend/src` (router, páginas, servicios, templates), `docker-compose.yml`, tests y metadatos del repo.
**Método:** lectura estática de código y documentación; `git log`/`git show`; única ejecución: `npm test` en backend (1 test, <1 s). No se levantaron contenedores ni se modificó código.

---

## 1. Resumen ejecutivo

- El proyecto tiene una arquitectura por capas coherente (routes → controllers → services → PostgreSQL) y una SPA vanilla con router propio. El andamiaje de casi todas las fases documentadas existe.
- **La documentación de referencia `RUTA_DESARROLLO_MUISKA.md` no está en el HEAD**: fue borrada en `e573cfc` ("borrando archivos innecesarios"). Su contenido se recuperó de `e573cfc^` y se usó como línea base de alcance.
- Hay **fallos funcionales graves**: borrar una publicación siempre responde 404 (parámetros invertidos), editar sin subir imágenes **borra las imágenes existentes**, el filtro por barrio en Explore lanza 500 (`unaccent` no instalado) y las publicaciones creadas desde la UI quedan **sin categoría** (se envía `slug`, el backend busca por `name`).
- Hay **vulnerabilidades de seguridad**: IDOR en chat (cualquier usuario autenticado puede enviar/marcar leído en conversaciones ajenas) y XSS almacenado en el panel del verificador (nombre/bio del vendedor se insertan sin escapar).
- La calidad es baja: **1 test unitario**, sin lint, sin CI (`.github` no existe), sin Swagger pese a declararlo el README, y con `apiLimiter` y `registerLimiter` definidos pero nunca usados.
- El README se declara "status-completed" pero contiene endpoints, puertos y funcionalidades que no coinciden con el código.

---

## 2. Requisitos comprometidos (fuente y estado)

Fuentes: `README.md` (316 líneas) y `RUTA_DESARROLLO_MUISKA.md` recuperado de `git show e573cfc^:RUTA_DESARROLLO_MUISKA.md`.
Alcance comprometido: roles cliente/vendedor/verificador/admin, verificación previa de vendedores, moderación obligatoria de publicaciones, búsqueda hiperlocal por barrio/radio con mapa, perfil público con WhatsApp, chat in-app, notificaciones push, panel admin con Chart.js, PWA offline, tests E2E y Swagger.

| Requisito | Evidencia de estado | Prioridad |
|---|---|---|
| Roles y guards (cliente/vendedor/verificador/admin) | `frontend/src/router/router.js:66`, `backend/src/middlewares/auth.middleware.js:37`; login no devuelve `user_type` (`backend/src/services/auth.service.js:87`) | P2 |
| Verificación de vendedor antes de publicar | `backend/src/middlewares/verification.middleware.js:20` ✔ | — |
| Reintento tras rechazo de verificación | Sin endpoint POST en `backend/src/routes/verification.routes.js`; `createVerificationRequest` sin uso (`verification.service.js:133`) | P1 |
| Moderación previa a publicación | `003_publications.sql:17` default `pending` ✔; editar una aprobada **no** vuelve a pendiente (`publication.service.js:196-213`) | P1 |
| Búsqueda por barrio y radio 1/3/5/10 km | Backend parcial (`publication.service.js:83-96`), pero el validador elimina `lat/lng/radius` (`validators/schemas.js:37-48`) y no hay UI de radio | P1 |
| Mapa de resultados | No hay librería ni componente de mapa en `frontend/src` | P2 |
| Perfil público con WhatsApp | Backend `user.service.js:4-16`; página existe pero sin enlace desde listados (`router.js:41`) | P2 |
| Barrio en perfil de usuario | UI de perfil solo edita nombre/email (`frontend/src/templates/pages/ProfilePage.html:13-30`) | P1 |
| Chat in-app | Backend y UI existen; IDOR y XSS (ver §5) | P0 |
| Notificaciones push (Web Push) | Suscripción existe; **nunca se dispara** push desde moderación/verificación y las claves VAPID se regeneran en cada arranque (`push.service.js:4`) | P1 |
| Panel admin con Chart.js | `chart.js` en `frontend/package.json:12` pero **no se importa** en ninguna página | P2 |
| PWA offline | `frontend/public/sw.js` existe; cachea respuestas autenticadas de `/api` (§6) | P2 |
| Tests E2E (Playwright) | Sin Playwright ni carpeta e2e | P2 |
| Documentación Swagger/OpenAPI | Dependencias instaladas, pero **no hay setup** en `app.js`; `/api/docs` no existe | P2 |

---

## 3. Estado por módulo

| Módulo | Backend | Frontend | Estado | Observaciones |
|---|---|---|---|---|
| Autenticación / perfil | ✔ JWT, bcrypt, cambio de clave, baja | ◐ login/registro/perfil básico | ◐ | Login con 401 redirige y rompe el mensaje de error (`api.js:23`); perfil no edita teléfono/bio/barrio |
| Verificación | ✔ aprobar/rechazar con transacción | ✔ panel verificador | ◐ | Errores no mapeados → 500; sin reintento |
| Publicaciones CRUD | ◐ crear/listar/editar/borrar | ✔ crear/editar/detalle | ◐ | Borrar roto; edición borra imágenes; categoría nula |
| Categorías | ✔ CRUD (admin) | ◐ panel admin | ◐ | Crear desde UI falla por `slug` obligatorio |
| Favoritos | ✔ toggle/listar/check | ✔ dashboard y tarjetas | ✔ | — |
| Moderación | ✔ aprobar/rechazar | ✔ panel verificador | ◐ | 500 en errores; no re-moderar ediciones |
| Admin | ✔ usuarios, pubs, categorías, verificadores, stats | ✔ 5 pestañas | ◐ | Dashboard sin gráficas; crear categoría roto |
| Barrios / geo | ◐ tablas, seeds, endpoints | ◐ autocompletar barrio | ◐ | `unaccent` ausente; búsqueda geo inalcanzable por validación |
| Chat | ✔ REST + Socket.io | ✔ página de chat | ◐ | IDOR y XSS |
| Notificaciones | ✔ CRUD + contador | ✔ campana y toasts | ✔ | Push no conectado al flujo real |
| Reviews | ✔ crear/listar/promedio | ✘ solo promedio en perfil público | ◐ | Sin UI para puntuar |
| PWA / push | ◐ suscripciones | ◐ SW + permiso | ◐ | Claves VAPID efímeras |

---

## 4. Requisitos faltantes o incompletos (con evidencia)

| # | Hallazgo | Evidencia | Prioridad |
|---|---|---|---|
| 1 | Borrado de publicación inoperante: el controlador invoca `remove(userId, id)` pero el servicio espera `(id, userId)` | `backend/src/controllers/publication.controller.js:89` vs `backend/src/services/publication.service.js:225` | P0 |
| 2 | Editar una publicación sin adjuntar imágenes vacía `images` (`COALESCE` recibe `[]`, no `NULL`) | `publication.controller.js:63-67`, `utils/publication.utils.js:14-16`, `publication.service.js:202` | P0 |
| 3 | Filtro por barrio usa `unaccent()` y ninguna migración crea la extensión | `publication.service.js:68`; solo `pgcrypto` (`001_users.sql:4`) y `postgis` (`010_postgis.sql:4`) | P0 |
| 4 | Categoría perdida al publicar: UI envía `slug`, backend busca por `name` | `CreateListingPage.js:17`; `publication.service.js:165` | P1 |
| 5 | Crear categoría desde admin falla: el schema exige `slug` y la UI no lo envía (el servicio ya lo genera) | `validators/schemas.js:50-53`; `pages/admin/AdminCategories.js:166-169`; `category.service.js:28-30` | P1 |
| 6 | Búsqueda geo no expuesta: `lat`, `lng`, `radius` se descartan en `publicationQuerySchema` | `validators/schemas.js:37-48`; `publication.service.js:18` | P1 |
| 7 | Sin selector de radio ni mapa; `RadioSelector` y gran parte de `useGeolocation` son código muerto | `frontend/src/components/RadioSelector.js` (sin importadores); `hooks/useGeolocation.js:1` | P1 |
| 8 | Perfil no permite barrio/coords/teléfono/bio; por tanto el geo-filtro no tendría datos | `templates/pages/ProfilePage.html:13-30`; `pages/ProfilePage.js:38-42` | P1 |
| 9 | Rechazo de verificación sin posibilidad de reenviar | `routes/verification.routes.js:23-58`; `VerificationPendingPage.js:37-42` | P1 |
| 10 | Reviews sin UI: no hay formulario ni listado en detalle | `services/api.js:338-352` sin consumidores en páginas | P2 |
| 11 | Swagger declarado pero inexistente | `README.md:75,223,291`; `app.js` sin import de `swagger-*` | P2 |
| 12 | Admin Dashboard sin Chart.js pese a la dependencia y la promesa | `frontend/package.json:12`; `pages/admin/AdminDashboard.js` | P2 |
| 13 | Documentación desfasada (endpoints, puertos, rutas) | `README.md:114,137-138,144,149,170-172,272` | P2 |

---

## 5. Errores y riesgos funcionales

1. **Borrado roto (P0).** `DELETE /api/publications/:id` devuelve 404 incluso para el dueño. Evidencia: `publication.controller.js:89`, `publication.service.js:225-235`.
2. **Pérdida de imágenes al editar (P0).** Cualquier `PUT` sin archivos nuevos deja `images = '{}'`. Evidencia: `publication.utils.js:14-16`, `publication.service.js:202`.
3. **Explore con barrio devuelve 500 (P0).** `unaccent` no existe en la BD; el autocompletar escribe `location` y el submit lo envía (`ExplorePage.js:124`). Evidencia: `publication.service.js:68`.
4. **Publicaciones sin categoría (P1).** El desplegable usa `cat.slug` y el backend resuelve por nombre; `category_id` queda `NULL`. Evidencia: `CreateListingPage.js:17`, `publication.service.js:163-169`.
5. **Errores de negocio convertidos en 500 (P1).** Moderación y verificación lanzan `new Error(...)` sin `error.code`; los controladores solo mapean `MISSING_REASON`. Evidencia: `moderation.service.js:91,144`; `verification.service.js:43,98`; `moderation.controller.js:25-44`.
6. **Editar una publicación aprobada evita moderación (P1).** El `UPDATE` no toca `moderation_status`; el contenido editado sigue público. Evidencia: `publication.service.js:196-213`.
7. **Detalle sin filtro de moderación (P1).** `GET /publications/:id` devuelve pendientes/rechazadas por UUID directo. Evidencia: `publication.service.js:126-140`.
8. **Actualizar categoría solo con descripción rompe (P2).** El schema permite `description` sola y el servicio hace `name.toLowerCase()`. Evidencia: `schemas.js:56-60`, `category.service.js:53-57`.
9. **Actualizar perfil borra campos no enviados (P1).** El servicio asigna `phone/whatsapp/bio/neighborhood_id/lat/lng` con `undefined` (→ `NULL`). Evidencia: `auth.service.js:109-128`; `ProfilePage.js:38-42`.
10. **Desajuste camelCase/snake_case en perfil (P1).** El cliente convierte a `neighborhood_id` (`api.js:115`), pero el schema espera `neighborhoodId` (`schemas.js:80`) y Zod lo descarta.
11. **Login inválido no muestra el error (P2).** `api.request` intercepta 401, limpia sesión y redirige; el llamador recibe `undefined` y lanza `TypeError`. Evidencia: `api.js:23-28`, `LoginPage.js:69-75`.
12. **Login no devuelve `user_type`/`verification_status` (P2).** El guard de vendedor no se activa hasta refrescar con `/auth/me`. Evidencia: `auth.service.js:87-89`, `router.js:72-79`.
13. **Archivos huérfanos (P2).** Multer escribe antes de `validateBody`; si la validación falla, los archivos quedan en disco. Evidencia: `publication.routes.js:26-34`.
14. **Ruta `/api/health` duplicada (P2).** `status.routes` se registra antes y sombrea el handler detallado de `health.routes`. Evidencia: `app.js:38,48`, `status.routes.js:10`, `health.routes.js:7`.
15. **Código muerto (P2).** `processConditionals` referencia `data` inexistente (`templateLoader.js:11-30`); `createVerificationRequest`, `getAllNeighborhoods`, `getNeighborhood`, `RadioSelector` sin uso.
16. **Borrado de cuenta sin confirmación de contraseña (P2).** `DELETE /auth/me` elimina con solo portar el JWT. Evidencia: `auth.service.js:153`.

---

## 6. Seguridad

| Riesgo | Evidencia | Severidad |
|---|---|---|
| **IDOR en chat**: enviar y marcar leído no valida pertenencia a la conversación (REST y socket) | `chat.service.js:83-96,112-118`; `chat.controller.js:64-89`; `config/socket.js:35-49` | Crítica |
| **XSS almacenado** en panel verificador: `name`, `email`, `bio`, `neighborhood_name`, `rejection_reason` sin escapar | `VerificadorDashboardPage.js:94-99` | Crítica |
| **XSS almacenado** en lista/encabezado de chat: `last_message` y nombre sin escapar | `ChatPage.js:57-64,109-115` | Alta |
| JWT en `localStorage` (amplifica cualquier XSS) | `session.store.js:13-18`; `api.js:5` | Alta |
| Secreto JWT por defecto si falta env; secreto fijo en compose | `config/index.js:35`; `docker-compose.yml:44` | Alta |
| Rate limit incompleto: `apiLimiter` y `registerLimiter` definidos sin uso; registro ilimitado | `rateLimit.middleware.js:24,30`; `auth.routes.js:10` | Alta |
| `trust proxy` ausente tras nginx: límites agrupados por IP del proxy (o error de validación de express-rate-limit v8) | `app.js:29-34`; `nginx.conf:21-22` | Alta |
| Push VAPID regenerado en cada arranque (suscripciones invalidadas) | `push.service.js:4-9` | Media |
| Service Worker cachea GET autenticados de `/api` (datos de otro usuario en el mismo navegador) | `public/sw.js:27-33,55-61` | Media |
| Perfil público expone lat/lng exactas y WhatsApp a anónimos | `user.service.js:6-9`; `routes/user.routes.js:6` | Media |
| Sin `helmet` ni cabeceras de seguridad | `app.js:31-36`; `package.json` sin helmet | Media |
| Uploads: valida extensión/MIME declarado, no contenido real; estáticos servidos desde el backend | `upload.middleware.js:33-46`; `app.js:36` | Baja |
| `.env` real no versionado (correcto); `.env.example` con secreto débil y credenciales demo | `.gitignore:12`; `.env.example:7`; `seeds/001_users.sql:11,32` | Baja (dev) |

**Positivo:** consultas SQL parametrizadas en todos los servicios revisados (sin concatenación de input), bcrypt con coste 10, `verifyToken` revalida usuario y bloquea baneados (`auth.middleware.js:22-25`), CORS restringido a un origen, y límites de subida (5 MB, 5 archivos).

---

## 7. Calidad, pruebas y CI

- **Tests:** solo `backend/tests/publication.utils.test.js` (1 caso, normalización de payload). `npm test` pasa (1/1). No hay tests de controladores, auth, moderación, chat, permisos ni base de datos; **cobertura no medida** (no hay script de coverage).
- **Frontend:** sin tests ni script `test` (`frontend/package.json`).
- **CI:** no existe `.github/`; ningún workflow.
- **Lint/format:** sin ESLint/Prettier ni scripts en ninguno de los dos `package.json`.
- **Scripts:** backend `dev/start/test/migrate/seed` correctos; frontend `dev/build/preview` correctos. `swagger-jsdoc`, `swagger-ui-express` y `chart.js` son dependencias sin uso.
- **Migraciones:** runner propio con tracking y transacción; backups "de esquema" incompletos (sin constraints/índices) y escritos en `./backups`, no ignorado por git (`migrate.js:14-48`, `.gitignore`).
- **Repositorio:** 4 imágenes subidas están versionadas pese a `uploads/` en `.gitignore` (`.gitignore:29`); imágenes duplicadas en `frontend/public` y `frontend/src/assets/images`.
- **Rama:** `refactor/reorganizacion-estructura` está 21 commits delante y 3 detrás de `main`; el último commit (`3dc9dad`) mueve un índice en `005_verification.sql`, una migración ya aplicada (mala práctica: alterar migraciones históricas).

---

## 8. Plan priorizado

### P0 — Bloqueantes (corregir antes de demo/entrega)

| Acción | Criterio de aceptación |
|---|---|
| Corregir orden de parámetros en borrado | `DELETE /api/publications/:id` como dueño → 200 y fila eliminada; otro usuario → 404; test de integración |
| Preservar imágenes al editar | `PUT` sin `images` mantiene el array actual; con archivos lo reemplaza; test que compara `images` antes/después |
| Crear extensión `unaccent` | Migración `014_unaccent.sql` con `CREATE EXTENSION IF NOT EXISTS unaccent`; `GET /api/publications?location=Prado` → 200 |
| Cerrar IDOR de chat | `sendMessage`/`markRead` (REST y socket) verifican `buyer_id`/`seller_id`; usuario ajeno → 403/404; test |
| Sanear XSS en verificador y chat | `escapeHtml` en todos los campos de usuario; prueba con `bio=<img src=x onerror=alert(1)>` no ejecuta script |

### P1 — Alto (siguiente iteración)

| Acción | Criterio de aceptación |
|---|---|
| Resolver categorías por `slug` o `name` y unificar el valor del `<select>` | Publicación creada desde UI aparece al filtrar por su categoría |
| Permitir crear categoría sin `slug` (lo genera el servicio) o enviarlo desde la UI | `POST /api/categories` desde el panel → 201 y aparece en la tabla |
| Exponer `lat/lng/radius` en el validador y añadir selector de radio + barrio en perfil y Explore | `GET /publications?lat=..&lng=..&radius=3` filtra y ordena por distancia; UI envía los tres valores |
| Mapear errores de moderación/verificación a 404/409 | Procesar dos veces la misma solicitud → 409, no 500 |
| Activar rate limit real y `trust proxy` | `app.set("trust proxy", 1)`; `apiLimiter` en `/api`; registro limitado; pruebas con X-Forwarded-For |
| Endurecer secretos y push | `JWT_SECRET` obligatorio en producción (sin fallback); claves VAPID persistidas por env; push emitido desde moderación/verificación vía `notificationService` |
| Re-moderar ediciones | Editar publicación aprobada la devuelve a `pending` (o bloquea edición de campos sensibles) |
| Corregir actualización de perfil | Campos omitidos conservan su valor; contrato camelCase único entre frontend y Zod; UI con teléfono/bio/barrio |
| Filtrar detalle público por moderación | `GET /publications/:id` de pendiente/rechazada → 404 para no-admin/no-dueño |

### P2 — Medio (deuda y consistencia)

| Acción | Criterio de aceptación |
|---|---|
| UI de reviews | Formulario 1–5 y listado en detalle; `POST`/`GET` usados desde la SPA |
| Sincronizar documentación | README con endpoints/puertos reales (`/auth/me`, `/favorites/:id/toggle`, `/neighborhoods`, `5434`); restaurar `RUTA_DESARROLLO_MUISKA.md`; implementar Swagger o retirar dependencias |
| CI + lint + tests | Workflow con `npm ci`, `npm test` y lint en backend/frontend; al menos tests de auth, publicaciones, moderación y chat |
| Higiene de repo | `backend/uploads` fuera de git, `backups/` ignorado, imágenes sin duplicar, ruta `/health` única |
| Resistencia y privacidad | `helmet`; lat/lng redondeadas o solo barrio en perfil público; SW sin cachear `/api/auth` ni `/api/notifications` |
| Limpieza | Eliminar `processConditionals`, `RadioSelector` o integrarlo, métodos API sin uso; enlace al perfil público desde el listado |

---

## 9. Estado posterior (2026-11-18)

Correcciones aplicadas después de la revisión; lo anterior describe el estado en `3dc9dad`.

| Hallazgo | Cambio | Verificación |
|---|---|---|
| P0 borrado invertido | `remove(id, userId)` invocado en el orden correcto | E2E “borrar la publicación propia” / “ya no existe” |
| P0 imágenes al editar | `normalizePublicationPayload` devuelve `undefined` cuando no llegan imágenes y el `UPDATE` conserva el array | `tests/publication.schema.test.js` y E2E “la edición conserva las imágenes” |
| P0 `unaccent` | Migración `014_unaccent.sql` | E2E “filtro por barrio” responde 200 |
| P0 IDOR de chat / XSS | Validación de participantes en REST y socket; `escapeHtml` en chat y verificador | Commit `aea8f83` |
| P1 categoría perdida | `publication.service` resuelve la categoría por `name` **o** `slug` | E2E “la categoría se resuelve por slug” |
| P1 crear categoría desde admin | `slug` opcional en el schema; el servicio lo genera y desaccentúa | E2E “crear categoría sin slug” |
| P1 categoría solo con descripción | `UPDATE` parcial con `COALESCE` | E2E “actualizar categoría solo con descripción” |
| P1 geo inalcanzable | `lat`, `lng` y `radius` en `publicationQuerySchema`; `ST_Distance` sobre geography en lugar de `ST_DistanceSphere` (la firma con geography no existe) | E2E “filtro por radio responde 200” |
| P1 perfil borraba campos | `UPDATE` dinámico solo con los campos enviados; se aceptan `neighborhoodId` y `neighborhood_id` | E2E “actualizar nombre no borra el teléfono” |
| P1 editar evitaba moderación | Editar una publicación aprobada la devuelve a `pending` y limpia la moderación anterior | E2E “editar una aprobada la devuelve a moderación” |
| P1 detalle sin filtro | `getById` devuelve 404 si está pendiente/rechazada y el solicitante no es dueño ni admin (`optionalAuth` en la ruta) | E2E “el detalle pendiente no es público” / “el dueño ve su publicación” |
| P1 errores de negocio → 500 | `CONFLICT` en moderación/verificación mapeado a 409 | E2E “aprobar dos veces devuelve 409” |
| P1 rate limit sin usar | `trust proxy` + `apiLimiter` sobre `/api` y `registerLimiter` en registro | Respuestas incluyen cabeceras `RateLimit-*` (comprobado con `curl -i`) |
| P1 login sin `user_type` | Login devuelve `user_type`, `verification_status` e `is_verified_badge` | E2E “login devuelve user_type” |
| P1 VAPID efímero | Claves leídas de `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`, con aviso si faltan | `VARIABLES_ENTORNO.md` |
| Tests | 7 pruebas unitarias + script `test:e2e` | `npm test` y `npm run test:e2e` |

**Sigue pendiente:** UI de perfil con teléfono/bio/barrio/coordenadas y selector de radio en Explore (el backend ya los acepta), mapa de resultados, UI de reviews, Chart.js en el dashboard admin, `helmet`, fingerprints de uploads, CI (no hay `.github/`), y push disparado desde moderación/verificación.

## 10. Conclusión

MUISKA cubre estructuralmente el producto prometido, pero **no está en estado "completed"**: cinco fallos P0 (borrado, imágenes, filtro de barrio, IDOR de chat y XSS) impiden una entrega segura y funcional. La corrección de estos, junto con la activación real del rate limiting y la sincronización de la documentación, es condición mínima para considerar la rama lista para integración.

*Auditoría basada en lectura estática; no se ejecutaron contenedores, migraciones ni builds de producción.*
