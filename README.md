# EngLa API 🇬🇧

> Production-ready RESTful API for **EngLa** — a short-term rental marketplace in England. Built with Node.js, Express, TypeScript, PostgreSQL, and Clean Architecture principles.

![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![License](https://img.shields.io/badge/license-ISC-grey.svg)

## 📋 Table of Contents

- [Introduction](#introduction)
- [Tech Stack](#tech-stack)
- [Architecture & Design Patterns](#architecture--design-patterns)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [Database Management (CLI)](#database-management-cli)
- [Project Structure](#project-structure)
- [Scripts](#scripts)

---

## 📖 Introduction

**EngLa API** serves as the backend core for a property rental platform. It handles user management, property listings, bookings etc. The system is designed to be scalable, maintainable, and type-safe.

## 🛠 Tech Stack

- **Runtime:** Node.js (v20+)
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (Primary), Redis (Caching & Queues)
- **ORM / Query Builder:** Knex.js & Objection.js
- **Dependency Injection:** InversifyJS
- **Validation:** Zod
- **Logging:** Winston (JSON structure, rotation, dev/prod modes)
- **CLI:** Commander.js (Custom management tools)

---

## 🏗 Architecture & Design Patterns

This project follows **Clean Architecture** principles to ensure separation of concerns:

1.  **Dependency Injection (IoC):** All services and infrastructure clients are managed via `InversifyJS`. We avoid tight coupling by injecting dependencies through constructors.
2.  **Singleton Pattern:** Database connections (Knex, Redis) are initialized once and reused.
3.  **Bootstrapper Pattern:** Infrastructure initialization logic is decoupled from the entry point.
4.  **Custom CLI:** Instead of relying on global binaries, we use a project-specific CLI (`engla-cli`) to manage database operations, ensuring consistency across environments.

---

## ✅ Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **Docker** (Recommended for running PostgreSQL and Redis)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/GamesFire/engla-api.git
cd engla-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

### 4. Start Infrastructure (Docker)

If you don't have local instances of Postgres and Redis, use Docker:

```bash
docker-compose up -d
```

### 5. Initialize Database

Use the custom CLI to create the database and run migrations:

```bash
# Create the database (if it doesn't exist)
npm run cli db:create

# Run migrations
npm run cli db:migrate

# (Optional) Seed data
npm run cli db:seed
```

### 6. Run the Application

```bash
# Development mode (watch mode)
npm run dev

# Production build & start
npm run build
npm start
```

---

## ⚙️ Environment Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`, `staging`) | `development` |
| `PORT` | API Port | `4000` |
| `APP_TYPE` | Type of instance (`api`, `worker`) | `api` |
| `LOG_LEVEL` | Logging level (`debug`, `info`, `error`, `warn`, `http`) | `info` |
| `LOG_DIR` | Directory for log files | `logs` |
| `DB_HOST` | PostgreSQL Host | `localhost` |
| `DB_PORT` | PostgreSQL Port | `5432` |
| `DB_USER` | PostgreSQL User | - |
| `DB_PASS` | PostgreSQL Password | - |
| `DB_NAME` | Database Name | - |
| `DB_DEFAULT_NAME` | Default Database Name | - |
| `REDIS_HOST` | Redis Host | `localhost` |
| `REDIS_PORT` | Redis Port | `6379` |
| `REDIS_PASS` | Redis Password | - |
| `REDIS_DB` | Redis Database | `0` |

---

## 💻 Database Management (CLI)

We use a custom CLI tool built with `Commander.js` to manage database operations safely.

**Entry command:** `npm run cli`

| Command | Description |
| --- | --- |
| `npm run cli db:create` | Creates the database if it doesn't exist (using `pg` driver). |
| `npm run cli db:drop` | ⚠️ Drops the database (Dev environment only). |
| `npm run cli db:reset` | ⚠️ Drops, re-creates, migrates, and seeds the DB. |
| `npm run cli db:migrate` | Runs pending migrations (`knex migrate:latest`). |
| `npm run cli db:rollback` | Reverts the last batch of migrations. |
| `npm run cli db:make:migration <name>` | Creates a new migration timestamped file. |
| `npm run cli db:seed` | Runs seed files. |

---

## 📂 Project Structure

```text
database/               # Database migrations & seeds (Knex)
src/
├── cli/                # Custom CLI tool implementation (Commands, Entrypoint)
├── interfaces/         # Shared interfaces
├── ioc/                # Dependency Injection (Container, Bindings, Decorators)
├── lib/                # Core libraries & Shared infrastructure
│   ├── configs/        # Configuration schemas (AppConfig, KnexConfig)
│   ├── constants/      # Global constants (Enums, static data)
│   ├── db/             # Database clients (Knex, Redis), Models (Objection.js) & Admin utils
│   ├── health/         # Infrastructure health check logic
│   └── utils/          # Helpers (Data parsing, Graceful Shutdown etc.)
├── modules/            # Domain Modules (Business Logic / Services)
├── routes/             # API Routes & Controllers
├── types/              # Global TypeScript type definitions
├── server.ts           # HTTP Server setup (Express app configuration)
└── entrypoint.ts       # Main application entry point
tests/                  # Unit & Integration tests
```

---

## 📜 Scripts

- `npm run dev`: Starts the application in development mode with `nodemon`.
- `npm run cli`: Runs the custom CLI tool (use `npm run cli -- --help` to see commands).
- `npm run build`: Compiles TypeScript to JavaScript (`dist` folder).
- `npm start`: Runs the compiled application (Production mode).
- `npm run clean`: Removes the `dist` directory.
- `npm run lint`: Lint code with ESLint.
- `npm run format`: Format code with Prettier.
- `npm test`: Run unit tests with Vitest.
- `npm run typecheck`: Runs TypeScript type checking without emitting files.
- `npm run prepare`: Sets up Husky git hooks.

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feat/amazing_feature`).
3.  Commit your changes (`git commit -m 'Add some amazing_feature'`).
4.  Push to the branch (`git push origin feat/amazing_feature`).
5.  Open a Pull Request.

---

## 📝 License

Distributed under the ISC License. See `LICENSE` for more information.