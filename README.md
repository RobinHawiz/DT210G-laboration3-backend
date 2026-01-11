# Matsmart Logistik Backend API

REST API (CRUD) for managing warehouse **items** and **user accounts** for an intranet-style application.

## Tech Stack

- **Node.js** + **Fastify**
- **TypeScript**
- **AJV** (validation via Fastify schemas)
- **Awilix** + **@fastify/awilix** (DI)
- **SQLite** (better-sqlite3)
- **bcrypt** (password hashing)
- **jsonwebtoken** (JWT auth)

## Project Structure

This project uses a layered structure with domain-oriented filenames. The term domain refers to the specific subject area or problem that software system aims to address [^1].

Example: `routes/item.ts`, `controllers/item.ts`, `services/item.ts`, `repositories/item.ts`, `schemas/item.ts` all belong to the **item** domain. Same structure applies for the **user** domain.

[^1]: GeeksforGeeks, "Domain-Driven Design (DDD)". Retrieved 2026-01-10. Link: https://www.geeksforgeeks.org/system-design/domain-driven-design-ddd/

```plaintext
src/
├── app.ts                 # Fastify app configuration (CORS, DI, routes)
├── server.ts              # Server entrypoint
├── config/                # Env + DB setup
├── errors/                # Domain errors
├── models/                # Domain entity types
├── schemas/               # AJV schemas (Fastify route validation)
├── routes/                # Route registration
├── controllers/           # Maps HTTP requests to services and maps results/errors to HTTP responses
├── services/              # Business logic
├── repositories/          # DB access
└── hooks/                 # Auth hook (JWT verification)
```

## Setup & Run

Install dependencies:
```code
npm install
```

Create a `.env` in the project root:

- `DATABASE=../db/sqlite.db`  
  Used by the running API (`src/config/db.ts`). The path is resolved relative to the config folder at runtime.

- `DATABASE_INSTALL_PATH=db/sqlite.db`  
  Used by the DB install script (`install.ts`).

- `JWT_SECRET_KEY=...`  
  Secret used to sign/verify JWTs. Generate a secret key:
  ```code
  npm run genSecretKey
  ```

Optional:
- `PORT=3000` (defaults to 3000 if not set)
- `CORS_ORIGINS=*` (defaults to `*`)

Initialize the SQLite database (drops & recreates tables + seeds data):
```code
npm run db:init
```

Build and start:
```code
npm run build
npm start
```

Default server:
- `http://localhost:3000`

## Authentication

All routes **except** `POST /api/users/login` are protected with JWT.

### How to call protected routes

Send a JWT in the header:

`Authorization: Bearer <token>`

Auth errors:
- `401 Unauthorized` if token is missing
- `403 Forbidden` if token is invalid

### Login

`POST /api/users/login` returns a JWT string (expires in **1 hour**).

### Validate token

`GET /api/auth` validates the JWT and returns:
- `200 OK` if the token is valid
- `401/403` if the token is missing/invalid

The response body is empty (status code only).

### Seeded login (after `npm run db:init`)

The init script inserts one user:

- `username`: `mmbullar`
- `password`: `jagharbakatbullar`

## Data Structures

SQLite handles persistence, while validation and data constraints are enforced at the application layer using AJV schemas (`src/schemas/*`).

### Item

| Field          | SQLite Column / Type      | Description                              | AJV Validation                         |
|---------------|----------------------------|------------------------------------------|----------------------------------------|
| `id`          | `id` INTEGER AUTOINCREMENT | Primary key                              | integer, min 1                         |
| `name`        | `name` TEXT                | Item name                                | string, min 1, max 100                 |
| `description` | `description` TEXT         | Item description                         | string, min 1, max 200                 |
| `price`       | `price` REAL               | Item price                               | number, min 0                          |
| `imageUrl`    | `image_url` TEXT           | Image URL / path                         | string, min 1, max 2000                |
| `amount`      | `amount` INTEGER           | Stock amount                             | integer, min 0                         |

### User

| Field            | SQLite Column / Type          | Description                 | AJV Validation                      |
|-----------------|-------------------------------|-----------------------------|-------------------------------------|
| `id`            | `id` INTEGER AUTOINCREMENT    | Primary key                 | integer, min 1 (params validation)  |
| `username`      | `username` TEXT               | Username                    | string, min 1, max 50               |
| `password`      | (request only)                | Plain password (not stored) | string, min 1, max 100              |
| `passwordHash`  | `password_hash` TEXT          | Hashed password in DB       | (not validated in requests)         |

> Passwords are always stored as a bcrypt hash in the `password_hash` column.

## API Endpoints

### Auth

| Method | Route        | Protected | Description        | Body / Params | Responses |
|--------|--------------|:---------:|--------------------|---------------|----------|
| GET    | `/api/auth`  | Yes       | Validate JWT token | None          | `200 OK` • `401/403` • `500` |

### User

| Method | Route               | Protected | Description                          | Body / Params                                | Responses |
|--------|----------------------|:---------:|--------------------------------------|----------------------------------------------|----------|
| POST   | `/api/users/login`   | No        | Authenticate user, returns JWT       | `{ "username": string, "password": string }` | `200 OK` (JWT string) • `400` • `500` |
| GET    | `/api/users`         | Yes       | Get all users                        | None                                         | `200 OK` • `401/403` • `500` |
| GET    | `/api/users/:id`     | Yes       | Get user by id                       | `:id`                                        | `200 OK` • `400` • `401/403` • `500` |
| POST   | `/api/users`         | Yes       | Insert a new user                    | `{ "username": string, "password": string }` | `201 Created` (+ Location header) • `400` • `401/403` • `500` |
| PUT    | `/api/users/:id`     | Yes       | Update a user                        | `:id`                                        | `204 No Content` • `400` • `401/403` • `500` |
| DELETE | `/api/users/:id`     | Yes       | Delete a user                        | `:id`                                        | `204 No Content` • `400` • `401/403` • `500` |

### Item

| Method | Route            | Protected | Description                                       | Body / Params                                                                 | Responses |
|--------|-------------------|:---------:|---------------------------------------------------|-------------------------------------------------------------------------------|----------|
| GET    | `/api/items`      | Yes       | Get all items                                     | None                                                                          | `200 OK` • `401/403` • `500` |
| GET    | `/api/items/:id`  | Yes       | Get item by id                                    | `:id`                                                                         | `200 OK` • `400` • `401/403` • `500` |
| POST   | `/api/items`      | Yes       | Insert a new item                                 | `{ "name": string, "description": string, "price": number, "imageUrl": string, "amount": number }` | `201 Created` (+ Location header) • `400` • `401/403` • `500` |
| PUT    | `/api/items/:id`  | Yes       | Update an existing item                           | `:id`                                                                         | `204 No Content` • `400` • `401/403` • `500` |
| DELETE | `/api/items/:id`  | Yes       | Delete an item                                    | `:id`                                                                         | `204 No Content` • `400` • `401/403` • `500` |
| PATCH  | `/api/items/:id`  | Yes       | Adjust stock amount (increase/decrease)           | `:id` + `{ "amount": integer }` where amount can be positive or negative      | `204 No Content` • `400` • `401/403` • `500` |

> PATCH note: the request body uses `amount` as a **delta (Δ)** (example: `+10` adds stock, `-10` removes stock).  
> The service prevents stock from going below 0 and returns `400 Bad Request` on insufficient stock.
