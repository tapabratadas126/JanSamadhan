# JanSamadhan Vercel migration

This package is the prepared migration of JanSamadhan away from Manus runtime services for the core app flow.

## Services
- Vercel: frontend + API
- TiDB Cloud: MySQL-compatible database (`DATABASE_URL`)
- Vercel Blob: public challenge-photo storage
- Local email/password auth: sessions are stored in TiDB

## Vercel environment variables
Set these in the JanSamadhan Vercel project for Production (and Preview if desired):

- `DATABASE_URL` — your TiDB `mysql://.../test` connection string
- `JWT_SECRET` — a long random secret

The Blob store connection should automatically add the Blob environment variables when the store is connected to the project. Do not commit those values.

## Important
1. The Blob store must be **Public**, because challenge photos are displayed by their public URLs.
2. Challenge images now upload directly from the browser to Vercel Blob. They no longer travel through the tRPC request, avoiding Vercel's 4.5 MB function request limit.
3. Existing photo rows imported from Manus still point to `/manus-storage/...`. Those old images are not automatically copied; new uploads use Vercel Blob URLs.
4. Existing Manus users who do not have `passwordHash` cannot sign in with email/password. Create new passwords/accounts for testing, or perform a separate password-reset migration.
5. Do not add Manus OAuth/Forge environment variables back for the core auth/database/photo flow.

## Deployment
Push this project to the Git repository connected to Vercel. Vercel will install dependencies and run `pnpm build`.

The `pnpm-lock.yaml` was intentionally omitted from this migration package so Vercel can regenerate it with the added `@vercel/blob` dependency. If you use pnpm locally, run `pnpm install` once before committing.
