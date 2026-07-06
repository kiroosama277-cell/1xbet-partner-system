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
- **Database**: SQLite (default) / PostgreSQL (production)
- **Auth**: bcrypt + HMAC sessions

## Quick Start

### Windows (Recommended)

1. Install [Node.js 18+](https://nodejs.org/)
2. Double-click `SETUP.bat`
3. Double-click `START.bat`
4. Open http://localhost:3000

### Manual Setup

```bash
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## Default Admin Credentials

| Field | Value |
|-------|-------|
| User ID | `100001` |
| Access Code | `17F6413A` |
| Admin Panel | `/admin` |
| Super Admin | `/super-admin` |

## Production Deployment

See [DEPLOY.md](./DEPLOY.md) for Vercel and VPS deployment guides.

## License

MIT License - Free for personal and commercial use.

## Support

For issues, check [INSTALL.md](./INSTALL.md) for troubleshooting guide.