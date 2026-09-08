// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";

// server/db.ts
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar
} from "drizzle-orm/mysql-core";
var users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    organization: varchar("organization", { length: 255 }),
    email: varchar("email", { length: 320 }),
    passwordHash: text("passwordHash"),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin", "citizen", "university", "industry"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_unique").on(table.email),
    roleIdx: index("users_role_idx").on(table.role)
  })
);
var sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull()
  },
  (table) => ({
    userIdx: index("sessions_user_idx").on(table.userId),
    expiresIdx: index("sessions_expires_idx").on(table.expiresAt)
  })
);
var challenges = mysqlTable(
  "challenges",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    reportedBy: int("reportedBy").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", ["open", "in_progress", "resolved"]).default("open").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull()
  },
  (table) => ({
    reporterIdx: index("challenges_reporter_idx").on(table.reportedBy),
    createdAtIdx: index("challenges_created_at_idx").on(table.createdAt),
    statusIdx: index("challenges_status_idx").on(table.status)
  })
);
var challengePhotos = mysqlTable(
  "challengePhotos",
  {
    id: int("id").autoincrement().primaryKey(),
    challengeId: int("challengeId").notNull().references(() => challenges.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    fileKey: varchar("fileKey", { length: 512 }),
    createdAt: timestamp("createdAt").defaultNow().notNull()
  },
  (table) => ({
    challengeIdx: index("challenge_photos_challenge_idx").on(table.challengeId)
  })
);
var proposals = mysqlTable(
  "proposals",
  {
    id: int("id").autoincrement().primaryKey(),
    challengeId: int("challengeId").notNull().references(() => challenges.id, { onDelete: "cascade" }),
    universityId: int("universityId").notNull().references(() => users.id, { onDelete: "cascade" }),
    proposalText: text("proposalText").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull()
  },
  (table) => ({
    challengeIdx: index("proposals_challenge_idx").on(table.challengeId),
    universityIdx: index("proposals_university_idx").on(table.universityId),
    createdAtIdx: index("proposals_created_at_idx").on(table.createdAt)
  })
);
var partnerships = mysqlTable(
  "partnerships",
  {
    id: int("id").autoincrement().primaryKey(),
    proposalId: int("proposalId").notNull().references(() => proposals.id, { onDelete: "cascade" }),
    industryId: int("industryId").notNull().references(() => users.id, { onDelete: "cascade" }),
    partnershipDetails: text("partnershipDetails").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull()
  },
  (table) => ({
    proposalIdx: index("partnerships_proposal_idx").on(table.proposalId),
    industryIdx: index("partnerships_industry_idx").on(table.industryId),
    createdAtIdx: index("partnerships_created_at_idx").on(table.createdAt)
  })
);

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
function requireDb() {
  if (!_db) throw new Error("Database is not available");
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values = { openId: user.openId };
  const updateSet = {};
  const fields = ["name", "organization", "email", "passwordHash", "loginMethod"];
  for (const field of fields) {
    if (user[field] !== void 0) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  }
  if (user.lastSignedIn !== void 0) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  } else {
    values.lastSignedIn = /* @__PURE__ */ new Date();
    updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  }
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
async function createUser(input) {
  const db = requireDb();
  const result = await db.insert(users).values(input);
  const id = Number(result[0]?.insertId ?? result.insertId);
  const user = await getUserById(id);
  if (!user) throw new Error("Failed to create user");
  return user;
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return rows[0];
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0];
}
async function touchUser(id) {
  const db = requireDb();
  await db.update(users).set({ lastSignedIn: /* @__PURE__ */ new Date() }).where(eq(users.id, id));
}
async function createSession(input) {
  const db = requireDb();
  await db.insert(sessions).values(input);
}
async function getUserBySessionId(id) {
  const db = await getDb();
  if (!db) return void 0;
  const rows = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return rows[0];
}
async function deleteSession(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(sessions).where(eq(sessions.id, id));
}
async function listChallenges(limit = 48) {
  const db = requireDb();
  const rows = await db.select().from(challenges).orderBy(desc(challenges.createdAt)).limit(limit);
  return Promise.all(rows.map(async (challenge) => {
    const photos = await db.select().from(challengePhotos).where(eq(challengePhotos.challengeId, challenge.id));
    const proposalRows = await db.select({ id: proposals.id }).from(proposals).where(eq(proposals.challengeId, challenge.id));
    return { ...challenge, photos, proposalCount: proposalRows.length };
  }));
}
async function getChallengeDetail(id) {
  const db = requireDb();
  const challengeRows = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
  const challenge = challengeRows[0];
  if (!challenge) return null;
  const [photos, proposalRows] = await Promise.all([
    db.select().from(challengePhotos).where(eq(challengePhotos.challengeId, id)),
    db.select({ proposal: proposals, university: users }).from(proposals).innerJoin(users, eq(proposals.universityId, users.id)).where(eq(proposals.challengeId, id)).orderBy(desc(proposals.createdAt))
  ]);
  const proposalDetails = await Promise.all(proposalRows.map(async (row) => {
    const partnershipRows = await db.select({ partnership: partnerships, industry: users }).from(partnerships).innerJoin(users, eq(partnerships.industryId, users.id)).where(eq(partnerships.proposalId, row.proposal.id)).orderBy(desc(partnerships.createdAt));
    return { ...row.proposal, university: safeUser(row.university), partnerships: partnershipRows.map((p) => ({ ...p.partnership, industry: safeUser(p.industry) })) };
  }));
  const reporter = await getUserById(challenge.reportedBy);
  return { ...challenge, reporter: reporter ? safeUser(reporter) : null, photos, proposals: proposalDetails };
}
async function listProposals(limit = 48) {
  const db = requireDb();
  const rows = await db.select({ proposal: proposals, challenge: challenges, university: users }).from(proposals).innerJoin(challenges, eq(proposals.challengeId, challenges.id)).innerJoin(users, eq(proposals.universityId, users.id)).orderBy(desc(proposals.createdAt)).limit(limit);
  return Promise.all(rows.map(async (row) => {
    const partnershipRows = await db.select().from(partnerships).where(eq(partnerships.proposalId, row.proposal.id));
    return { ...row.proposal, challenge: row.challenge, university: safeUser(row.university), partnershipCount: partnershipRows.length };
  }));
}
async function listPartnerships(limit = 48) {
  const db = requireDb();
  const rows = await db.select({ partnership: partnerships, proposal: proposals, challenge: challenges, industry: users }).from(partnerships).innerJoin(proposals, eq(partnerships.proposalId, proposals.id)).innerJoin(challenges, eq(proposals.challengeId, challenges.id)).innerJoin(users, eq(partnerships.industryId, users.id)).orderBy(desc(partnerships.createdAt)).limit(limit);
  return rows.map((row) => ({ ...row.partnership, proposal: row.proposal, challenge: row.challenge, industry: safeUser(row.industry) }));
}
async function listMineChallenges(userId) {
  const db = requireDb();
  const rows = await db.select().from(challenges).where(eq(challenges.reportedBy, userId)).orderBy(desc(challenges.createdAt));
  return Promise.all(rows.map(async (challenge) => ({
    ...challenge,
    photos: await db.select().from(challengePhotos).where(eq(challengePhotos.challengeId, challenge.id))
  })));
}
async function listMineProposals(userId) {
  const db = requireDb();
  return db.select({ proposal: proposals, challenge: challenges }).from(proposals).innerJoin(challenges, eq(proposals.challengeId, challenges.id)).where(eq(proposals.universityId, userId)).orderBy(desc(proposals.createdAt));
}
async function listMinePartnerships(userId) {
  const db = requireDb();
  return db.select({ partnership: partnerships, proposal: proposals, challenge: challenges }).from(partnerships).innerJoin(proposals, eq(partnerships.proposalId, proposals.id)).innerJoin(challenges, eq(proposals.challengeId, challenges.id)).where(eq(partnerships.industryId, userId)).orderBy(desc(partnerships.createdAt));
}
async function createChallenge(input) {
  const db = requireDb();
  return db.transaction(async (tx) => {
    const result = await tx.insert(challenges).values({
      title: input.title,
      description: input.description,
      location: input.location,
      reportedBy: input.reportedBy,
      status: "open"
    });
    const id = Number(result[0]?.insertId ?? result.insertId);
    if (input.photos.length > 0) {
      await tx.insert(challengePhotos).values(input.photos.map((photo) => ({ challengeId: id, url: photo.url, fileKey: photo.fileKey ?? null })));
    }
    return id;
  });
}
async function createProposal(input) {
  const db = requireDb();
  const result = await db.insert(proposals).values(input);
  return Number(result[0]?.insertId ?? result.insertId);
}
async function createPartnership(input) {
  const db = requireDb();
  const result = await db.insert(partnerships).values(input);
  return Number(result[0]?.insertId ?? result.insertId);
}
async function getChallenge(id) {
  const db = requireDb();
  const rows = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
  return rows[0];
}
async function getProposal(id) {
  const db = requireDb();
  const rows = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return rows[0];
}
function safeUser(user) {
  return {
    id: user.id,
    name: user.name,
    organization: user.organization,
    email: user.email,
    role: user.role
  };
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/_core/sdk.ts
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/routers.ts
import { TRPCError as TRPCError2 } from "@trpc/server";
import { z } from "zod";

// server/_core/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/auth.ts
import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { parse as parseCookieHeader3 } from "cookie";
var scrypt = promisify(scryptCallback);
var PASSWORD_PREFIX = "scrypt";
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `${PASSWORD_PREFIX}$${salt}$${derived.toString("hex")}`;
}
async function verifyPassword(password, storedHash) {
  const [prefix, salt, hash] = storedHash.split("$");
  if (prefix !== PASSWORD_PREFIX || !salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
function getTokenFromRequest(req) {
  const cookies = parseCookieHeader3(req.headers.cookie ?? "");
  const cookieToken = cookies[COOKIE_NAME];
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return void 0;
}
async function createAppSession(userId) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + ONE_YEAR_MS);
  await createSession({
    id: tokenHash,
    userId,
    expiresAt
  });
  return { token: rawToken, expiresAt };
}
async function getAppSessionUser(req) {
  const rawToken = getTokenFromRequest(req);
  if (!rawToken) return null;
  const session = await getUserBySessionId(hashSessionToken(rawToken));
  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) await deleteSession(session.id);
    return null;
  }
  return await getUserById(session.userId) ?? null;
}
async function revokeAppSession(req) {
  const rawToken = getTokenFromRequest(req);
  if (rawToken) await deleteSession(hashSessionToken(rawToken));
}
function makeAppOpenId() {
  return `app_${randomUUID().replace(/-/g, "")}`;
}
async function authenticateCredentials(email, password) {
  const user = await getUserByEmail(normalizeEmail(email));
  if (!user?.passwordHash) return null;
  return await verifyPassword(password, user.passwordHash) ? user : null;
}

