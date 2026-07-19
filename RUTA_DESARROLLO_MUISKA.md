# RUTA DE DESARROLLO - MUISKA
## Plataforma de Comercio Comunitario Hyperlocal para Barranquilla

---

## 🎯 VISIÓN DEL PRODUCTO

**MUISKA** conecta vendedores locales (electricistas, plomeros, vendedores de comida, artesanos, etc.) de barrios de Barranquilla con personas que buscan sus servicios/productos **por cercanía geográfica**.

> **Ejemplo core**: *Soy electricista en barrio El Prado. Una persona a 3 calles necesita reparación eléctrica. Ella me encuentra por barrio/radio, ve mi perfil verificado, me contacta por WhatsApp, concertamos y cierro la venta.*

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

## 🏗️ ARQUITECTURA TÉCNICA REQUERIDA

### Base de Datos - Nuevas Tablas/Campos

```sql
-- 1. USUARIOS - Nuevos campos
ALTER TABLE users ADD COLUMN IF NOT EXISTS 
  tipo_usuario VARCHAR(20) DEFAULT 'cliente', -- 'cliente', 'vendedor', 'verificador', 'admin'
  estado_verificacion VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado'
  verificado_por UUID REFERENCES users(id),
  verificado_en TIMESTAMP,
  motivo_rechazo_verificacion TEXT,
  barrio_id UUID REFERENCES barrios(id),
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  telefono VARCHAR(20),
  whatsapp VARCHAR(20),
  bio TEXT,
  foto_perfil_url TEXT,
  rating_promedio DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  tiempo_respuesta_promedio INTERVAL,
  badge_verificado BOOLEAN DEFAULT FALSE;

-- 2. BARRIOS OFICIALES BARRANQUILLA
CREATE TABLE barrios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  localidad VARCHAR(50) NOT NULL, -- 'Norte', 'Sur', 'Centro', 'Occidente', 'Metropolitana'
  lat DECIMAL(10,8) NOT NULL,
  lng DECIMAL(11,8) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. PUBLICACIONES - Campos moderación
ALTER TABLE publications ADD COLUMN IF NOT EXISTS
  tipo VARCHAR(20) DEFAULT 'producto', -- 'producto', 'servicio'
  estado_moderacion VARCHAR(20) DEFAULT 'pendiente', -- 'pendiente', 'aprobada', 'rechazada'
  moderado_por UUID REFERENCES users(id),
  moderado_en TIMESTAMP,
  motivo_rechazo_moderacion TEXT,
  horario_atencion JSONB, -- { "lunes": "8:00-18:00", ... }
  area_cobertura JSONB, -- barrios/radios donde presta servicio
  precio_tipo VARCHAR(20) DEFAULT 'fijo', -- 'fijo', 'por_hora', 'cotizar'

-- 3. VERIFICACIONES (Auditoría)
CREATE TABLE verificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verificador_id UUID REFERENCES users(id),
  estado VARCHAR(20) NOT NULL, -- 'aprobado', 'rechazado'
  motivo TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- 4. MODERACIONES (Auditoría)
CREATE TABLE moderaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  verificador_id UUID REFERENCES users(id),
  accion VARCHAR(20) NOT NULL, -- 'aprobada', 'rechazada'
  motivo TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- 5. NOTIFICACIONES
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'verificacion_aprobada', 'verificacion_rechazada', 'publicacion_aprobada', 'publicacion_rechazada', 'nuevo_mensaje', 'nueva_review'
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  datos JSONB, -- datos extra (publicacion_id, etc.)
  leida BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- 6. CHAT/MENSAJERÍA
CREATE TABLE conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id UUID REFERENCES publications(id) ON DELETE SET NULL,
  comprador_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vendedor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW(),
  UNIQUE(publicacion_id, comprador_id, vendedor_id)
);

CREATE TABLE mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID REFERENCES conversaciones(id) ON DELETE CASCADE,
  remitente_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  leido BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- 7. RESEÑAS/REVIEWS
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publicacion_id UUID REFERENCES publications(id) ON DELETE CASCADE,
  comprador_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vendedor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comentario TEXT,
  creado_en TIMESTAMP DEFAULT NOW(),
  UNIQUE(publicacion_id, comprador_id)
);

-- 8. BARRIOS SEED (70+ barrios Barranquilla con lat/lng/localidad)
```

---

## 🛣️ ROADMAP POR FASES

### FASE 0: BASELINE ✅ (Completado)
- [x] Docker compose (PostgreSQL, Backend, Frontend, Nginx)
- [x] Auth JWT (register, login, JWT, middleware)
- [x] CRUD Publicaciones básico
- [x] CRUD Categorías
- [x] Admin panel básico (users, publications)
- [x] Tests backend pasando

---

### FASE 1: SISTEMA DE ROLES Y VERIFICACIÓN (Semana 1-2)

