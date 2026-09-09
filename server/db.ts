import { and, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  challengePhotos,
  challenges,
  partnerships,
  proposals,
  sessions,
  users,
  type InsertUser,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

/**
 * TiDB Cloud requires a TLS connection. mysql2 doesn't infer this from a
 * plain `DATABASE_URL` string, so when the host is a TiDB Cloud endpoint we
 * build an explicit connection config with `ssl` turned on instead of
 * passing the raw connection string straight through.
 */
function buildConnectionConfig(databaseUrl: string) {
  const url = new URL(databaseUrl);
  const isTidbCloud = url.hostname.endsWith("tidbcloud.com");

  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 4000,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ...(isTidbCloud ? { ssl: { minVersion: "TLSv1.2" as const } } : {}),
  };
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle({ connection: buildConnectionConfig(process.env.DATABASE_URL) });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Like `getDb()`, but throws instead of returning null/undefined when no
 * connection is available. This awaits `getDb()` itself (rather than
 * assuming some earlier call already populated `_db`), so it works
 * correctly even on a cold serverless start where this may be the very
 * first database call in the process.
 */
async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database is not available. Check DATABASE_URL.");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const fields = ["name", "organization", "email", "passwordHash", "loginMethod"] as const;
  for (const field of fields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  } else {
    values.lastSignedIn = new Date();
    updateSet.lastSignedIn = new Date();
  }
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function createUser(input: InsertUser) {
  const db = await requireDb();
  const result = await db.insert(users).values(input);
  const id = Number((result as any)[0]?.insertId ?? (result as any).insertId);
  const user = await getUserById(id);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return rows[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0];
}

export async function touchUser(id: number) {
  const db = await requireDb();
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, id));
}

export async function createSession(input: typeof sessions.$inferInsert) {
  const db = await requireDb();
  await db.insert(sessions).values(input);
}

export async function getUserBySessionId(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return rows[0];
}

export async function deleteSession(id: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(sessions).where(eq(sessions.id, id));
}

export async function listChallenges(limit = 48) {
  const db = await requireDb();
  const rows = await db.select().from(challenges).orderBy(desc(challenges.createdAt)).limit(limit);
  return Promise.all(rows.map(async challenge => {
    const photos = await db.select().from(challengePhotos).where(eq(challengePhotos.challengeId, challenge.id));
    const proposalRows = await db.select({ id: proposals.id }).from(proposals).where(eq(proposals.challengeId, challenge.id));
    return { ...challenge, photos, proposalCount: proposalRows.length };
  }));
}

export async function getChallengeDetail(id: number) {
  const db = await requireDb();
  const challengeRows = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
  const challenge = challengeRows[0];
  if (!challenge) return null;
  const [photos, proposalRows] = await Promise.all([
    db.select().from(challengePhotos).where(eq(challengePhotos.challengeId, id)),
    db
      .select({ proposal: proposals, university: users })
      .from(proposals)
      .innerJoin(users, eq(proposals.universityId, users.id))
      .where(eq(proposals.challengeId, id))
      .orderBy(desc(proposals.createdAt)),
  ]);
  const proposalDetails = await Promise.all(proposalRows.map(async row => {
    const partnershipRows = await db
      .select({ partnership: partnerships, industry: users })
      .from(partnerships)
      .innerJoin(users, eq(partnerships.industryId, users.id))
      .where(eq(partnerships.proposalId, row.proposal.id))
      .orderBy(desc(partnerships.createdAt));
    return { ...row.proposal, university: safeUser(row.university), partnerships: partnershipRows.map(p => ({ ...p.partnership, industry: safeUser(p.industry) })) };
  }));
  const reporter = await getUserById(challenge.reportedBy);
  return { ...challenge, reporter: reporter ? safeUser(reporter) : null, photos, proposals: proposalDetails };
}

