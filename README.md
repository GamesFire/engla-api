# EngLa API 🇬🇧

> Production-ready RESTful API for **EngLa** — a short-term rental marketplace in England. Built with Node.js, Express, TypeScript, PostgreSQL, and Clean Architecture principles.

![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Table of Contents

- [📖 Introduction](#-introduction)
- [🛠 Tech Stack](#-tech-stack)
- [🏗 Architecture & Design Patterns](#-architecture--design-patterns)
- [✅ Prerequisites](#-prerequisites)
- [🚀 Getting Started](#-getting-started)
- [⚙ Environment Configuration](#-environment-configuration)
- [💻 Database Management (CLI)](#-database-management-cli)
- [🧪 Testing](#-testing)
- [📂 Project Structure](#-project-structure)
- [📜 Scripts](#-scripts)
- [🏷 Versioning & Commits](#-versioning--commits)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

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
npm run start
```

---

## ⚙ Environment Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`, `staging`) | `development` |
| `PORT` | API Port | `4000` |
| `APP_TYPE` | Type of instance (`api`, `worker`) | `api` |
| `CORS_ORIGIN` | Allowed Origin for CORS | - |
| `AUTH0_ISSUER_BASE_URL` | Auth0 Tenant Domain | - |
| `AUTH0_AUDIENCE` | Auth0 API Identifier / Namespace | - |
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

## 🧪 Testing

We use **Vitest** and **Supertest** for unit and integration testing.

### Test Configuration (`.env.test`)

Tests run in an isolated environment. When running `npm test`, the system automatically loads variables from a dedicated `.env.test` file (or CI secrets) instead of the standard `.env`.

* **Isolation:** Ensures tests do not affect your local development database.
* **Validation:** The application config validator treats `NODE_ENV=test` specifically to allow mock credentials in CI environments to pass Zod validation without needing real production secrets.

**Note:** Ensure you have a `.env.test` file created locally (or secrets configured in CI) with valid (dummy) database credentials to pass the configuration validation step.

### Running Tests

```bash
# Run all tests
npm run test
```

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
|   ├── errors/         # Custom Error classes (HttpError, etc.)
│   ├── health/         # Infrastructure health check logic
│   ├── middlewares/    # Express middlewares (Auth, Logger, Error Handler, Security etc.)
│   └── utils/          # Helpers (Data parsing, Graceful Shutdown etc.)
├── modules/            # Domain Modules (Business Logic / Services)
├── routes/             # API Routes (System & V1), Controllers
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
- `npm run start`: Runs the compiled application (Production mode).
- `npm run clean`: Removes the `dist` directory.
- `npm run lint`: Lint code with ESLint.
- `npm run format`: Format code with Prettier.
- `npm run test`: Run unit tests with Vitest.
- `npm run typecheck`: Runs TypeScript type checking without emitting files.
- `npm run prepare`: Sets up Husky git hooks.

---

## 🏷 Versioning & Commits

This project follows **Semantic Versioning (SemVer)** and enforces the **Conventional Commits** specification. This ensures a readable Git history and allows for automated releases and CHANGELOG generation.

### Commit Standards

We use `commitlint` (configured with `@commitlint/config-conventional`) and Husky hooks to validate commit messages before they are created. 

Your commit message must follow this structure:
`<type>[optional scope]: <description>`

**Allowed Types:**
* `feat`: A new feature (correlates with a MINOR release).
* `fix`: A bug fix (correlates with a PATCH release).
* `docs`: Documentation only changes.
* `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc).
* `refactor`: A code change that neither fixes a bug nor adds a feature.
* `perf`: A code change that improves performance.
* `test`: Adding missing tests or correcting existing tests.
* `ci`: Changes to our CI configuration files and scripts (e.g., GitHub Actions, semantic-release).
* `chore`: Changes to the build process or auxiliary tools and libraries.

**Example of a valid commit:**
`feat(users): add admin middleware for user management`

### Automated Releases

We use `semantic-release` to fully automate the version management and package publishing process.
When code is merged into the main branch, the CI/CD pipeline will automatically:
1. Analyze the commit messages.
2. Determine the next semantic version number (Major, Minor, or Patch).
3. Generate and update the `CHANGELOG.md` file.
4. Create a new Git tag and GitHub Release.

---

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feat/amazing-feature`).
3.  Commit your changes following the **Conventional Commits** standard: 
    `git commit -m 'feat: add some amazing feature'`
4.  Push to the branch (`git push origin feat/amazing-feature`).
5.  Open a Pull Request.

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for more information.