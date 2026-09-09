import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    organization: varchar("organization", { length: 255 }),
    email: varchar("email", { length: 320 }),
    passwordHash: text("passwordHash"),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin", "citizen", "university", "industry"])
      .default("user")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  table => ({
    emailIdx: uniqueIndex("users_email_unique").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
  }),
);

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdx: index("sessions_user_idx").on(table.userId),
    expiresIdx: index("sessions_expires_idx").on(table.expiresAt),
  }),
);

export const challenges = mysqlTable(
  "challenges",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    reportedBy: int("reportedBy")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", ["open", "in_progress", "resolved"])
      .default("open")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    reporterIdx: index("challenges_reporter_idx").on(table.reportedBy),
    createdAtIdx: index("challenges_created_at_idx").on(table.createdAt),
    statusIdx: index("challenges_status_idx").on(table.status),
  }),
);

export const challengePhotos = mysqlTable(
  "challengePhotos",
  {
    id: int("id").autoincrement().primaryKey(),
    challengeId: int("challengeId")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    fileKey: varchar("fileKey", { length: 512 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    challengeIdx: index("challenge_photos_challenge_idx").on(table.challengeId),
  }),
);

export const proposals = mysqlTable(
  "proposals",
  {
    id: int("id").autoincrement().primaryKey(),
    challengeId: int("challengeId")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    universityId: int("universityId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    proposalText: text("proposalText").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    challengeIdx: index("proposals_challenge_idx").on(table.challengeId),
    universityIdx: index("proposals_university_idx").on(table.universityId),
    createdAtIdx: index("proposals_created_at_idx").on(table.createdAt),
  }),
);

export const partnerships = mysqlTable(
  "partnerships",
  {
    id: int("id").autoincrement().primaryKey(),
    proposalId: int("proposalId")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    industryId: int("industryId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    partnershipDetails: text("partnershipDetails").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    proposalIdx: index("partnerships_proposal_idx").on(table.proposalId),
    industryIdx: index("partnerships_industry_idx").on(table.industryId),
    createdAtIdx: index("partnerships_created_at_idx").on(table.createdAt),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Challenge = typeof challenges.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type Partnership = typeof partnerships.$inferSelect;
