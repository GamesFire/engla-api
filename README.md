# EngLa API 🏴󠁧󠁢󠁥󠁮󠁧󠁿

> Production-ready RESTful API for **EngLa** — a short-term rental marketplace in England. Built with Node.js, Express, TypeScript, PostgreSQL, and Clean Architecture principles.

![Node.js](https://img.shields.io/badge/Node.js-v22.22+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Table of Contents

- [📖 Introduction](#-introduction)
- [🛠 Tech Stack](#-tech-stack)
- [🏗 Architecture & Design Patterns](#-architecture--design-patterns)
- [📐 Code Style & Engineering Standards](#-code-style--engineering-standards)
- [✅ Prerequisites](#-prerequisites)
- [🚀 Getting Started](#-getting-started)
- [⚙ Environment Configuration](#-environment-configuration)
- [💻 Database Management (CLI)](#-database-management-cli)
- [🔌 Integrations](#-integrations)
- [⚡ Webhooks & Asynchronous Event Architecture](#-webhooks--asynchronous-event-architecture)
- [⚙️ Background Workers (Cron & Jobs)](#️-background-workers-cron--jobs)
- [🧪 Testing](#-testing)
- [📂 Project Structure](#-project-structure)
- [📜 Scripts & Makefile](#-scripts--makefile)
- [🏷 Versioning & Commits](#-versioning--commits)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## 📖 Introduction

**EngLa API** serves as the backend core for a property rental platform. It handles user management, property listings, bookings etc. The system is designed to be scalable, maintainable, and type-safe.

## 🛠 Tech Stack

- **Runtime:** Node.js (v22.22.1+)
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL v14+ (Strictly required due to dialect-specific features like ILIKE, UPSERTs, etc.), Redis (Caching & Queues)
- **ORM / Query Builder:** Knex.js & Objection.js
- **Dependency Injection:** InversifyJS
- **Validation:** Zod
- **Logging:** Winston (JSON structure, rotation, dev/prod modes)
- **Payments & KYC:** Stripe Connect Express (Destination Charges & Splitting)
- **CLI:** Commander.js (Custom management tools)

---

## 🏗 Architecture & Design Patterns

This project follows **Clean Architecture** principles to ensure separation of concerns:

1.  **Dependency Injection (IoC):** All services and infrastructure clients are managed via `InversifyJS`. We avoid tight coupling by injecting dependencies through constructors.
2.  **Singleton Pattern:** Database connections (Knex, Redis) are initialized once and reused.
3.  **Bootstrapper Pattern:** Infrastructure initialization logic is decoupled from the entry point.
4.  **Custom CLI:** Instead of relying on global binaries, we use a project-specific CLI (`engla-cli`) to manage database operations, ensuring consistency across environments.

### Naming Conventions (Ubiquitous Language)

To maintain a predictable and highly readable codebase, we strictly enforce the following naming conventions across our layers:

1. **Controllers (Route & Role Context):**
   Controller method names must reflect the **Endpoint Route** and the **Actor (Role)** calling it. This immediately tells the developer who is authorized to use this method.
   * `getPublicProperties` -> Maps to `GET /properties` (Accessible to anyone).
   * `getMyProperties` -> Maps to `GET /me/properties` (Accessible to the authenticated Host/User).
   * `adminGetAllProperties` -> Maps to `GET /admin/properties` (Accessible only to Admins).

2. **Services (Business Use-Case Context):**
   Service method names must reflect the pure **Business Action**, stripped of HTTP context. We only use suffixes (like `ByHost` or `ByAdmin`) when the identical action has different business rules depending on the actor.
   * `getProperties` -> A universal fetch method (No suffix needed).
   * `updatePropertyByHost` -> Applies host-specific rules (e.g., location is locked after publishing).
   * `adminUpdateProperty` -> Applies admin-specific rules (e.g., can force-change status bypassing host validations).
   * `createAmenity` -> No `admin` prefix needed because only admins can create amenities globally (no context overlap).

### Security & Granular Permissions (ABAC)

The system utilizes an **Attribute-Based Access Control (ABAC)** model for administrative and staff roles. Instead of relying solely on broad roles (like `admin`), access to sensitive endpoints is protected by **Granular Permissions**.

* **Action-Based Definitions:** Permissions are defined as specific, granular actions (e.g., `users:delete`, `properties:update`, `dictionaries:manage`) rather than abstract roles.
* **Real-time Enforcement:** The `permission.middleware` dynamically verifies these permissions against the database on every protected request. If a staff member's rights are revoked, they lose access instantly, even if their JWT is still valid.
* **Root Admin Bypass (Anti-Lockout):** The system defines a `ROOT_ADMIN_AUTH0_ID` in the environment variables. This master account bypasses all database permission checks (God Mode). This serves as a fail-safe to ensure the system owner is never accidentally locked out, even if the database permissions table is truncated or corrupted.

---

## 📐 Code Style & Engineering Standards

To keep the codebase scalable, consistent, and easy to maintain across all modules, every contribution must follow these strict engineering conventions:

### 1. Models (e.g., `src/lib/db/models/`)
* **Unified Section Headers:** Model properties and methods must be grouped using standardized section comments where applicable (e.g., `// --- System & Relations ---`, domain-specific sections such as `// --- Stay Details ---`, `// --- Timestamps ---`, `// --- Relations ---`, `// --- Relation Mappings (For Objection) ---`, `// --- Modifiers for JSON (Data Hiding) ---`).
* **Inline Annotations:** Annotate foreign keys (e.g., `// FK to UserModel (id)`), default values (e.g., `// Default false`), and database driver type nuances (e.g., `// !Important: pg returns decimal as string`).
* **Domain Value Sets:** Database-backed value sets (e.g., `PropertyStatus`, `BookingStatus`, `UserRole`) are declared as `as const` objects alongside their derived union type inside their respective model file.

### 2. Constants vs. Environment Variables (`*.constants.ts` vs. `.env`)
* **Pure Constants Only:** Files ending in `.constants.ts` must contain **only** `as const` constant objects or arrays — never TypeScript `enum` declarations. Derived union types belong in the module's `.types.ts` file.
* **`.env` vs. `.constants.ts` Separation:**
  * Use **`.env`** (parsed via config schemas, e.g., `appConfig`) for infrastructure settings, secrets, and operational thresholds that vary by environment or may be tuned without code changes (e.g., `STRIPE_PLATFORM_FEE_PERCENT`, `CRON_BOOKING_SCHEDULE`, `CRON_BOOKING_EXPIRATION_MINUTES`).
  * Use **`*.constants.ts`** for structured, multi-tier domain rules (e.g., `BookingCancellationConfig`, `PropertyRules`, `ValidationLimits`).
* **Data-Driven Scalability:** Avoid hardcoding rigid business assumptions (such as actor-specific refund percentages or policy switch-cases) directly inside service methods. Define them as declarative configuration maps (e.g., `ACTOR_REFUND_RATIOS` and `POLICY_TIERS` inside `BookingCancellationConfig`) so business rule updates require only a single config change.
* **No Magic Numbers or Inline Templates:** Never hardcode magic numbers (e.g., pagination defaults, guest-to-bed ratios, availability windows) or string templates inside services or validators; extract them into constants or formatting utilities (e.g., `src/lib/utils/format.ts`).

### 3. Strict Typing & Parameter Objects (`*.types.ts`)
* **Max 2 Parameters Rule:** Any function or method that requires **more than 2 parameters** must accept a single typed parameter object (e.g., `params: *Params`) to prevent positional argument mistakes and allow effortless extension.
* **Named Parameter & Return Types:** Never use inline object types or utility compositions (e.g., `Pick<Booking, ...>[]` or `{ from?: string; to?: string }`) directly in method signatures. Always extract them into descriptive, named types in `*.types.ts`.
* **Top-to-Bottom Type Ordering in `*.types.ts`:**
  1. Derived constant value types (e.g., `*Value`)
  2. Query & Find options (e.g., `*QueryOptions`, `Find*Options`)
  3. Query DTO aliases (e.g., `Get*Params`)
  4. Repository data & parameter types (e.g., `Create*Data`, `Update*Data`, `Update*Params`, `Check*Params`)
  5. Service helper & action parameter types (e.g., `*ByHostParams`, `*ByActorParams`, `*ByAdminParams`)
  6. Service result & response types (e.g., `*Result`, `*Quote`)

### 4. Class Organization, Section Dividers & Return Style
* **Private Methods at the Top:** All `private` helper methods must be placed at the very top of the class (immediately after the `constructor`), before any `public` methods.
* **Section Dividers Across Layers:**
  * **Repositories (`*.repository.ts`):** Must use standard read/write dividers (e.g., `// --- READ METHODS ---` and `// --- WRITE METHODS ---`) after private helpers.
  * **Controllers (`*.controller.ts`):** Must use access-tier dividers (e.g., `// --- PUBLIC ENDPOINTS ---`, `// --- PROTECTED ENDPOINTS ---`, `// --- ADMIN ENDPOINTS ---`).
  * **Services (`*.service.ts`):** Do not use section divider comments inside service classes.
* **Explicit Variable Before Return:** When returning a constructed object literal in services, repositories, integrations, or utilities, assign it to a typed variable first (e.g., `const result: ResultType = { ... }; return result;`) to improve debugger inspection and type safety.

### 5. Routing, Controller, Service & Validation Ordering
* **Express Route Precedence (Critical):**
  * Static paths (e.g., `/`, `/me`, `/hosting`, `/categories`) **must** be registered before parameterized paths (e.g., `/:id`) so dynamic `GET` routes never intercept static endpoints or trigger unintended middlewares.
  * Public parameterized routes that share a base prefix with protected routers must include a numeric parameter guard middleware (e.g., `skipIfParamNotNumericMiddleware('id')`).
* **Logical Resource Grouping & HTTP Method Order:**
  * Group routes, controller methods, and service methods by access level (`Public` -> `Protected` -> `Admin`) and resource/sub-resource hierarchy (e.g., Core Property -> Property Images -> Property Blocked Dates).
  * Within each resource group, place read operations (`GET`) before write operations (`POST`, `PATCH`, `PUT`, `DELETE`), unless Express route matching or middleware execution order requires a specific exception (e.g., `POST /` registered alongside static root routes before `GET /:id`).
* **Validation Files (`*.validation.ts`):**
  * All reusable validation helper functions (e.g., `validateStayDateRange`, `refinePropertySearchDates`) and their helper types must be placed at the **very top** of the file (e.g., under `// --- VALIDATION HELPERS ---`) so they are immediately visible.
  * Schema sections follow a consistent top-to-bottom order (e.g., `SHARED SCHEMAS` -> `PROTECTED SCHEMAS` -> `PUBLIC SCHEMAS` -> `ADMIN SCHEMAS` -> `EXPORT TYPES`).

### 6. JSDoc, Comments & Punctuation
* **Unified JSDoc Structure:** Add JSDoc to methods where architectural or business context is valuable. Every JSDoc block must follow the same format:
  1. Summary description (full sentences ending with a period `.`).
  2. Blank `*` line.
  3. `@param <name> - ...` for every parameter (ending with `.`).
  4. `@returns ...` (including `@returns A Promise that resolves when ...` for documented `Promise<void>` methods).
  5. `@throws ...` when the method explicitly throws an HTTP error (e.g., `HttpError`).
* **No Narrative Inline Comments:** Do not leave step-by-step narrative comments (e.g., `// Case 1...`, `// Step 2...`) inside method bodies. Document the behavior in the method's JSDoc instead; keep only actionable `// TODO` markers inside method bodies.
* **Error & Validation Message Punctuation:** All error messages (e.g., `ErrorMessages` in `src/lib/constants/errors.ts`) and validation messages must **not** end with a trailing period (internal sentences in multi-sentence messages are separated by `. `).

### 7. Database Migrations & Seeds (e.g., `database/migrations/`, `database/seeds/`)
* **Table-Level Descriptions:** Every table creation migration must begin with a concise `table.comment('...')` describing the table's role in the schema.
* **Cross-Table Column & Chaining Consistency:** Equivalent domain columns across different tables (e.g., `currency`, `order`, `created_at`, `updated_at`) must use identical column types and constraints unless a specific domain rule requires otherwise (e.g., nullable fields on draft listings vs. non-nullable snapshots on confirmed bookings). Always chain Knex column modifiers in a consistent order: type modifier (e.g., `.unsigned()`) -> nullability (`.notNullable()` or `.nullable()`) -> uniqueness (`.unique()`) -> default value (`.defaultTo(...)`) -> comment (`.comment(...)`).
* **Foreign Key Annotations:** Place an association comment above foreign key definitions (e.g., `// Associate <entity> with a <target>`) and an inline comment on `.onDelete(...)` explaining the referential integrity rule (e.g., cascading cleanup vs. restricting deletion when history exists).
* **Non-Obvious Column Comments Only:** Attach `.comment('...')` to columns **only** when the column has non-obvious domain or technical semantics (e.g., monetary amounts stored in lowest currency units such as pence, denormalized/snapshot fields, inclusive vs. exclusive date bounds, state transition flags, or specific string formats). Never add redundant `.comment('...')` calls to self-explanatory columns (e.g., `first_name`, `email`, `description`, `url`, `check_in_date`).
* **Consistent Section Dividers:** Use standard single-line section dividers (e.g., `// --- Dates & Capacity ---`, `// --- Financial Snapshot (in pence) ---`) in large, multi-domain tables and seed arrays, and omit section headers in small, single-purpose tables. Avoid verbose multi-line banner comments or leftover boilerplate comments from CLI stubs.

---

## ✅ Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: v22.22.1 or higher
- **npm**: v10.0.0 or higher
- **PostgreSQL**: v14.0 or higher
- **Docker** (Recommended for running local infrastructure)
- **[Stripe CLI](https://docs.stripe.com/stripe-cli)** (Optional, required for forwarding Stripe webhooks to `localhost` during local development)

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

You can use the provided `Makefile` to run the API and Background Workers easily.

```bash
# Run both API and Worker in parallel (development mode)
make dev

# Or run just the API
make dev-api

# Production build & start
make build
make start-api
make start-worker
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
| `AUTH0_M2M_CLIENT_ID` | Auth0 Machine-to-Machine Client ID | - |
| `AUTH0_M2M_CLIENT_SECRET` | Auth0 Machine-to-Machine Client Secret | - |
| `ROOT_ADMIN_AUTH0_ID` | The Auth0 ID of the unmodifiable Root Administrator (used to prevent privilege escalation) | `auth0\|root_admin123` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Account Name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | - |
| `CLOUDINARY_BASE_FOLDER`| Root folder for uploads | - |
| `STRIPE_SECRET_KEY` | Stripe API Secret Key | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook Signing Secret | - |
| `STRIPE_RETURN_URL` | Frontend URL where hosts return after successful onboarding | - |
| `STRIPE_REFRESH_URL` | Frontend URL where hosts return if the KYC link expires | - |
| `STRIPE_CHECKOUT_SUCCESS_URL` | Frontend URL where guests return after completing booking payment | - |
| `STRIPE_CHECKOUT_CANCEL_URL` | Frontend URL where guests return if they cancel checkout | - |
| `STRIPE_PLATFORM_FEE_PERCENT` | Platform commission percentage deducted from bookings | `10` |
| `LOG_LEVEL` | Logging level (`debug`, `info`, `error`, `warn`, `http`) | `info` |
| `LOG_DIR` | Directory for log files | `logs` |
| `DB_HOST` | PostgreSQL Host | `localhost` |
| `DB_PORT` | PostgreSQL Port | `5432` |
| `DB_USER` | PostgreSQL User | - |
| `DB_PASS` | PostgreSQL Password | - |
| `DB_NAME` | Database Name | - |
| `DB_DEFAULT_NAME` | System default database (e.g., `postgres`) used for initial admin connection | - |
| `DB_DEBUG` | Enables Knex query logging in development mode | `false` |
| `REDIS_HOST` | Redis Host | `localhost` |
| `REDIS_PORT` | Redis Port | `6379` |
| `REDIS_PASS` | Redis Password | - |
| `REDIS_DB` | Redis Database | `0` |
| `CRON_CLEANUP_SCHEDULE` | Cron expression for the background property cleanup job | `0 2 * * *` |
| `CRON_CLEANUP_DRAFTS_DAYS` | Number of days after which an untouched draft property is hard-deleted | `30` |
| `CRON_CLEANUP_SOFT_DAYS` | Number of days after which an archived property undergoes soft cleanup (keeps only main image) | `60` |
| `CRON_CLEANUP_HARD_DAYS` | Number of days after which an archived property undergoes hard cleanup (deletes all images) | `365` |
| `CRON_BOOKING_SCHEDULE` | Cron expression for the background booking lifecycle job | `*/5 * * * *` |
| `CRON_BOOKING_EXPIRATION_MINUTES` | Minutes before an unpaid pending booking expires | `30` |
| `SEED_ADMIN_AUTH0_ID` | Mock Auth0 ID for the main Admin account | `auth0\|admin123` |
| `SEED_ADMIN_EMAIL` | Mock email for the main Admin account | `admin@engla.com` |
| `SEED_HOST_AUTH0_ID` | Mock Auth0 ID for the demo Host account | `auth0\|host123` |
| `SEED_HOST_EMAIL` | Mock email for the demo Host account | `demo.host@example.com` |

### 💡 Pro-tip for Local Testing (Seed Accounts)

By default, the seed script creates mock users with fake Auth0 IDs and emails. Since you cannot log into these fake accounts, you should overwrite them with your **real Auth0 credentials** in your `.env` file before seeding the database:

1. Register an account on your locally running frontend (which is connected to your Auth0 tenant).
2. Go to your Auth0 Dashboard -> User Management -> Users.
3. Copy the `user_id` (e.g., `auth0|64b9a1...`) and the user's `email`.
4. Paste them into your `.env` mapping to the respective roles:
   - **Admin:** `SEED_ADMIN_AUTH0_ID` and `SEED_ADMIN_EMAIL`
   - **Host:** `SEED_HOST_AUTH0_ID` and `SEED_HOST_EMAIL`
5. Run `npm run cli db:seed`.

Now you can successfully log in and test the system with full Admin or Host privileges!

### 🔑 Generating Access Tokens for Multiple Test Users (Auth0 + Postman)

The **Test** tab inside an Auth0 API dashboard issues Machine-to-Machine (`client_credentials`) tokens tied to an application rather than a human user. To test multi-actor workflows (e.g., a guest booking a property owned by another host) directly from Postman without a frontend:

1. **Create Test Users in Auth0:**
   - Go to **User Management → Users → Create User**, set an email and password (using the `Username-Password-Authentication` connection), and set **Email Verified** to `true`.
2. **Configure Auth0 Tenant & Application Settings:**
   - In **Settings (Tenant Settings) → General → API Authorization Settings**, set **Default Directory** to `Username-Password-Authentication` and save.
   - In **Applications → Applications**, select your application, scroll to **Advanced Settings → Grant Types**, enable **Password**, and save.
   - In the same application, open the **APIs** tab and toggle your backend API (e.g., `https://api.engla.com`) to **Authorized**.
3. **Request a User Access Token in Postman:**
   - Send a `POST` request to `https://<your-auth0-domain>/oauth/token` with `Content-Type: application/json`:
     ```json
     {
       "grant_type": "password",
       "username": "client1@example.com",
       "password": "YourPassword123!",
       "audience": "https://api.engla.com",
       "client_id": "<YOUR_AUTH0_CLIENT_ID>",
       "client_secret": "<YOUR_AUTH0_CLIENT_SECRET>",
       "scope": "openid profile email"
     }
     ```
4. **Synchronize the User with the Local Database:**
   - On the first login with a newly created Auth0 user, call the authentication sync endpoint (e.g., `POST /api/v1/auth/login`) with `Authorization: Bearer <access_token>` and a JSON body containing (e.g., `{ "email", "firstName", "lastName" }`) so the user record is created in PostgreSQL.

---

## 💻 Database Management (CLI)

We use a custom CLI tool built with `Commander.js` to manage database operations safely.

**Entry command:** `npm run cli`

| Command | Description |
| --- | --- |
| `npm run cli db:create` | Creates the database if it doesn't exist (using `pg` driver). |
| `npm run cli db:drop` | ⚠️ Drops the database (Dev environment only). |
| `npm run cli db:reset` | ⚠️ Drop and re-creates the database (Dev environment only). |
| `npm run cli db:migrate` | Runs pending migrations (`knex migrate:latest`). |
| `npm run cli db:rollback` | Reverts the last batch of migrations (`knex migrate:rollback`). |
| `npm run cli db:make:migration <name>` | Creates a new migration timestamped file (e.g., `create_users`). |
| `npm run cli db:delete:migration <name>` | Physically deletes a migration file from the disk (e.g., `20260130150428_create_users.ts`). |
| `npm run cli db:run:migration <name>` | Runs a specific pending migration file (e.g., `20260130150428_create_users.ts`). |
| `npm run cli db:rollback:migration <name>` | Reverts a specific migration file (e.g., `20260130150428_create_users.ts`). |
| `npm run cli db:seed` | Runs all seed files (`knex seed:run`). |
| `npm run cli db:make:seed <name>` | Creates a new seed file (e.g., `01_system_permissions`). |
| `npm run cli db:delete:seed <name>` | Physically deletes a seed file from the disk (e.g., `01_system_permissions.ts`). |
| `npm run cli db:run:seed <name>` | Runs a specific seed file (e.g., `01_system_permissions.ts`). |

### Database Seeding Strategy

Our seed files follow a strict naming convention to ensure proper execution order and environment safety:

- **`01_system_*` / `02_system_*`**: System seeds contain production-ready dictionaries and core data (e.g., granular permissions, global amenity categories). These are executed in **all** environments, including production.
- **`04_mock_*` / `05_mock_*`**: Mock seeds contain fake entities (e.g., users, properties, role assignments) generated for development, testing, and presentations. These files include a failsafe guard (`if (appConfig.isProd) return;`) to ensure they are **never** executed in production.
- **Numerical Prefix**: Guarantees that referenced tables are seeded in the correct order to respect foreign key constraints (e.g., `01_system_permissions` runs before `04_mock_users` so mock admins can be assigned permissions).

---

## 🔌 Integrations

This project is designed to easily integrate with third-party providers. All external services are isolated within the `src/lib/integrations` directory to keep the core domain logic clean.

* **[Auth0](https://auth0.com/):** Used for robust identity management, authentication, and authorization. We utilize the Auth0 Management API (via M2M App) for secure backend actions like synchronous user account deletion.
* **[Cloudinary](https://cloudinary.com/):** Serves as our primary media asset management platform and CDN. It handles the storage, dynamic format conversion (e.g., to WebP), and on-the-fly optimization of user avatars and property gallery images.
* **[Stripe Connect Express](https://stripe.com/connect):** Powers our financial Escrow/Marketplace infrastructure. It handles global KYC (Know Your Customer) verification, AML compliance, automated tax reporting (e.g., DAC7, 1099-K), and destination charge splits (routing guest payments to hosts while deducting platform commissions).

---

## ⚡ Webhooks & Asynchronous Event Architecture

To build a reactive marketplace without polling or blocking client requests, EngLa relies on an asynchronous event-driven architecture powered by webhooks. When third-party services (e.g., Stripe) complete background operations, they push events directly to our specialized webhook ingestion layer.

### Core Architectural Principles

To guarantee system stability, data integrity, and protection against replay attacks, all webhook integrations across the platform must adhere to strict engineering rules:

* **Raw Stream Interception:** Cryptographic signature verification requires the exact, unmodified byte stream sent by the provider. Our HTTP server dynamically isolates webhook routes (e.g., `/api/v1/webhooks/*`), bypassing standard JSON body parsers and capturing the payload as a raw `Buffer`.
* **HMAC Signature Verification:** Every incoming webhook must include a valid cryptographic provider signature in its headers (e.g., `stripe-signature`). Requests failing verification are dropped immediately at the controller level with an HTTP `400 Bad Request`.
* **Idempotency & Fast Acknowledgments:** External providers retry event delivery if they do not receive a prompt 20x HTTP status. Our controllers immediately acknowledge receipt (`200 OK`) before or during dispatch, while our domain services implement idempotent checks to gracefully ignore duplicate payloads without mutating the database twice.

### Event Flow Example: Host Onboarding (Stripe Connect)

We utilize this asynchronous pattern to handle complex user state transitions, such as upgrading a standard guest to a verified host:

1. **Initiation:** The client triggers host onboarding via a protected API endpoint (e.g., `POST /v1/users/me/onboarding/host`). The service validates domain rules (e.g., verified email, completed basic profile).
2. **Link Generation:** The API communicates with the payment provider to generate an Express account and returns a temporary, single-use KYC onboarding URL to the client.
3. **External Verification:** The user completes identity and bank account verification directly on the provider's secure hosted pages. Our server never touches raw identity documents or banking numbers.
4. **Asynchronous Upgrade:** Once KYC is verified, the provider fires an event (e.g., `account.updated`) to our webhook ingestion endpoint. The respective webhook service validates the required capabilities (e.g., `details_submitted`, `payouts_enabled`) and safely transitions the user's role to `HOST` in our system.

### Local Webhook Forwarding (e.g., Stripe CLI)

Because external payment providers cannot send HTTP requests directly to `localhost`, local development and testing of webhook-driven flows (e.g., host KYC onboarding, booking checkout confirmation, asynchronous refund updates) require forwarding events through a local tunnel or provider CLI:

1. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli) on your machine and authenticate your account (`stripe login`). If your Stripe organization uses Sandboxes, run `stripe switch` after logging in and select the active Sandbox matching your `.env` credentials.
2. Start forwarding webhook events to your local webhook ingestion endpoint:
   ```bash
   stripe listen --all-snapshot --forward-to localhost:4000/api/v1/webhooks/stripe
   ```
3. Copy the temporary webhook signing secret printed in the terminal output (e.g., `whsec_...`) and set it in your local `.env` file (e.g., `STRIPE_WEBHOOK_SECRET=whsec_...`).
4. Restart the local API server (`make dev` or `make dev-api`) so the updated signing secret is loaded into memory.

### Test Host Onboarding (Stripe Connect Test Mode / Sandbox)

When testing host KYC onboarding (e.g., via `POST /api/v1/users/me/onboarding/host`) in a Stripe Test / Sandbox environment, open the returned `url` in your browser and use Stripe's built-in test helpers instead of real personal or banking data:

* **Phone Verification:** Click **Use test phone number** and enter the test SMS code `000 000` (or click **Use test code**).
* **Personal Details:** Any valid-looking address and date of birth (e.g., `01/01/1990`) are accepted in test mode.
* **Payout Bank Account:** Click **Use test account** (or enter Stripe's standard UK test bank details, e.g., Sort Code `10-88-00` and Account Number `00012345`).
* **Submission:** Click **Agree and submit**. Once submitted, Stripe sends the `account.updated` webhook event with `details_submitted: true` and `payouts_enabled: true`, which automatically completes onboarding and upgrades a client account to `host`.

### Test Payments (Stripe Test Mode / Sandbox)

Stripe Checkout in test mode never charges real money. Use one of Stripe's [official test cards](https://docs.stripe.com/testing#cards) on the hosted Checkout page:

* **Card number:** a successful-payment test card (e.g., `4242 4242 4242 4242`), or a decline test card to simulate failed payments (e.g., `4000 0000 0000 0002`).
* **Expiry date:** any future date (e.g., `12/34`).
* **CVC:** any 3 digits (e.g., `123`).
* **Remaining fields** (e.g., cardholder name, country, postal code): any valid-looking values. The exact set of fields is controlled by Stripe and may vary by selected country.

> [!NOTE]
> In test mode, the guest card, the platform balance, and the connected host account all live inside the same Stripe Sandbox. The platform's **Balance → Transactions** view therefore shows the full gross charge together with the transfer to the host and the collected application fee as separate ledger lines. The host's net payout is visible on the connected account itself (e.g., **Connect → Connected accounts → select the host**).

---

## ⚙️ Background Workers (Cron & Jobs)

To maintain database hygiene and handle long-running background tasks without blocking the main API event loop, the system supports independent **Worker Processes**.

Workers are instantiated by running the application with `APP_TYPE=worker`. They initialize the same core DI container and database connections but completely skip booting the Express HTTP server, instead scheduling background tasks (like `node-cron` schedules or future BullMQ processors).

### Implemented Jobs
* **PropertyCleanupJob:** Runs automatically on a schedule (configurable via `CRON_CLEANUP_SCHEDULE`) to perform DB hygiene:
  * **Draft Abandonment:** Deletes `DRAFT` properties that haven't been updated for a specific number of days (default: 30 days, configurable via `CRON_CLEANUP_DRAFTS_DAYS`).
  * **Soft Cleanup:** Removes secondary photos from Cloudinary and the database for properties archived past a specific threshold (default: > 60 days, configurable via `CRON_CLEANUP_SOFT_DAYS`), keeping only the main thumbnail for booking history.
  * **Hard Cleanup:** Removes the main photo as well for properties archived past a long-term threshold (default: > 365 days, configurable via `CRON_CLEANUP_HARD_DAYS`).
* **BookingLifecycleJob:** Runs automatically on a configurable schedule (e.g., via `CRON_BOOKING_SCHEDULE`) to maintain booking state consistency:
  * **Pending Expiration:** Automatically expires unpaid pending bookings past the configured threshold (e.g., default: 30 minutes, configurable via `CRON_BOOKING_EXPIRATION_MINUTES`) and closes their open payment sessions to free up property dates.
  * **Stay Completion:** Transitions confirmed bookings whose check-out date has passed into the completed state.

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
.github/                # GitHub Actions (CI/CD workflows), Dependabot, PR & Issue templates
.husky/                 # Git hooks (pre-commit, commit-msg)
database/               # Database structure and data management
├── migrations/         # Schema definitions and table structures
├── seeds/              # Initial data population scripts (system & mock data)
├── stubs/              # Code generation templates (ensures proper Knex CLI file formatting)
tests/                  # Unit & Integration tests (Vitest)
src/                    # Main source code
├── @types/             # Global TypeScript type definitions
├── cli/                # Custom CLI tool implementation (Commands, Entrypoint)
├── interfaces/         # Shared TypeScript interfaces
├── ioc/                # Dependency Injection (Container, Bindings, Decorators)
├── lib/                # Core libraries & Shared infrastructure
│   ├── configs/        # Configuration schemas (AppConfig, KnexConfig)
│   ├── constants/      # Global constants (Enums, Time, Limits, Error Codes, etc.)
│   ├── db/             # Database clients (Knex, Redis), Base Models (Objection.js)
│   ├── errors/         # Custom Error classes (HttpError, etc.)
│   ├── health/         # Infrastructure health check logic
│   ├── integrations/   # Third-party service providers (Auth0, Cloudinary, Stripe, etc.)
│   ├── middlewares/    # Express middlewares (Auth, Rate Limiters, File Uploads, etc.)
│   ├── utils/          # Helpers (Type Guards, Graceful Shutdown, Sanitization, etc.)
│   ├── validations/    # Global and shared Zod validation schemas
│   ├── bootstrap-infrastructure.ts # Core infrastructure initialization logic
│   └── logger.ts       # Application logger configuration
├── modules/            # Domain Modules / Business Logic (Services, Repositories, Webhooks, Jobs)
├── routes/             # API Routes, Controllers & Schemas (System, V1, Webhooks)
├── server.ts           # HTTP Server setup (Express app, CORS, Middleware pipeline)
└── entrypoint.ts       # Main application entry point
...                     # Standard ecosystem configs (ESLint, Prettier, TS, Semantic Release, etc.)
```

---

## 📜 Scripts & Makefile

For convenience, the project includes a `Makefile` to easily run and orchestrate the API and Background Workers.

**Using Make:**
- `make dev`: Starts both the API and the Worker in parallel (requires `concurrently`).
- `make dev-api`: Starts only the API in development mode.
- `make dev-worker`: Starts only the Worker in development mode.
- `make build`: Compiles the project for production.
- `make start-api`: Starts the compiled API.
- `make start-worker`: Starts the compiled Worker.
- `make verify`: Runs linter, type checks, and tests sequentially.
- `make clean`: Removes the `dist` directory.

**Direct NPM Scripts:**
- `npm run dev`: Starts the default application using `nodemon`.
- `npm run dev:api`: Starts the API application in development mode with `nodemon`.
- `npm run dev:worker`: Starts the Background Worker in development mode with `nodemon`.
- `npm run dev:all`: Runs both API and Worker processes simultaneously using `concurrently`.
- `npm run prebuild`: Automatically cleans the build directory and compiler cache before building.
- `npm run build`: Compiles TypeScript to JavaScript (`dist` folder).
- `npm run start`: Runs the compiled default application.
- `npm run start:api`: Runs the compiled API application.
- `npm run start:worker`: Runs the compiled Worker application.
- `npm run clean`: Removes the `dist` directory and `.tsbuildinfo` cache files.
- `npm run cli`: Runs the custom CLI tool (use `npm run cli -- --help` to see commands).
- `npm run lint`: Lint code with ESLint.
- `npm run format`: Format code with Prettier.
- `npm run test`: Run unit tests with Vitest.
- `npm run typecheck`: Runs TypeScript type checking without emitting files.
- `npm run verify`: Runs linter, typecheck, and tests sequentially.
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