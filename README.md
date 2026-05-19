# TaskMaster

Production-ready team task management SaaS built with React, Express, PostgreSQL, Prisma, and JWT authentication.

## Features

- Role-based authentication for `ADMIN` and `MEMBER`
- Admin dashboard with projects, users, task metrics, overdue work, productivity charts, and activity feed
- Member dashboard with assigned tasks, deadlines, projects, and personal analytics
- Project CRUD with member management by email
- Task CRUD with assignment, due dates, priority, status, search, filters, pagination-ready API, and sorting
- Drag-and-drop Kanban board for `TODO`, `IN_PROGRESS`, and `DONE`
- Task comments and project/task activity logs
- Responsive SaaS UI with reusable React components, charts, toast notifications, modals, empty states, and protected routes
- Railway-ready full-stack deployment

## Tech Stack

Frontend: React, Vite, Tailwind CSS, React Router, Axios, Context API, React Hook Form, Zod, Framer Motion, Recharts, Lucide React  
Backend: Node.js, Express, Prisma ORM, PostgreSQL, JWT, bcrypt, Helmet, CORS, rate limiting

## Folder Structure

```txt
backend/
  prisma/
    migrations/
    schema.prisma
    seed.js
  src/
    config/
    controllers/
    middleware/
    routes/
    services/
    utils/
    validations/
frontend/
  src/
    components/
    context/
    lib/
    pages/
    styles/
```

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:migrate
npm run seed
npm run dev
```

Frontend runs on `http://localhost:5173`. Backend runs on `http://localhost:5000`.

Seed credentials:

- Admin: `admin@taskmaster.dev` / `password123`
- Member: `maya@taskmaster.dev` / `password123`

## Environment Variables

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskmaster?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:5173"
VITE_API_URL="http://localhost:5000/api"
```

## Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
npm run seed
```

For production:

```bash
npm run prisma:generate
npm run prisma:deploy -w backend
```

## API Endpoints

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Projects:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:userId`

Tasks:

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

Dashboard:

- `GET /api/dashboard/stats`

Comments:

- `POST /api/comments`
- `GET /api/comments/:taskId`

## Railway Deployment

1. Create a Railway project and add PostgreSQL.
2. Set `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV=production`, and `CLIENT_URL` to your deployed URL.
3. Deploy from the repository root.
4. Run database migrations with `npm run prisma:deploy -w backend`.
5. Optionally seed with `npm run seed -w backend`.

The root build script builds the Vite frontend, and the Express server serves `frontend/dist` in production.
