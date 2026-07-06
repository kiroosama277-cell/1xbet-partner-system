# 1XBET Affiliate System — Windows Installation Guide

## ⚡ Quick Start (3 Steps)

1. **Install [Node.js 18+](https://nodejs.org/)** (if not installed)
2. **Double-click `SETUP.bat`** — wait until it finishes
3. **Double-click `START.bat`** — opens the server

Then open your browser:
- 🌐 Site: http://localhost:3000
- 🔐 Admin: http://localhost:3000/admin

## 🔑 Default Admin Login

| Field | Value |
|-------|-------|
| User ID | `100001` |
| Access Code | `17F6413A` |

## 🛠️ Manual Setup (if SETUP.bat fails)

Open CMD in the project folder and run:

```cmd
npm install
npx prisma generate
npx prisma db push --force-reset
npm run db:seed
npm run dev
```

## 🔧 Common Issues & Solutions

### Issue 1: Cannot login to /admin
**Run `DIAGNOSE.bat`** — it will check everything automatically.

### Issue 2: "تخطى عدد المحاولات المسموحة" (rate limited)
Too many failed login attempts. Wait 15 minutes OR reset:
```cmd
npm run db:setup
```

### Issue 3: "عنوان IP غير مصرح به"
You added IP whitelist entries. Either:
- Add your current IP to the whitelist (in admin panel → Security tab)
- Delete all entries in `IPWhitelist` table using `npx prisma studio`

### Issue 4: EPERM error in prisma generate
Close all running processes (dev server, VS Code) and retry:
```cmd
npx prisma generate
```

### Issue 5: Port 3000 already in use
Edit `package.json` and change `-p 3000` to `-p 3001`:
```json
"dev": "next dev -p 3001"
```

### Issue 6: Database locked
Stop the dev server first, then:
```cmd
del db\custom.db
npm run db:setup
```

## 📂 Important Files

| File | Purpose |
|------|---------|
| `SETUP.bat` | First-time installation script |
| `START.bat` | Daily server starter |
| `DIAGNOSE.bat` | Login troubleshooting tool |
| `.env` | Database URL and secrets |
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Creates default admin |
| `db/custom.db` | SQLite database file |
| `src/app/admin/page.tsx` | Admin dashboard |

## 🔄 Useful Commands

```cmd
npm run dev          :: Start dev server
npm run build        :: Build for production
npm run start        :: Run production build
npm run db:setup     :: Reset DB + seed admin
npm run db:seed      :: Add admin user only
npm run db:push      :: Apply schema changes
npx prisma studio    :: Browse database in browser
```

## 🌐 Production Deployment

For Vercel:
1. Push the project to GitHub
2. Import in Vercel
3. Set `DATABASE_URL` env var (use Vercel Postgres or external DB)
4. Deploy

For self-hosting:
1. Run `npm run build`
2. Run `npm run start`
3. Use a reverse proxy (Nginx/Caddy) for HTTPS