#### Backend
- [ ] Migración BD: nuevos campos users, tabla verificaciones, notificaciones
- [ ] Auth Service: registro con `tipo_usuario` (cliente/vendedor)
- [ ] Verification Service: CRUD verificaciones, notificaciones
- [ ] Middleware: `requireVerifiedSeller` para crear publicaciones
- [ ] Admin Controller: asignar/quitar verificadores
- [ ] Seeds: verificación seeds

#### Frontend
- [ ] RegisterPage: selector "Cliente" / "Vendedor/Emprendedor" (NO verificador/admin)
- [ ] VerificationPendingPage: pantalla loading "Tu perfil en verificación..."
- [ ] NotificationStore + toast notifications + badge en header
- [ ] Auth guard: redirigir vendedor no verificado a /verificacion-pendiente
- [ ] Header: badge notificaciones + dropdown

---

### FASE 2: PANEL VERIFICADOR + MODERACIÓN (Semana 2-3)

#### Backend
- [ ] Verification Service: listar pendientes, aprobar/rechazar con motivo
- [ ] Moderation Service: listar publicaciones pendientes, aprobar/rechazar
- [ ] Endpoints: `/api/admin/verificaciones`, `/api/admin/moderacion`
- [ ] Auditoría completa en tablas `verificaciones` y `moderaciones`

#### Frontend
- [ ] **VerificadorDashboardPage** (solo rol=verificador):
  - Tab "Perfiles por verificar": lista, ver detalles, aprobar/rechazar con modal motivo
  - Tab "Publicaciones pendientes": lista, ver detalles, aprobar/rechazar con modal motivo
- [ ] **AdminPanel** nueva sección "Gestión Verificadores": buscar usuario, botón "Hacer verificador"
- [ ] Notificaciones push a vendedor: verificación aprobada/rechazada + publicación aprobada/rechazada

---

### FASE 3: GEOLOCALIZACIÓN HYPERLOCAL BARRANQUILLA (Semana 3-4)

#### Backend
- [ ] Tabla `barrios` + seed 70+ barrios oficiales con lat/lng/localidad
- [ ] Migración users: `barrio_id`, `lat`, `lng`
- [ ] API barrios: `GET /api/barrios?q=`, `GET /api/barrios/:id`
- [ ] API publicaciones: `GET /api/publications?lat=x&lng=y&radius_km=3`
- [ ] Índices geoespaciales (PostGIS si disponible, sino bounding box)

#### Frontend
- [ ] **BarrioAutocomplete** component (registro, crear publicación, explorar)
- [ ] **RadioSelector**: 1km, 3km, 5km, 10km + "Usar mi ubicación" (Geolocation API)
- [ ] ExplorarPage: filtros barrio + radio km + mapa resultados (Leaflet opcional)
- [ ] PublicationCard: muestra barrio + "A X km de ti"
- [ ] Perfil público: muestra barrio + "A X km de ti"

---

### FASE 4: PERFIL PÚBLICO VENDEDOR + CONTACTO (Semana 4-5)

#### Backend
- [ ] `GET /api/users/:id/public` - perfil público vendedor
- [ ] Rating/Reviews system
- [ ] WhatsApp click-to-chat: `wa.me/{numero}?text=Hola%20vi%20tu%20publicación...`

#### Frontend
- [ ] **PerfilPublicoVendedorPage**: foto, bio, badge ✅, rating, servicios/productos, barrio, "A X km"
- [ ] Botones: "Contactar por WhatsApp" + "Chat en app"
- [ ] Badges visuales: "✅ Verificado", "⚡ Responde rápido", "⭐ 4.8 (50 reviews)"
- [ ] Mapa mini en perfil (Leaflet)

---

### FASE 5: CHAT Y NOTIFICACIONES REAL-TIME (Semana 6)

- [ ] WebSocket/Socket.io server
- [ ] Chat in-app entre comprador-vendedor
- [ ] Notificaciones push (Service Worker + Web Push API)
- [ ] Estados: "En línea", "Visto", "Escribiendo..."

---

### FASE 6: ESTADÍSTICAS ADMIN + REPORTES (Semana 7)

- [ ] Admin Dashboard con Chart.js:
  - Usuarios/semana, publicaciones/estado, top categorías
  - Usuarios por barrio/localidad
  - Tiempo promedio verificación/moderación
- [ ] Exportar CSV/PDF
- [ ] Auditoría completa: logs de verificación/moderación/acciones admin

---

### FASE 7: PWA + OPTIMIZACIONES (Semana 8)

- [ ] Service Worker + offline-first
- [ ] Push notifications
- [ ] Add to Home Screen
- [ ] Performance: lazy loading, code splitting, image optimization (WebP)
- [ ] SEO: meta tags, sitemap, structured data (LocalBusiness, Product, Service)