export async function listProposals(limit = 48) {
  const db = await requireDb();
  const rows = await db
    .select({ proposal: proposals, challenge: challenges, university: users })
    .from(proposals)
    .innerJoin(challenges, eq(proposals.challengeId, challenges.id))
    .innerJoin(users, eq(proposals.universityId, users.id))
    .orderBy(desc(proposals.createdAt))
    .limit(limit);
  return Promise.all(rows.map(async row => {
    const partnershipRows = await db.select().from(partnerships).where(eq(partnerships.proposalId, row.proposal.id));
    return { ...row.proposal, challenge: row.challenge, university: safeUser(row.university), partnershipCount: partnershipRows.length };
  }));
}

export async function listPartnerships(limit = 48) {
  const db = await requireDb();
  const rows = await db
    .select({ partnership: partnerships, proposal: proposals, challenge: challenges, industry: users })
    .from(partnerships)
    .innerJoin(proposals, eq(partnerships.proposalId, proposals.id))
    .innerJoin(challenges, eq(proposals.challengeId, challenges.id))
    .innerJoin(users, eq(partnerships.industryId, users.id))
    .orderBy(desc(partnerships.createdAt))
    .limit(limit);
  return rows.map(row => ({ ...row.partnership, proposal: row.proposal, challenge: row.challenge, industry: safeUser(row.industry) }));
}

export async function listMineChallenges(userId: number) {
  const db = await requireDb();
  const rows = await db.select().from(challenges).where(eq(challenges.reportedBy, userId)).orderBy(desc(challenges.createdAt));
  return Promise.all(rows.map(async challenge => ({
    ...challenge,
    photos: await db.select().from(challengePhotos).where(eq(challengePhotos.challengeId, challenge.id)),
  })));
}

export async function listMineProposals(userId: number) {
  const db = await requireDb();
  return db
    .select({ proposal: proposals, challenge: challenges })
    .from(proposals)
    .innerJoin(challenges, eq(proposals.challengeId, challenges.id))
    .where(eq(proposals.universityId, userId))
    .orderBy(desc(proposals.createdAt));
}

export async function listMinePartnerships(userId: number) {
  const db = await requireDb();
  return db
    .select({ partnership: partnerships, proposal: proposals, challenge: challenges })
    .from(partnerships)
    .innerJoin(proposals, eq(partnerships.proposalId, proposals.id))
    .innerJoin(challenges, eq(proposals.challengeId, challenges.id))
    .where(eq(partnerships.industryId, userId))
    .orderBy(desc(partnerships.createdAt));
}

export async function createChallenge(input: {
  title: string;
  description: string;
  location: string;
  reportedBy: number;
  photos: Array<{ url: string; fileKey?: string }>;
}) {
  const db = await requireDb();
  return db.transaction(async tx => {
    const result = await tx.insert(challenges).values({
      title: input.title,
      description: input.description,
      location: input.location,
      reportedBy: input.reportedBy,
      status: "open",
    });
    const id = Number((result as any)[0]?.insertId ?? (result as any).insertId);
    if (input.photos.length > 0) {
      await tx.insert(challengePhotos).values(input.photos.map(photo => ({ challengeId: id, url: photo.url, fileKey: photo.fileKey ?? null })));
    }
    return id;
  });
}

export async function createProposal(input: { challengeId: number; universityId: number; proposalText: string }) {
  const db = await requireDb();
  const result = await db.insert(proposals).values(input);
  return Number((result as any)[0]?.insertId ?? (result as any).insertId);
}

export async function createPartnership(input: { proposalId: number; industryId: number; partnershipDetails: string }) {
  const db = await requireDb();
  const result = await db.insert(partnerships).values(input);
  return Number((result as any)[0]?.insertId ?? (result as any).insertId);
}

export async function getChallenge(id: number) {
  const db = await requireDb();
  const rows = await db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
  return rows[0];
}

export async function getProposal(id: number) {
  const db = await requireDb();
  const rows = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return rows[0];
}

function safeUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    organization: user.organization,
    email: user.email,
    role: user.role,
  };
}
