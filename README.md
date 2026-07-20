# Portfolio Manager

A full-stack **Portfolio Management System** — register, log in, and manage your
personal profile, skills and projects through a modern, interactive dashboard,
then share a **live preview** that updates the moment you save.

Built with the Next.js App Router, TypeScript, Prisma, and PostgreSQL, and
designed to deploy to Vercel with a single click.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features](#2-features)
3. [Live Project Link](#4-live-project-link)
4. [Technology Stack](#5-technology-stack)
5. [Database Design](#6-database-design)
6. [Project Structure](#7-project-structure)
7. [API Documentation](#8-api-documentation)
8. [Installation Guide](#9-installation-guide)
9. [Environment Variables](#10-environment-variables)
10. [Deployment Guide (Vercel)](#11-deployment-guide-vercel)
11. [Security Notes](#13-security-notes)
12. [Roadmap](#14-roadmap)
13. [License](#15-license)

---

## 1. Project Overview

**Portfolio Manager** is a self-service CMS for developers and other
professionals who want a personal portfolio without hand-writing HTML or
paying for a website builder. Instead of maintaining a static site, the user
signs up, fills in their information through a dashboard, and the app
persists everything to a database — the portfolio is generated from that
data every time it's viewed.

**Who it's for**

- Developers, designers, and freelancers who want a clean, always-current
  portfolio they can update from any device.
- Anyone who wants a small, well-structured example of a complete
  authenticated CRUD application built on the Next.js App Router.

**Core idea**

- One **User** account.
- One **Profile** (personal info, bio, contact links) attached to that user.
- Many **Skills**, grouped by category, each with a proficiency level.
- Many **Projects**, each with a category, links, image and tags.
- A set of **Project Categories** used to organize projects.
- A **Preview** page that renders all of the above as the public-facing
  portfolio, with live search/filter — this is the page you would ultimately
  share with recruiters, clients, or visitors.

---

## 2. Features

### Authentication & Accounts
- Email + password registration and login.
- Passwords hashed with **bcrypt** (cost factor 10) — never stored in plain text.
- Stateless sessions via **signed, HttpOnly JWT cookies** (`jose`, HS256),
  valid for 7 days.
- Change-password flow that re-verifies the current password before updating.
- Route-level protection: any `/dashboard/*` route redirects unauthenticated
  visitors to `/login` via Next.js middleware.

### Profile Management
- Personal info: full name, professional title, location.
- About section with a live character counter.
- Contact details: email, phone, website, GitHub, LinkedIn, Twitter/X.
- Profile photo upload (drag-in file picker or a direct image URL).

### Skills
- Add, edit, and delete skills.
- Group skills by category (e.g. Frontend, Backend, Tools).
- 1–5 proficiency level per skill.
- Search and filter by category.

### Projects
- Add, edit, and delete projects.
- Title, description, category, live demo URL, source code URL, cover image,
  and a comma-separated tag list.
- Search and filter by category or tag.

### Project Categories
- Create custom categories to organize projects.
- Renaming/removing a category safely un-sets it from any projects that used it
  (projects are never deleted as a side effect).

### Live Portfolio Preview
- Renders the profile, skills and projects exactly as a visitor would see them.
- Client-side search across title/description/tags/category.
- Auto-refreshes when the tab regains focus and on a 30-second interval, so
  edits made in another tab appear automatically.

### Dashboard
- At-a-glance stats: total skills, total projects, categories, profile
  completeness percentage.
- Recent activity feed (latest created/updated skills & projects).
- Contextual notifications (e.g. "your profile is incomplete") with a
  bell-icon dropdown and per-item dismissal (persisted in `localStorage`).
- Quick-action shortcuts to every section.

### Modern UI/UX
- Custom design system built on Tailwind CSS: a brand indigo→violet→cyan
  gradient identity, glassmorphism surfaces, soft glow shadows, and
  micro-interactions (hover lift, focus rings, fade/scale-in transitions).
- Fully responsive: collapsible sidebar on mobile, adaptive grid layouts.
- Toast notifications and inline form validation for clear feedback.
- Accessible focus states and semantic HTML throughout.

---

## 3. Live Project Link

> Add your deployed URL here once you've completed the
> [Deployment Guide](#11-deployment-guide-vercel):

**Live demo:** `portfolio-management-system-coral.vercel.app`

---

## 4. Technology Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Framework | [Next.js 14](https://nextjs.org) (App Router) | Routing, Server Components, Route Handlers (API) |
| Language | [TypeScript](https://www.typescriptlang.org) (strict mode) | Type safety across front and back end |
| UI | [React 18](https://react.dev) | Component model |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) | Utility-first styling + custom design tokens |
| ORM | [Prisma 5](https://www.prisma.io) | Type-safe database access & migrations |
| Database | [PostgreSQL](https://www.postgresql.org) | Persistent relational storage |
| Auth | [jose](https://github.com/panva/jose) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | JWT session signing/verification, password hashing |
| Deployment | [Vercel](https://vercel.com) | Serverless hosting for Next.js |
| DB hosting (recommended) | [Neon](https://neon.tech) / [Supabase](https://supabase.com) / [Vercel Postgres](https://vercel.com/storage/postgres) | Managed, serverless-friendly Postgres |

No external UI kit is used — every component (buttons, cards, inputs, toasts,
icons) is hand-built, keeping the bundle small and the design fully
customizable.

---

## 5. Database Design

### Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o| PROFILE : has
    USER ||--o{ SKILL : owns
    USER ||--o{ PROJECT : owns
    USER ||--o{ PROJECT_CATEGORY : owns

    USER {
        string id PK
        string email UK
        string passwordHash
        datetime createdAt
        datetime updatedAt
    }
    PROFILE {
        string id PK
        string userId FK
        string fullName
        string title
        string avatarUrl
        string location
        string bio
        string contactEmail
        string phone
        string website
        string github
        string linkedin
        string twitter
    }
    SKILL {
        string id PK
        string userId FK
        string name
        string category
        int level
    }
    PROJECT {
        string id PK
        string userId FK
        string title
        string description
        string category
        string url
        string repoUrl
        string imageUrl
        string tags
    }
    PROJECT_CATEGORY {
        string id PK
        string userId FK
        string name
        string slug
    }
```

### Model Reference

**User** — the authentication identity. `email` is unique; `passwordHash` is
a bcrypt hash, never the raw password. Deleting a user cascades to their
Profile, Skills, Projects and Project Categories (`onDelete: Cascade`).

**Profile** — one-to-one with User (`userId` is unique). Holds everything
shown on the public preview's "About" and "Contact" sections. All fields
except `fullName` are optional.

**Skill** — many-to-one with User. `category` is a free-text label (e.g.
"Frontend") used purely for grouping/filtering — not a foreign key, so users
can type any category without pre-creating it. `level` is clamped to 1–5.

**Project** — many-to-one with User. `tags` is stored as a single
comma-separated string and split on read (`parseTagList()` in
`src/lib/utils.ts`) — a deliberate simplicity trade-off appropriate for a
per-user list of a few dozen items; a normalized `Tag` join table would be the
next step if tags needed to be queried/filtered at scale.

**ProjectCategory** — many-to-one with User. Unlike a skill's category, this
is a first-class, manageable entity (create/rename/delete from the
Categories page) with a `(userId, name)` and `(userId, slug)` unique
constraint so the same user can't create duplicate categories.

All primary keys are `cuid()` strings (collision-resistant, sortable,
URL-safe — a good fit for public-ish IDs used in API routes).

---

## 6. Project Structure

```
.
├── prisma/
│   ├── schema.prisma          # Data model (see §6)
│   └── seed.mjs                # Optional: seeds a demo user + sample data
├── src/
│   ├── app/
│   │   ├── page.tsx             # Public landing page
│   │   ├── login/page.tsx       # Login
│   │   ├── register/page.tsx    # Registration
│   │   ├── layout.tsx           # Root layout, metadata, fonts
│   │   ├── globals.css          # Design system (tokens, components, utilities)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx        # Auth-gated shell (Sidebar + Header)
│   │   │   ├── page.tsx          # /dashboard → DashboardOverview
│   │   │   ├── DashboardOverview.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── skills/page.tsx
│   │   │   ├── projects/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   └── preview/page.tsx  # Live portfolio preview
│   │   └── api/                  # Route Handlers — see §8
│   │       ├── auth/{register,login,logout,me,change-password}/route.ts
│   │       ├── profile/route.ts
│   │       ├── skills/route.ts, skills/[id]/route.ts
│   │       ├── projects/route.ts, projects/[id]/route.ts
│   │       ├── categories/route.ts, categories/[id]/route.ts
│   │       ├── dashboard/route.ts
│   │       ├── notifications/route.ts
│   │       └── upload/route.ts
│   ├── components/               # Sidebar, Header, Toast, icons, etc.
│   ├── lib/
│   │   ├── auth.ts               # Password hashing, JWT session cookies
│   │   ├── db.ts                 # Prisma client singleton
│   │   ├── env.ts                # Startup env-var validation
│   │   ├── api.ts                # Standard JSON response helpers
│   │   ├── validation.ts         # Shared input validation/sanitizing
│   │   ├── queries.ts            # Reusable Prisma `where` builders
│   │   ├── dashboard.ts          # Aggregated dashboard/stat queries
│   │   ├── client-api.ts         # Typed fetch wrapper used by client components
│   │   └── utils.ts              # getInitials, parseTagList
│   └── middleware.ts             # Redirects unauthenticated /dashboard access
├── .env.example                  # Template for local environment variables
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## 7. API Documentation

All endpoints are Next.js **Route Handlers** under `src/app/api/`, return
JSON, and (except register/login/logout) require a valid session cookie.

**Base URL:** `/api` (relative to your deployment origin)

**Auth mechanism:** an HttpOnly cookie named `portfolio_session` containing a
signed JWT (`sub` = user id), set automatically by the login/register
endpoints. There is no separate bearer-token flow — the browser sends the
cookie automatically on same-origin requests.

**Standard response shapes**

```jsonc
// Success
{ "...": "resource-specific fields" }

// Error
{ "error": "Human-readable message" }
```

| Status | Meaning |
| --- | --- |
| `200` | Success |
| `201` | Resource created |
| `400` | Invalid request body / validation failure |
| `401` | Not authenticated (missing/invalid/expired session cookie) |
| `404` | Resource not found, or not owned by the current user |
| `409` | Conflict (e.g. duplicate category name, duplicate email) |
| `500` | Unexpected server error |

### Auth

| Method | Endpoint | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/register` | — | `{ email, password, fullName }` | Creates a user + empty profile, sets session cookie. `password` ≥ 8 chars. Returns `201` with `{ user }`. |
| `POST` | `/api/auth/login` | — | `{ email, password }` | Verifies credentials, sets session cookie. Returns `{ user }`. |
| `POST` | `/api/auth/logout` | ✓ | — | Clears the session cookie. Returns `{ success: true }`. |
| `GET` | `/api/auth/me` | ✓ | — | Returns the current session's `{ user }`. |
| `POST` | `/api/auth/change-password` | ✓ | `{ currentPassword, newPassword }` | Verifies the current password, then updates it. `newPassword` ≥ 8 chars. |

### Profile

| Method | Endpoint | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/api/profile` | ✓ | — | Returns `{ profile }` (or `null` if not yet created). |
| `PUT` | `/api/profile` | ✓ | `{ fullName, title?, avatarUrl?, location?, bio?, contactEmail?, phone?, website?, github?, linkedin?, twitter? }` | Upserts the caller's profile. `fullName` required. |

### Skills

| Method | Endpoint | Auth | Query / Body | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/api/skills` | ✓ | `?search=&category=` | Returns `{ skills[] }`, filtered and sorted by category then name. |
| `POST` | `/api/skills` | ✓ | `{ name, category?, level? }` | Creates a skill. `level` clamped to 1–5 (default 3). Returns `201` with `{ skill }`. |
| `PUT` | `/api/skills/:id` | ✓ | `{ name, category?, level? }` | Updates a skill you own. |
| `DELETE` | `/api/skills/:id` | ✓ | — | Deletes a skill you own. Returns `{ success: true }`. |

### Projects

| Method | Endpoint | Auth | Query / Body | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/api/projects` | ✓ | `?search=&category=&skill=` | Returns `{ projects[] }`, newest first. |
| `POST` | `/api/projects` | ✓ | `{ title, description?, category?, url?, repoUrl?, imageUrl?, tags? }` | Creates a project. `tags` is a comma-separated string. Returns `201` with `{ project }`. |
| `PUT` | `/api/projects/:id` | ✓ | Same as `POST` | Updates a project you own. |
| `DELETE` | `/api/projects/:id` | ✓ | — | Deletes a project you own. |

### Project Categories

| Method | Endpoint | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| `GET` | `/api/categories` | ✓ | — | Returns `{ categories[] }`, alphabetical. |
| `POST` | `/api/categories` | ✓ | `{ name }` | Creates a category (auto-generates `slug`). `409` if the name already exists for this user. |
| `PUT` | `/api/categories/:id` | ✓ | `{ name }` | Renames a category you own. |
| `DELETE` | `/api/categories/:id` | ✓ | — | Deletes a category you own; any projects using it have their `category` field cleared (they are **not** deleted). |

### Dashboard & Notifications

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/dashboard` | ✓ | Returns aggregated `{ stats, activities, notifications, skillCategories, projectCategories }` for the dashboard overview. |
| `GET` | `/api/notifications` | ✓ | Returns just `{ notifications[] }` (same source as above), used by the header bell dropdown. |

### Uploads

| Method | Endpoint | Auth | Body | Description |
| --- | --- | --- | --- | --- |
| `POST` | `/api/upload` | ✓ | `multipart/form-data` with a `file` field | Accepts a JPEG/PNG/GIF/WebP image up to 2 MB and returns `{ url }` — a base64 **data URI**, not a file path (see note below). Use the returned `url` as `avatarUrl`/`imageUrl`. |

> **Why a data URI instead of a saved file?** Vercel's serverless functions
> run on a read-only, ephemeral filesystem, so writing to `public/uploads`
> (as this project originally did) works locally but silently fails or is
> lost between requests in production. Returning a base64 data URI keeps
> uploads working identically in development and in production with zero
> extra configuration. For a production app handling many/large images,
> swap this route for a dedicated object store (Vercel Blob, Cloudinary, S3,
> Supabase Storage) and return its URL instead — every caller of `uploadImage()`
> in `src/lib/client-api.ts` stays unchanged.

---

## 8. Installation Guide

### Prerequisites

- **Node.js** 18.18+ (20 LTS recommended)
- **npm** 9+ (bundled with Node)
- A **PostgreSQL** database — any of these work and are free to start:
  - Local: [Docker](https://www.docker.com) or a native Postgres install
  - Hosted: [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/storage/postgres)

### Steps

```bash
# 1. Clone the repository
git clone <your-repository-url>
cd portfolio-manager

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# then edit .env and fill in DATABASE_URL and AUTH_SECRET (see §10)

# 4. Push the Prisma schema to your database
#    (creates the tables — no separate migration files needed for local dev)
npm run db:push

# 5. (Optional) seed some demo data
npm run db:seed

# 6. Start the development server
npm run dev
```

Open **http://localhost:3000**, click **Get started**, and create an account.

### Quick local Postgres with Docker

If you don't already have Postgres running locally:

```bash
docker run --name portfolio-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=portfolio \
  -p 5432:5432 -d postgres:16

# then in .env:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/portfolio"
```

### Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local dev server (http://localhost:3000) |
| `npm run build` | `prisma generate` + production build (what Vercel runs) |
| `npm run start` | Start the production server (after `build`) |
| `npm run db:push` | Sync `prisma/schema.prisma` to the database (dev workflow) |
| `npm run db:studio` | Open Prisma Studio — a GUI to browse/edit your data |
| `npm run db:seed` | Insert a demo user + sample skills/projects |

---

## 9. Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/db?sslmode=require`. Managed providers (Neon/Supabase/Vercel Postgres) give you this directly. |
| `AUTH_SECRET` | Yes | Long random string used to sign session JWTs. Generate one with `openssl rand -base64 32`. **Never** reuse the example value or commit a real secret to git. |

Set these in a local `.env` file for development, and in
**Project Settings → Environment Variables** on Vercel for production (see
next section).

---

## 10. Deployment Guide (Vercel)

### Step 1 — Provision a production database

Create a free Postgres database with **[Neon](https://neon.tech)** or
**[Supabase](https://supabase.com)** (or use **Vercel Postgres**, which
attaches directly to your Vercel project). Copy the connection string it
gives you — you'll need it in Step 3.

### Step 2 — Push your code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### Step 3 — Import the project into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
2. Vercel auto-detects Next.js — the default build settings are already
   correct for this project (`npm run build`, which runs `prisma generate`
   automatically).
3. Under **Environment Variables**, add:
   - `DATABASE_URL` — the connection string from Step 1
   - `AUTH_SECRET` — a fresh secret from `openssl rand -base64 32`
4. Click **Deploy**.

### Step 4 — Initialize the production database schema

The first deploy creates the app but not the database tables. From your
local machine, point Prisma at the **production** database and push the
schema once:

```bash
DATABASE_URL="<your-production-connection-string>" npx prisma db push
```

(Alternatively, adopt `prisma migrate deploy` with committed migration files
for a more auditable, team-friendly workflow as the project grows.)

### Step 5 — Verify

Open your `https://<your-project>.vercel.app` URL, register an account, add
a project, and check the live preview. Every subsequent `git push` to `main`
triggers an automatic redeploy.

### Notes specific to this project

- **No filesystem writes in production.** Image uploads are stored as
  base64 data URIs directly in Postgres (see [§8](#8-api-documentation)) —
  there is nothing extra to configure for uploads to work on Vercel.
- **Cold starts & Prisma.** `src/lib/db.ts` uses the standard
  `globalThis`-cached Prisma Client pattern to avoid exhausting database
  connections across hot-reloads/serverless invocations.
- **Custom domain.** Add one under Project → Settings → Domains once you're
  ready to move off the `*.vercel.app` subdomain.

---

## 11. Security Notes

- Passwords are hashed with bcrypt (cost 10) — raw passwords are never
  logged or stored.
- Sessions are signed JWTs in an **HttpOnly**, `SameSite=Lax` cookie, so
  they aren't readable from client-side JavaScript and aren't sent on
  cross-site requests; `Secure` is enabled automatically in production.
- Every API route re-derives the user id from the verified session — no
  route trusts a client-supplied user id.
- Ownership is checked on every mutation (`existing.userId !== userId` →
  `404`, not `403`, to avoid leaking resource existence).
- `AUTH_SECRET` and `DATABASE_URL` are validated at startup
  (`src/lib/env.ts`) with clear error messages if missing, rather than
  failing confusingly deep inside a request.
- `.env` / `.env.local` are git-ignored — double-check before your first
  commit that no real secrets are staged.

---

## 12. Roadmap

Ideas for extending this project further:

- [ ] Move image uploads to a dedicated object store (Vercel Blob/S3/Cloudinary)
      for larger files and CDN delivery.
- [ ] Public, shareable portfolio URLs per user (e.g. `/u/[username]`)
      instead of preview-only within the dashboard.
- [ ] Drag-and-drop reordering for skills and projects.
- [ ] Rate limiting on auth endpoints.
- [ ] Email verification / password reset via email.
- [ ] Automated tests (Vitest/Playwright) and CI on GitHub Actions.
- [ ] Normalized `Tag` model for cross-project tag filtering at scale.

---

## 13. License

Released under the [MIT License](LICENSE).
