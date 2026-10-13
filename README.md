# JanSamadhan

A civic problem-reporting and collaboration platform built with Next.js, Prisma, and PostgreSQL.

---

## Getting Started on a New Device

Follow these steps exactly on any fresh clone of the repo.

### 1. Clone the repo

```bash
git clone <repo-url>
cd jansamadhan
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and replace every placeholder with a real value.  
Ask the project owner for the database connection string and other credentials if you don't have them.

> **Never commit `.env`** — it is listed in `.gitignore` intentionally.  
> `.env.example` (safe placeholder values only) is what gets committed.

### 3. Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via the `postinstall` script, so the Prisma client is ready immediately.

### 4. Generate the Prisma client (if needed manually)

The step above handles this, but you can always re-run it explicitly:

```bash
npx prisma generate
```

### 5. Apply database migrations

For a development environment (creates the schema if it doesn't exist):

```bash
npx prisma db push
```

For a production/staging environment (runs migration history):

```bash
npx prisma migrate deploy
```

### 6. Run the app

```bash
# Development (with hot reload)
npm run dev

# Production-style
npm run build && npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (used by Prisma) |
| `POSTGRES_URL` | ✅ | Same connection string (used by some hosting platforms) |
| `PRISMA_DATABASE_URL` | ✅ | Same connection string (Prisma Postgres adapter fallback) |
| `JWT_SECRET` | ✅ | Long random secret for signing session tokens |
| `NEXT_PUBLIC_APP_URL` | ✅ | Full public URL of the app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ✅ | Google Maps JavaScript API key |

See [`.env.example`](.env.example) for the exact format of each variable.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Generate Prisma client, run migrations, build for production |
| `npm run db:migrate` | Run `prisma migrate dev` (create a new migration) |
| `npm run db:deploy` | Run `prisma migrate deploy` (apply migrations in CI/prod) |
| `npm run db:seed` | Seed the database with initial data |

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
