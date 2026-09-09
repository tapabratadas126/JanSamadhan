export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  isProduction: process.env.NODE_ENV === "production",
};
