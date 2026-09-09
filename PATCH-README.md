# JanSamadhan Vercel migration patch

Copy these files into the matching paths in the existing JanSamadhan project. **Do not flatten the folders.** Keep all other original project files.

Changed paths:
- api/index.ts
- client/src/_core/hooks/useAuth.ts
- client/src/main.tsx
- client/src/pages/ChallengeForm.tsx
- package.json
- server/blobUpload.ts
- server/db.ts
- server/routers.ts
- server/storage.ts
- server/_core/context.ts
- server/_core/cookies.ts
- server/_core/env.ts
- server/_core/index.ts
- vercel.json
- vite.config.ts

## Before committing

The original project contains `pnpm-lock.yaml`, and this patch changes `package.json` by adding `@vercel/blob`. After copying the patch, run:

```bash
pnpm install
pnpm check
```

This updates `pnpm-lock.yaml` and verifies the TypeScript project before Vercel deploys it. **Commit the updated lockfile too.**

If `pnpm check` reports an error, stop and fix it before deploying.

## Required Vercel environment variables

- `DATABASE_URL` — your TiDB Cloud Starter MySQL connection string. Include TLS parameters if your TiDB connection screen provides them, e.g. `?sslaccept=strict`.
- `JWT_SECRET` — a long random secret.

The Vercel Blob store must be connected to this Vercel project and configured as **Public**, because the application stores public challenge-photo URLs and the client upload code uses `access: "public"`.

## Upload flow

Challenge images are uploaded directly from the browser to Vercel Blob through the Blob client-upload token endpoint. The image bytes do not pass through the tRPC function, avoiding Vercel's 4.5 MB function request-body limit.
