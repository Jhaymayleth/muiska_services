<div align="center">

# 🏺 MUISKA

### Community Commerce Platform

![Status](https://img.shields.io/badge/status-completed-success?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📖 Description

**MUISKA** is a community commerce platform that connects people to publish, explore, and manage items for sale within a collaborative environment. The project is structured as a monorepo with a **vanilla JavaScript SPA frontend** built with Vite, a **REST backend** in Express, and a **PostgreSQL** database — all fully orchestrated with Docker.

---

## 🗂️ Project Structure

```
muiska/
├── backend/                      # Express REST API
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── config/               # PostgreSQL connection, logger, env vars
│   │   ├── controllers/          # Business logic per module
│   │   ├── middlewares/          # JWT auth, validation, file upload, rate-limit, error handling
│   │   ├── routes/               # REST endpoint definitions
│   │   ├── services/             # Service layer (business logic)
│   │   ├── utils/                # Utilities (publication formatting)
│   │   ├── validators/           # Validation schemas (Zod)
│   │   ├── db/                   # Migrations & seeds
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/                    # Unit tests
│   └── uploads/                  # Uploaded files
│
├── frontend/                     # SPA with Vite + Tailwind + vanilla JS
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── components/           # common, layout, listing, ui
│   │   ├── pages/                # Application views
│   │   │   └── admin/            # Admin panel
│   │   │   └── dashboard/        # User dashboard
│   │   ├── router/               # History pushState-based router
│   │   ├── services/             # HTTP client for the backend
│   │   ├── state/                # Reactive stores (session, notifications)
│   │   ├── styles/               # Global SCSS styles
│   │   ├── templates/            # Reusable HTML fragments
│   │   ├── utils/                # Auth, helpers, template loader
│   │   ├── App.js
│   │   └── main.js
│   └── public/
│
├── docker-compose.yml            # Orchestrates backend, frontend & PostgreSQL
└── README.md
```

---

## ⚙️ Technologies

| Layer             | Technologies                                                    |
| ----------------- | --------------------------------------------------------------- |
| **Frontend**      | HTML5, JavaScript ES6 Modules, Tailwind CSS, Vite, SCSS         |
| **Backend**       | Node.js, Express.js, JWT, Zod, Multer, Pino, Swagger            |
| **Database**      | PostgreSQL 16, `pgcrypto` extension (UUID)                      |
| **Infrastructure**| Docker / Docker Compose                                         |
| **Testing**       | Node.js Test Runner                                             |

---

## 🧩 Data Model

The system includes the following main tables:

- **users** — User registry with roles (admin, verifier, customer, seller), verification status, badge, location, rating
- **publications** — Listed items with title, description, price, category, images, and status (active/sold/inactive)
- **categories** — Hierarchical categories for classifying publications
- **favorites** — User favorites
- **verifications** — Seller verification process
- **notifications** — System auto-notifications
- **neighborhoods** — Neighborhoods for geolocation

---

## 🔌 REST API

Base prefix: `/api`

### Status & Health

| Method | Endpoint        | Description                   |
| ------ | --------------- | ----------------------------- |
| `GET`  | `/api/status`   | Backend status                |
| `GET`  | `/api/health`   | Health check with database    |

### Authentication

| Method | Endpoint                   | Description                        |
| ------ | -------------------------- | ---------------------------------- |
| `POST` | `/api/auth/register`       | User registration                  |
| `POST` | `/api/auth/login`          | User login                         |
| `GET`  | `/api/auth/me`             | Authenticated user profile         |
| `PUT`  | `/api/auth/profile`        | Update user profile                |

### Publications

| Method | Endpoint                         | Description                              |
| ------ | -------------------------------- | ---------------------------------------- |
| `GET`  | `/api/publications`              | List publications                        |
| `GET`  | `/api/publications/:id`          | Publication details                      |
| `POST` | `/api/publications`              | Create publication (verified seller)     |
| `PUT`  | `/api/publications/:id`          | Update publication                       |
| `DELETE`| `/api/publications/:id`         | Delete publication                       |

### Categories

| Method | Endpoint                 | Description               |
| ------ | ------------------------ | ------------------------- |
| `GET`  | `/api/categories`        | List categories           |

### Favorites

| Method | Endpoint                    | Description                       |
| ------ | --------------------------- | --------------------------------- |
| `GET`  | `/api/favorites`            | List user favorites               |
| `POST` | `/api/favorites/:pubId`     | Add to favorites                  |
| `DELETE`| `/api/favorites/:pubId`    | Remove from favorites             |

### Verifications

| Method | Endpoint                                | Description                             |
| ------ | --------------------------------------- | --------------------------------------- |
| `GET`  | `/api/verifications/mi-estado`          | User verification status                |
| `GET`  | `/api/verifications/pending`            | List pending verifications              |
| `GET`  | `/api/verifications/:id`                | Verification details                    |
| `POST` | `/api/verifications/:id/approve`        | Approve verification                    |
| `POST` | `/api/verifications/:id/reject`         | Reject verification                     |
| `GET`  | `/api/verifications/history/mine`       | Verifier history                        |

### Notifications

| Method | Endpoint                            | Description                            |
| ------ | ----------------------------------- | -------------------------------------- |
| `GET`  | `/api/notifications`                | List user notifications                |
| `PATCH`| `/api/notifications/:id/read`       | Mark as read                           |
| `POST` | `/api/notifications/read-all`       | Mark all as read                       |
| `DELETE`| `/api/notifications/:id`           | Delete notification                    |

### Administration

| Method | Endpoint                            | Description                            |
| ------ | ----------------------------------- | -------------------------------------- |
| `GET`  | `/api/admin/verifiers`              | List verifiers                         |
| `POST` | `/api/admin/verifiers/:id`          | Assign verifier role                   |
| `DELETE`| `/api/admin/verifiers/:id`         | Remove verifier role                   |
| `GET`  | `/api/admin/users`                  | List users                             |
| `GET`  | `/api/admin/publications`           | List publications                      |
| `GET`  | `/api/admin/dashboard`              | Dashboard statistics                   |
| `POST` | `/api/admin/categories`             | Create category                        |
| `PUT`  | `/api/admin/categories/:id`         | Update category                        |
| `DELETE`| `/api/admin/categories/:id`        | Delete category                        |

### Moderation

| Method | Endpoint                          | Description                 |
| ------ | --------------------------------- | --------------------------- |
| `PATCH`| `/api/publications/:id/moderation`| Moderate publication       |

---

## 🧭 Frontend Routes

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
*                          → Not found page
```

The router implements authentication guards: redirects to `/login` for protected routes, to `/dashboard` if already authenticated on login/register pages, and to `/verification-pending` if the seller is not yet verified.

---

## 🚀 Installation & Setup

### Prerequisites

- Docker & Docker Compose (recommended)
- Node.js 20+ (for manual development)

### 1. Clone and start

```bash
git clone https://github.com/Riwi-io-Medellin/245-bugai.git
cd 245-bugai
docker compose up -d
```

### 2. Access the application

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3001/api/status
- **Swagger docs:** http://localhost:3001/api/docs

### 3. Test credentials

| Role    | Email              | Password    |
| ------- | ------------------ | ----------- |
| Admin   | admin@admin.com    | Admin123!   |
| User    | user@user.com      | User123!    |

### Manual development (without Docker)

#### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend in dev mode runs at **http://localhost:5173**.

---

## 🧪 Tests

```bash
cd backend
npm test
```

The backend uses Node.js native test runner (`node --test`).

---

## 🐳 Docker Services

| Service    | Port | Container           |
| ---------- | ---- | ------------------- |
| Frontend   | 8080 | muiska-frontend     |
| Backend    | 3001 | muiska-backend      |
| PostgreSQL | 5433 | muiska-postgres     |

---

## 📋 Implemented Features

### Backend
- [x] JWT authentication (register, login, profile)
- [x] Publications CRUD with images
- [x] Product categories
- [x] User favorites
- [x] Seller verification system
- [x] Auto-notifications
- [x] Admin panel (users, publications, categories, verifiers)
- [x] Publication moderation
- [x] File upload with Multer
- [x] Rate limiting
- [x] Zod validation
- [x] Structured logging with Pino
- [x] Swagger documentation
- [x] Automatic migrations & seeds

### Frontend
- [x] Client-side routing SPA
- [x] Authentication & role guards
- [x] Landing page with featured publications
- [x] Publication browsing with search and filters
- [x] Registration with role selection (customer/seller)
- [x] Publication creation and editing
- [x] Publication detail view
- [x] User profile
- [x] User dashboard with statistics
- [x] Full admin panel
- [x] Favorites system
- [x] Real-time notifications
- [x] Responsive design with Tailwind CSS
- [x] Reusable UI components

---

<div align="center">

Built as part of the training program at **Riwi** — Cohort 2026

</div>
