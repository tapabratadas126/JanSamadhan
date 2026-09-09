# JanSamadhan — TypeScript error-only fix

This is a SMALL PATCH ONLY. It fixes the TypeScript errors shown in the Vercel build log.

Replace these files in the existing project, preserving paths:
- server/_core/cookies.ts
- server/auth.ts
- tsconfig.json

Do NOT replace the rest of the project or the previous Vercel/Blob patch.

The fixes:
- Explicitly type forwarded-proto handling in cookies.ts.
- Use a minimal request shape in auth.ts so Express Request header typing cannot fail.
- Exclude obsolete, unused Manus sdk/oauth files from the TypeScript check.

Keep the Vercel Install Command as:
  pnpm install --no-frozen-lockfile