// server/storage.ts
function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) {
    throw new Error(
      "Storage config missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function appendHashSuffix(relKey) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { forgeUrl, forgeKey } = getForgeConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, {
    headers: { Authorization: `Bearer ${forgeKey}` }
  });
  if (!presignResp.ok) {
    const msg = await presignResp.text().catch(() => presignResp.statusText);
    throw new Error(`Storage presign failed (${presignResp.status}): ${msg}`);
  }
  const { url: s3Url } = await presignResp.json();
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const uploadResp = await fetch(s3Url, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: blob
  });
  if (!uploadResp.ok) {
    throw new Error(`Storage upload to S3 failed (${uploadResp.status})`);
  }
  return { key, url: `/manus-storage/${key}` };
}

// server/routers.ts
var roleSchema = z.enum(["citizen", "university", "industry"]);
var safeUser2 = (user) => ({
  id: user.id,
  name: user.name,
  organization: user.organization,
  email: user.email,
  role: user.role
});
var roleProcedure = (role) => protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== role) {
    throw new TRPCError2({ code: "FORBIDDEN", message: `${role} access required` });
  }
  return next();
});
var citizenProcedure = roleProcedure("citizen");
var universityProcedure = roleProcedure("university");
var industryProcedure = roleProcedure("industry");
var authInput = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128)
});
var photoInput = z.object({
  data: z.string().min(1),
  contentType: z.string().regex(/^image\//),
  fileName: z.string().max(150).optional()
});
var appRouter = router({
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user ? safeUser2(ctx.user) : null),
    signUp: publicProcedure.input(
      z.object({
        name: z.string().trim().min(2).max(120),
        organization: z.string().trim().max(255).optional(),
        email: z.string().trim().email().max(320),
        password: z.string().min(8).max(128),
        role: roleSchema
      })
    ).mutation(async ({ ctx, input }) => {
      const email = normalizeEmail(input.email);
      if (await getUserByEmail(email)) {
        throw new TRPCError2({ code: "CONFLICT", message: "An account with this email already exists." });
      }
      const user = await createUser({
        openId: makeAppOpenId(),
        name: input.name,
        organization: input.organization?.trim() || null,
        email,
        passwordHash: await hashPassword(input.password),
        loginMethod: "email",
        role: input.role,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const session = await createAppSession(user.id);
      ctx.res.cookie(COOKIE_NAME, session.token, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: ONE_YEAR_MS
      });
      return safeUser2(user);
    }),
    signIn: publicProcedure.input(authInput).mutation(async ({ ctx, input }) => {
      const user = await authenticateCredentials(input.email, input.password);
      if (!user) {
        throw new TRPCError2({ code: "UNAUTHORIZED", message: "Email or password is incorrect." });
      }
      await touchUser(user.id);
      const session = await createAppSession(user.id);
      ctx.res.cookie(COOKIE_NAME, session.token, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: ONE_YEAR_MS
      });
      return safeUser2(user);
    }),
    logout: publicProcedure.mutation(async ({ ctx }) => {
      await revokeAppSession(ctx.req);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  feed: router({
    get: publicProcedure.query(async () => {
      const [challenges2, proposals2, partnerships2] = await Promise.all([
        listChallenges(6),
        listProposals(6),
        listPartnerships(6)
      ]);
      return { challenges: challenges2, proposals: proposals2, partnerships: partnerships2 };
    })
  }),
  challenges: router({
    list: publicProcedure.query(() => listChallenges()),
    getById: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => getChallengeDetail(input.id)),
    mine: citizenProcedure.query(({ ctx }) => listMineChallenges(ctx.user.id)),
    create: citizenProcedure.input(
      z.object({
        title: z.string().trim().min(8).max(200),
        description: z.string().trim().min(20).max(5e3),
        location: z.string().trim().min(2).max(255),
        photos: z.array(photoInput).max(5).default([])
      })
    ).mutation(async ({ ctx, input }) => {
      const uploaded = [];
      for (let index2 = 0; index2 < input.photos.length; index2++) {
        const photo = input.photos[index2];
        const data = photo.data.includes(",") ? photo.data.split(",")[1] : photo.data;
        const buffer = Buffer.from(data, "base64");
        if (buffer.byteLength > 5 * 1024 * 1024) {
          throw new TRPCError2({ code: "BAD_REQUEST", message: "Each image must be smaller than 5 MB." });
        }
        const extension = (photo.fileName?.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 8) || "jpg";
        const stored = await storagePut(`challenge-photos/${ctx.user.id}/${Date.now()}-${index2}.${extension}`, buffer, photo.contentType);
        uploaded.push(stored);
      }
      const id = await createChallenge({
        title: input.title,
        description: input.description,
        location: input.location,
        reportedBy: ctx.user.id,
        photos: uploaded
      });
      return { id };
    })
  }),
  proposals: router({
    list: publicProcedure.query(() => listProposals()),
    mine: universityProcedure.query(({ ctx }) => listMineProposals(ctx.user.id)),
    create: universityProcedure.input(
      z.object({
        challengeId: z.number().int().positive(),
        proposalText: z.string().trim().min(30).max(6e3)
      })
    ).mutation(async ({ ctx, input }) => {
      const challenge = await getChallenge(input.challengeId);
      if (!challenge) throw new TRPCError2({ code: "NOT_FOUND", message: "Challenge not found." });
      if (challenge.status !== "open") throw new TRPCError2({ code: "BAD_REQUEST", message: "This challenge is no longer accepting proposals." });
      const id = await createProposal({ challengeId: input.challengeId, universityId: ctx.user.id, proposalText: input.proposalText });
      return { id };
    })
  }),
  partnerships: router({
    list: publicProcedure.query(() => listPartnerships()),
    mine: industryProcedure.query(({ ctx }) => listMinePartnerships(ctx.user.id)),
    create: industryProcedure.input(
      z.object({
        proposalId: z.number().int().positive(),
        partnershipDetails: z.string().trim().min(30).max(6e3)
      })
    ).mutation(async ({ ctx, input }) => {
      const proposal = await getProposal(input.proposalId);
      if (!proposal) throw new TRPCError2({ code: "NOT_FOUND", message: "Proposal not found." });
      const id = await createPartnership({ proposalId: input.proposalId, industryId: ctx.user.id, partnershipDetails: input.partnershipDetails });
      return { id };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await getAppSessionUser(opts.req);
    if (!user) user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
