# MUISKA

MUISKA es una plataforma de comercio comunitario en fase inicial. Este repositorio contiene la estructura base para continuar el desarrollo de forma escalable.

## Estructura del proyecto

- frontend/: aplicación SPA con Vite, Tailwind y JavaScript vanilla.
- backend/: API base con Express.js.
- database/: carpeta preparada para futuros scripts y modelos.
- docs/: documentación y recursos.

## Tecnologías

- Frontend: HTML5, Tailwind CSS, JavaScript ES6 Modules, Vite.
- Backend: Node.js, Express.js.
- Base de datos: PostgreSQL.

## Instalación

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Base de datos con Docker

```bash
docker compose up -d
```

## Ejecución

- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api/status
