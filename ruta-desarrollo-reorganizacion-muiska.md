# PROMPT — Ruta de desarrollo: reorganizar MUISKA con arquitectura tipo Elysia

Pega este prompt completo en tu asistente de código (Claude Code u otro) para
ejecutar la migración de estructura, o síguelo como checklist manual.

---

## Contexto para el asistente

Estás trabajando sobre el repositorio `muiska_services`
(https://github.com/Jhaymayleth/muiska_services, rama `main`), un monorepo con:

- `backend/`: Node.js + Express + `pg` (sin ORM), PostgreSQL.
- `frontend/`: Vite + JavaScript vanilla + Tailwind CSS, SPA con router basado
  en `history.pushState`.
- `docker-compose.yml` orquestando backend, frontend y PostgreSQL.

El proyecto **ya tiene funcionalidad real implementada**: autenticación,
CRUD de publicaciones, categorías, roles, subida de imágenes. **No se debe
perder ni romper nada de eso.** El objetivo de esta tarea es exclusivamente
**reorganizar la estructura de carpetas y separar responsabilidades**,
inspirándonos en las convenciones de otro proyecto (Elysia) que tiene una
arquitectura de carpetas más madura, pero sin copiar su estructura al pie
de la letra ni introducir capas que no aporten valor real a este proyecto.

**Regla no negociable:** cada cambio debe ser explicable. El desarrollador
tiene que poder defender en una sustentación individual por qué cada archivo
está donde está y qué hace. Si un cambio no se puede explicar en una frase,
no se hace.

---

## Estructura objetivo

```
backend/
├── database/
│   ├── schema.sql                  # DDL consolidado (referencia, no se ejecuta)
│   ├── migrations/                 # dividir el init.sql actual en pasos numerados
│   │   ├── 001_users.sql
│   │   ├── 002_categories.sql
│   │   ├── 003_publications.sql
│   │   └── 004_publications_category_fk.sql   # corrige category VARCHAR -> FK real
│   └── seeds/
│       └── dev_users_seed.sql      # sacar los INSERT de admin/usuario de prueba del init.sql
├── src/
│   ├── config/                     # existente: database.js
│   ├── controllers/                # existente, se adelgaza: solo orquesta req/res
│   ├── services/                   # NUEVO: mover aquí las queries SQL y la lógica
│   │   │                             de negocio que hoy vive dentro de los controllers
│   │   ├── publication.service.js
│   │   ├── auth.service.js
│   │   └── category.service.js
│   ├── validators/                 # NUEVO: extraer validaciones (ej. isValidPublicationPrice,
│   │   │                             formato de email) que hoy están sueltas en los controllers
│   │   ├── publication.validator.js
│   │   └── auth.validator.js
│   ├── middlewares/                # existente + agregar:
│   │   └── role.middleware.js      # requireRole(roles) — pendiente 🔴 según tu propio
│   │                                 roadmap (ruta-desarrollo.txt, tarea 6)
│   ├── routes/                     # existente
│   ├── utils/                      # existente
│   ├── app.js / server.js          # existente
├── tests/
│   ├── publication.utils.test.js   # existente
│   ├── publication.service.test.js # NUEVO
│   └── auth.service.test.js        # NUEVO

frontend/
├── src/
│   ├── assets/                     # NUEVO: mover frontend/public/*.jpg,png aquí
│   │   └── images/
│   ├── components/                 # existente (common/, layout/, listing/, ui/) — se mantiene
│   ├── pages/
│   │   ├── admin/
│   │   │   └── AdminPage.js        # mover aquí (coincide con lo que ya planeaba
│   │   │                             tu propio ruta-desarrollo.txt y con Elysia)
│   │   ├── dashboard/DashboardPage.js
│   │   ├── HomePage.js, LoginPage.js, RegisterPage.js, ExplorePage.js, etc.
│   ├── router/router.js            # existente
│   ├── services/
│   │   ├── api.js                  # existente (cliente base)
│   │   ├── auth.service.js         # NUEVO: separar llamadas de auth de api.js
│   │   └── publication.service.js  # NUEVO: separar llamadas de publicaciones
│   ├── state/                      # NUEVO: envolver localStorage/sessionStorage
│   │   │                             (hoy disperso en utils/auth.js) en un módulo de estado
│   │   └── session.store.js
│   ├── styles/
│   │   └── scss/
│   │       ├── foundations/
│   │       │   ├── _variables.scss   # portar los colores de tailwind.config.js
│   │       │   └── _reset.scss
│   │       ├── components/
│   │       │   ├── _card.scss        # extraer combinaciones repetidas de Tailwind
│   │       │   └── _badge.scss
│   │       └── main.scss
│   └── utils/                      # existente (auth.js)
└── login.html                      # ELIMINAR — borrador huérfano con Bootstrap que no
                                       se conecta al SPA real, genera confusión en sustentación
```

**Nota:** no se incluye un `python-ai/` de relleno. Si se agrega un componente
Python, debe resolver algo real y acotado (ver Fase 5, opcional).

---

## Fases de ejecución

### Fase 0 — Antes de tocar nada
- [ ] Crear rama `refactor/reorganizacion-estructura` desde `main`.
- [ ] Correr el proyecto local con Docker y confirmar que login, CRUD de
      publicaciones y categorías funcionan HOY, antes de mover un solo archivo.
- [ ] Anotar en el commit inicial qué funcionalidades están verificadas.

### Fase 1 — Base de datos
- [ ] Dividir `backend/src/db/init.sql` en `database/migrations/001..00N.sql`
      por tabla, en orden de dependencia (users → categories → publications).
- [ ] Sacar los `INSERT` de usuarios de prueba a `database/seeds/dev_users_seed.sql`.
- [ ] Corregir `publications.category VARCHAR` → `category_id UUID REFERENCES categories(id)`
      en una migración nueva (`004_publications_category_fk.sql`), con su script
      de migración de datos existentes.
- [ ] Actualizar `publication.controller.js`/nuevo `publication.service.js`
      para usar `category_id` con JOIN a `categories`.

### Fase 2 — Backend: separar capas
- [ ] Crear `src/services/`. Mover la lógica SQL de cada controller a su
      service correspondiente (el controller solo llama al service y arma
      la respuesta HTTP).
- [ ] Crear `src/validators/`. Mover funciones como `isValidPublicationPrice`
      fuera de los controllers.
- [ ] Crear `src/middlewares/role.middleware.js` con `requireRole(roles)` y
      aplicarlo en rutas de categorías y administración (tarea 6 de tu propio
      `ruta-desarrollo.txt`).
- [ ] Verificar con Docker que nada se rompió después de cada movimiento.

### Fase 3 — Frontend: SCSS y assets
- [ ] Instalar `sass` como devDependency.
- [ ] Crear `src/styles/scss/foundations/_variables.scss` portando los colores
      de `tailwind.config.js`.
- [ ] Extraer a `.scss` las combinaciones de clases Tailwind que se repiten
      en `HomePage.js`, `ExplorePage.js`, etc. (ej. badges de estado, cards
      de publicación) como clases semánticas propias.
- [ ] Mover imágenes de `frontend/public/` a `frontend/src/assets/images/`
      y actualizar referencias.
- [ ] Eliminar `frontend/login.html` (borrador huérfano, no forma parte del SPA).

### Fase 4 — Frontend: páginas y estado
- [ ] Completar el pendiente 🔴 crítico: mover `AdminPage.js` a `pages/admin/`
      y construirlo (gestión de usuarios, publicaciones, categorías) — esto
      ya estaba en tu roadmap original.
- [ ] Crear `src/state/session.store.js` para centralizar lectura/escritura
      de `localStorage` (hoy disperso en `utils/auth.js`).
- [ ] Separar `services/api.js` en `auth.service.js` y `publication.service.js`
      si el archivo actual ya mezcla demasiadas responsabilidades.

### Fase 5 — Opcional: componente Python real (no placeholder)
Solo si hay tiempo sobrante después de las fases 1-4:
- [ ] Definir UNA funcionalidad concreta que Python resuelva mejor que JS
      (ej. sugerencia de rango de precio por categoría a partir de datos
      históricos, o detección de publicaciones duplicadas por título/descr).
- [ ] Implementarla como servicio FastAPI aparte, con su propio contenedor
      en `docker-compose.yml`, conectado a la misma base Postgres.
- [ ] Documentar en el README por qué existe y cómo se conecta.

---

## Reglas durante todo el proceso

1. Un commit por paso lógico, con mensajes claros (GitFlow: ramas `refactor/*`,
   PR hacia `main` al cerrar cada fase).
2. Después de cada fase, correr `docker compose up` y probar manualmente el
   flujo afectado antes de seguir.
3. No agregar ninguna carpeta o archivo que no vaya a tener contenido real
   antes de la entrega — evitar repetir el problema de carpetas vacías.
4. Si el asistente de IA genera código en esta migración, el estudiante debe
   poder explicar cada archivo movido/creado sin mirar el prompt.
