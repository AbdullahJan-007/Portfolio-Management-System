# Portfolio Management System

A complete full-stack portfolio management application built with **Next.js (App Router)**, **TypeScript**, **Prisma** and **SQLite**. Users can register, log in, and manage their portfolio — personal information, about section, contact details, skills, and projects — through an interactive dashboard.

## Features

### Authentication
- User registration (email + password, bcrypt-hashed)
- User login
- User logout
- Session handling via signed JWT stored in an `httpOnly` cookie
- Route protection via Next.js middleware

### Portfolio Management
- Personal information (name, title, location, avatar)
- About section (bio)
- Contact information (email, phone, website, GitHub, LinkedIn, Twitter/X)

### Skills Management
- Add skills (name, category, proficiency 1–5)
- Update skills
- Delete skills

### Project Management
- Add projects (title, description, live URL, repo URL, image, tags)
- Update projects
- Delete projects

## Tech Stack

| Layer     | Choice                          |
| --------- | ------------------------------- |
| Framework | Next.js 14 (App Router)         |
| Language  | TypeScript                      |
| Styling   | Tailwind CSS                    |
| Database  | SQLite via Prisma ORM           |
| Auth      | `jose` (JWT) + `bcryptjs`       |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

The `.env` file already contains a local SQLite connection string and an
`AUTH_SECRET`. Create the database schema:

```bash
npm run db:push
```

(Optional) seed a demo account (`demo@example.com` / `password123`):

```bash
npm run db:seed
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
prisma/
  schema.prisma         # Database models (User, Profile, Skill, Project)
  seed.mjs              # Optional demo data
src/
  middleware.ts         # Protects /dashboard, redirects auth pages
  lib/
    auth.ts             # Password hashing, JWT sessions, current user
    db.ts               # Prisma client singleton
    api.ts              # JSON response helpers
    validation.ts       # Input validation helpers
  app/
    page.tsx            # Landing page
    login/              # Login page
    register/           # Register page
    dashboard/          # Protected area (overview, profile, skills, projects)
    api/
      auth/             # register, login, logout, me
      profile/          # GET / PUT profile
      skills/           # CRUD skills
      projects/         # CRUD projects
  components/
    Sidebar.tsx         # Dashboard navigation + logout
```

## API Overview

| Method | Endpoint              | Description              |
| ------ | --------------------- | ------------------------ |
| POST   | `/api/auth/register`  | Create account + log in  |
| POST   | `/api/auth/login`     | Log in                   |
| POST   | `/api/auth/logout`    | Log out                  |
| GET    | `/api/auth/me`        | Current user             |
| GET    | `/api/profile`        | Get profile              |
| PUT    | `/api/profile`        | Create/update profile    |
| GET    | `/api/skills`         | List skills              |
| POST   | `/api/skills`         | Create skill             |
| PUT    | `/api/skills/:id`     | Update skill             |
| DELETE | `/api/skills/:id`     | Delete skill             |
| GET    | `/api/projects`       | List projects            |
| POST   | `/api/projects`       | Create project           |
| PUT    | `/api/projects/:id`   | Update project           |
| DELETE | `/api/projects/:id`   | Delete project           |

All portfolio endpoints are scoped to the authenticated user and enforce
ownership on update/delete.

## Security Notes
- Passwords are hashed with bcrypt (never stored in plain text).
- Sessions use signed JWTs in `httpOnly`, `sameSite=lax` cookies.
- Change `AUTH_SECRET` to a long random value before deploying.