---

### FASE 7: TESTING Y DOCUMENTACIÓN (Semana 9-10)

- [ ] E2E Playwright: registro→verificación→publicar→contactar→review
- [ ] Unit tests coverage > 70%
- [ ] Swagger/OpenAPI docs
- [ ] Guías: Vendedor, Comprador, Verificador, Admin
- [ ] Load testing básico

---

## 📋 CHECKLIST MVP ENTREGABLE

- [ ] Registro Cliente / Vendedor (NO verificador/admin)
- [ ] Verificación perfil por Verificador (flujo completo)
- [ ] Moderación publicaciones por Verificador (flujo completo)
- [ ] Admin asigna Verificadores
- [ ] Barrios Barranquilla + búsqueda por radio/barrio
- [ ] Perfil público vendedor con contacto WhatsApp
- [ ] Notificaciones en tiempo real
- [ ] Build limpio + Tests pasando
- [ ] Documentación API + Usuario

---

## 🔒 SEGURIDAD Y CONFIANZA

- [ ] Rate limiting en auth y APIs sensibles
- [ ] Validación estricta de archivos subidos (tipo, tamaño, malware scan básico)
- [ ] Sanitización XSS en todos los inputs
- [ ] CORS configurado correctamente
- [ ] Headers de seguridad (Helmet)
- [ ] Logs de auditoría inmutables para verificación/moderación
- [ ] 2FA opcional para vendedores/verificadores
- [ ] Políticas de privacidad y términos de uso claros

---

## 📊 KPIs OBJETIVO

| Métrica | MVP (3 meses) | 6 Meses |
|---------|---------------|---------|
| Usuarios registrados | 500 | 5,000 |
| Vendedores verificados | 100 | 1,000 |
| Publicaciones activas | 1,000 | 10,000 |
| Transacciones/mes | 100 | 5,000 |
| Tiempo verificación perfil | < 24h | < 12h |
| Tiempo moderación pub | < 6h | < 2h |
| Retención 30 días | 20% | 35% |

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

## 📁 ESTRUCTURA DE ARCHIVOS NUEVOS PROPUESTA

```
backend/
├── src/
│   ├── services/
│   │   ├── barrio.service.js
│   │   ├── verification.service.js
│   │   ├── moderation.service.js
│   │   ├── notification.service.js
│   │   └── chat.service.js
│   ├── controllers/
│   │   ├── verification.controller.js
│   │   ├── moderation.controller.js
│   │   ├── barrio.controller.js
│   │   └── notification.controller.js
│   ├── routes/
│   │   ├── verification.routes.js
│   │   ├── moderation.routes.js
│   │   ├── barrio.routes.js
│   │   └── notification.routes.js
│   ├── middlewares/
│   │   ├── verification.middleware.js
│   │   └── moderation.middleware.js
│   └── db/
│       ├── migrations/
│       │   ├── 006_barrios.sql
│       │   ├── 007_users_verificacion.sql
│       │   ├── 008_publications_moderacion.sql
│       │   ├── 009_notificaciones.sql
│       │   └── 010_verificaciones_auditoria.sql
│       └── seeds/
│           └── barrios_barranquilla.sql

frontend/
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   │   └── AdminVerificadoresPage.js
│   │   ├── verificador/
│   │   │   ├── VerificadorDashboardPage.js
│   │   │   ├── VerificarPerfilesPage.js
│   │   │   └── ModerarPublicacionesPage.js
│   │   ├── VerificacionPendientePage.js
│   │   ├── PerfilPublicoVendedorPage.js
│   │   └── ChatPage.js
│   ├── components/
│   │   ├── BarrioAutocomplete.js
│   │   ├── RadioSelector.js
│   │   ├── VerificacionBadge.js
│   │   ├── PublicacionEstadoBadge.js
│   │   └── ChatWidget.js
│   ├── services/
│   │   ├── barrio.service.js
│   │   ├── verification.service.js
│   │   ├── moderation.service.js
│   │   ├── notification.service.js
│   │   └── chat.service.js
│   ├── state/
│   │   └── notification.store.js
│   └── hooks/
│       └── useGeolocation.js
```

---

## ✅ CHECKLIST DE ENTREGA MVP

- [ ] Registro Cliente / Vendedor (NO verificador/admin)
- [ ] Verificación perfil por Verificador (flujo completo)
- [ ] Moderación publicaciones por Verificador (flujo completo)
- [ ] Admin asigna Verificadores
- [ ] Barrios Barranquilla + búsqueda por radio/barrio
- [ ] Perfil público vendedor con contacto WhatsApp
- [ ] Notificaciones en tiempo real
- [ ] Build limpio + Tests pasando
- [ ] Documentación API + Usuario

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
*Última actualización: 2026-07-18*