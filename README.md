# Employee Management System (EMS)

A modular monolith employee operations platform that manages authentication, employee records, leave workflows, grievance handling, dashboards, and database-backed session management. Built with a NestJS 11 API backend, Prisma ORM, PostgreSQL 15, and a Next.js 16 frontend, it serves role-based workflows for administrators and employees.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started / Installation & Local Development](#getting-started--installation--local-development)
- [Configuration](#configuration)
- [Usage / API Documentation](#usage--api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Tech Stack

### Backend

| Category | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20 |
| Framework | NestJS | 11 |
| Language | TypeScript | 5 |
| Database | PostgreSQL | 15 |
| ORM | Prisma | 5 |
| Validation | class-validator / class-transformer | — |
| Auth | Custom JWT sessions with HMAC-SHA256 | — |
| Password Hashing | Node.js crypto.scrypt | — |
| Linting | ESLint / TypeScript ESLint / Prettier | — |

### Frontend

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.2.7 |
| UI Library | React / React DOM | 19.2.4 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| Data Fetching | TanStack React Query | 5.101.1 |
| Icons | lucide-react | 1.21.0 |
| Linting | ESLint / eslint-config-next | 9 / 16.2.7 |

### DevOps & Infrastructure

| Category | Tool | Details |
|---|---|---|
| Containerization | Docker / Docker Compose | Local PostgreSQL + backend + frontend stack |
| Database Image | postgres | 15-alpine |
| Backend Image | node | 20-alpine |
| Frontend Image | node | 20-bookworm-slim |

---

## Features

### Authentication & Authorization

- Email/password login with JWT session issuance
- Logout and refresh-token style session rotation
- Forgot-password and reset-password flows
- Role-aware access control for Admin and Employee workflows
- Guarded backend routes using JWT and role checks

### Employee Management

- Employee creation, listing, detail view, update, and soft delete
- Department lookup for employee assignment
- Address support for country, city, and state fields
- UUID-based employee identity model

### Leave Management

- Leave request submission with start/end dates and reason
- Leave balance lookup per employee and leave type
- Admin review of all requests
- Approval/rejection workflows with balance deduction on approval

### Grievance Management

- Employee grievance submission
- Anonymous grievance option
- Admin grievance listing and status updates
- Status values: `Under Review`, `Resolved`, `Rejected`

### Dashboards

- Admin dashboard metrics for active employees, pending leaves, and open grievances
- Employee dashboard metrics for personal leave and grievance activity

### Data Model Coverage

- Employees
- Departments
- Addresses
- Attendance
- Leave requests
- Leave types
- Leave balances
- Grievances
- Sessions
- Password reset tokens

> Note: The SRS includes attendance tracking requirements, and the Prisma schema contains an `Attendance` entity. The current backend/frontend code does not yet expose a dedicated attendance controller or UI route.

---

## Project Structure

```text
/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── employee/
│   │   ├── grievance/
│   │   ├── leave/
│   │   ├── prisma/
│   │   ├── users/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── eslint.config.mjs
│   └── package.json
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── forgot-password/
│   │   ├── grievance/
│   │   ├── leave/request/
│   │   ├── login/
│   │   └── reset-password/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── Dockerfile
│   ├── eslint.config.mjs
│   └── package.json
├── Employee Management System SRS.pdf
├── docker-compose.yml
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── README.md
```

---

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL 15 or Docker + Docker Compose
- Git

---

## Getting Started / Installation & Local Development

### 1. Clone the repository

```bash
git clone your-fork-or-repository-url
cd Employee-Management
```

### 2. Backend setup

Create a root `.env` file for Docker Compose or configure the backend environment directly.

```env
NODE_ENV=development
DB_USER=postgres
DB_PASSWORD=securepassword123
DB_NAME=ems_db
DB_PORT_HOST=5434
BACKEND_PORT_HOST=3001
BACKEND_PORT_CONTAINER=3001
FRONTEND_PORT_HOST=3000
FRONTEND_PORT_CONTAINER=3000
NEXT_PUBLIC_API_URL=http://localhost:3001
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRATION=1d
```

For manual backend development, use:

```env
DATABASE_URL=postgresql://postgres:securepassword123@localhost:5434/ems_db?schema=public
PORT=3001
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRATION=1d
NODE_ENV=development
```

Install and start the backend:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run start:dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

### 4. Docker Compose development

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`
- PostgreSQL: `localhost:5434`

---

## Configuration

### Seed Data

The backend seed script creates the initial lookup data and a default admin user for local development.

Use it after setting up Prisma and the database:

```bash
cd backend
npx prisma db push
npm run prisma:seed
```

This is useful when you want a fresh development database with the default departments, roles, and admin account already in place. After seeding, copy the admin credentials printed in the terminal and use them to log in to the app.

If you reset or recreate the database, run the seed script again so the sample data is restored.

---

## Usage / API Documentation

All backend endpoints are prefixed with `/api`.

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api` | Root application response |
| `GET` | `/api/health` | Health check |

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate with email and password |
| `POST` | `/api/auth/logout` | Remove the current session |
| `POST` | `/api/auth/refresh` | Refresh a valid session token |
| `POST` | `/api/auth/forgot-password` | Create a password reset token |
| `POST` | `/api/auth/reset-password` | Reset the password using a token |

### Employees

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/employee/departments` | List departments |
| `POST` | `/api/employee/create` | Create an employee |
| `GET` | `/api/employee` | List employees |
| `GET` | `/api/employee/:id` | Get employee details |
| `PATCH` | `/api/employee/:id` | Update employee details |
| `DELETE` | `/api/employee/:id` | Soft-delete an employee |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users` | Create a user |
| `GET` | `/api/users` | List users |
| `GET` | `/api/users/:id` | Get a user by ID |
| `PATCH` | `/api/users/:id` | Update a user |
| `DELETE` | `/api/users/:id` | Delete a user |

### Leave

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/leave` | Submit a leave request |
| `GET` | `/api/leave/balance` | View leave balances |
| `GET` | `/api/leave/requests` | List leave requests for admins |
| `PATCH` | `/api/leave/status/:id` | Approve or reject a request |

### Grievance

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/grievance` | Submit a grievance |
| `GET` | `/api/grievance` | List grievances for admins |
| `PATCH` | `/api/grievance/:id` | Update grievance status |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/admin` | Admin dashboard metrics |
| `GET` | `/api/dashboard/employee?employeeId=<uuid>` | Employee dashboard metrics |

### Frontend Routes

- `/login`
- `/forgot-password`
- `/reset-password`
- `/dashboard/admin`
- `/dashboard/employee`
- `/employees`
- `/employees/add`
- `/employees/[id]`
- `/leave/request/apply`
- `/leave/request/balances`
- `/leave/request/history`
- `/leave/request/status`
- `/leave/request/alerts`
- `/grievance`
- `/grievance/admin`

---

## Testing

### Backend

```bash
cd backend
npm run lint
npm run test
npm run test:cov
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

---

## Deployment

### Docker Compose

The repository includes a `docker-compose.yml` stack for local or server-based deployment with PostgreSQL, backend, and frontend services.

```bash
docker compose up --build -d
```

### Production Notes

- Set `NODE_ENV=production`
- Set a strong `JWT_SECRET`
- Use a production PostgreSQL instance
- Build the frontend with `npm run build` and run it with `npm run start`
- Build the backend with `npm run build` and start with `npm run start:prod`

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, branch strategy, Conventional Commits, PR flow, and code style rules.

---

## License

No repository license file is currently present. Add a `LICENSE` file before distributing this project as open source.
