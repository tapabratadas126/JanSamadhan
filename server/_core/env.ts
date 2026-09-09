export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Set automatically by Vercel when a Blob store is connected to the
  // project; only needs to be set manually for local development.
  blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN ?? "",
};
