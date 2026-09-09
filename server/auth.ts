import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import type { User } from "../drizzle/schema";
import { getUserBySessionId, getUserByEmail, getUserById, createSession, deleteSession } from "./db";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const scrypt = promisify(scryptCallback);
const PASSWORD_PREFIX = "scrypt";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${PASSWORD_PREFIX}$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [prefix, salt, hash] = storedHash.split("$");
  if (prefix !== PASSWORD_PREFIX || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getTokenFromRequest(req: Request) {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const cookieToken = cookies[COOKIE_NAME];
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return undefined;
}

export async function createAppSession(userId: number) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + ONE_YEAR_MS);
  await createSession({
    id: tokenHash,
    userId,
    expiresAt,
  });
  return { token: rawToken, expiresAt };
}

export async function getAppSessionUser(req: Request): Promise<User | null> {
  const rawToken = getTokenFromRequest(req);
  if (!rawToken) return null;
  const session = await getUserBySessionId(hashSessionToken(rawToken));
  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) await deleteSession(session.id);
    return null;
  }
  return (await getUserById(session.userId)) ?? null;
}

export async function revokeAppSession(req: Request) {
  const rawToken = getTokenFromRequest(req);
  if (rawToken) await deleteSession(hashSessionToken(rawToken));
}

export function makeAppOpenId() {
  return `app_${randomUUID().replace(/-/g, "")}`;
}

export async function authenticateCredentials(email: string, password: string) {
  const user = await getUserByEmail(normalizeEmail(email));
  if (!user?.passwordHash) return null;
  return (await verifyPassword(password, user.passwordHash)) ? user : null;
}
