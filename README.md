# 1xBet Affiliate Partner System

A professional affiliate registration and management system with multi-language support (Arabic, English, Russian).

## Features

- **Affiliate Registration System** - Modern UI with form validation
- **Admin Dashboard** - Manage registrations, commissions, activities
- **Super Admin Panel** - User management, audit logs, security settings
- **Multi-language Support** - Arabic (RTL), English, Russian
- **Security Features**:
  - bcrypt password hashing
  - Rate limiting (5 attempts / 15 min)
  - IP whitelist system
  - HMAC session authentication
  - Audit logging

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (production) / SQLite (local dev)
- **Auth**: bcrypt + HMAC sessions

## Quick Start (Local Development - SQLite)

### Windows

1. Install [Node.js 18+](https://nodejs.org/)
2. Change `prisma/schema.prisma` provider to `sqlite`:
   ```
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
3. Create `.env` file: `DATABASE_URL="file:./dev.db"`
4. Double-click `SETUP.bat`
5. Double-click `START.bat`
6. Open http://localhost:3000

### Manual Setup

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## Vercel Deployment (PostgreSQL)

### 1. Create PostgreSQL Database

Use one of these free options:
- **Vercel Postgres**: [vercel.com/storage/postgres](https://vercel.com/storage/postgres)
- **Supabase**: [supabase.com](https://supabase.com)
- **Neon**: [neon.tech](https://neon.tech)

### 2. Set Environment Variables in Vercel

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | PostgreSQL connection string (direct) |

Example:
```
DATABASE_URL="postgres://user:password@host:5432/db?pgbouncer=true"
DIRECT_URL="postgres://user:password@host:5432/db"
```

### 3. Deploy

```bash
# Push to GitHub (already done)
# Import project in Vercel
# Set environment variables
# Deploy!
```

### 4. Seed Admin User (After Deploy)

In Vercel dashboard → Settings → Functions → Run command:
```
npx tsx prisma/seed.ts
```

Or use Vercel CLI:
```bash
vercel env pull .env.local
npx prisma db push
npx tsx prisma/seed.ts
```

## Default Admin Credentials

| Field | Value |
|-------|-------|
| User ID | `100001` |
| Access Code | `17F6413A` |
| Admin Panel | `/admin` |
| Super Admin | `/super-admin` |

## License

MIT License - Free for personal and commercial use.