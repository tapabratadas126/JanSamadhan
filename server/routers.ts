import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  authenticateCredentials,
  createAppSession,
  hashPassword,
  makeAppOpenId,
  normalizeEmail,
  revokeAppSession,
} from "./auth";
import * as db from "./db";

const roleSchema = z.enum(["citizen", "university", "industry"]);

const safeUser = (user: NonNullable<Awaited<ReturnType<typeof db.getUserById>>>) => ({
  id: user.id,
  name: user.name,
  organization: user.organization,
  email: user.email,
  role: user.role,
});

const roleProcedure = (role: "citizen" | "university" | "industry") =>
  protectedProcedure.use(({ ctx, next }) => {
    if (ctx.user.role !== role) {
      throw new TRPCError({ code: "FORBIDDEN", message: `${role} access required` });
    }
    return next();
  });

const citizenProcedure = roleProcedure("citizen");
const universityProcedure = roleProcedure("university");
const industryProcedure = roleProcedure("industry");

const authInput = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(128),
});

const photoInput = z.object({
  url: z.string().url(),
  fileKey: z.string().max(512).optional(),
});

export const appRouter = router({
  auth: router({
    me: publicProcedure.query(({ ctx }) => (ctx.user ? safeUser(ctx.user) : null)),

    signUp: publicProcedure
      .input(
        z.object({
          name: z.string().trim().min(2).max(120),
          organization: z.string().trim().max(255).optional(),
          email: z.string().trim().email().max(320),
          password: z.string().min(8).max(128),
          role: roleSchema,
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const email = normalizeEmail(input.email);
        if (await db.getUserByEmail(email)) {
          throw new TRPCError({ code: "CONFLICT", message: "An account with this email already exists." });
        }
        const user = await db.createUser({
          openId: makeAppOpenId(),
          name: input.name,
          organization: input.organization?.trim() || null,
          email,
          passwordHash: await hashPassword(input.password),
          loginMethod: "email",
          role: input.role,
          lastSignedIn: new Date(),
        });
        const session = await createAppSession(user.id);
        ctx.res.cookie(COOKIE_NAME, session.token, {
          ...getSessionCookieOptions(ctx.req),
          maxAge: ONE_YEAR_MS,
        });
        return safeUser(user);
      }),

    signIn: publicProcedure.input(authInput).mutation(async ({ ctx, input }) => {
      const user = await authenticateCredentials(input.email, input.password);
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email or password is incorrect." });
      }
      await db.touchUser(user.id);
      const session = await createAppSession(user.id);
      ctx.res.cookie(COOKIE_NAME, session.token, {
        ...getSessionCookieOptions(ctx.req),
        maxAge: ONE_YEAR_MS,
      });
      return safeUser(user);
    }),

    logout: publicProcedure.mutation(async ({ ctx }) => {
      await revokeAppSession(ctx.req);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  feed: router({
    get: publicProcedure.query(async () => {
      const [challenges, proposals, partnerships] = await Promise.all([
        db.listChallenges(6),
        db.listProposals(6),
        db.listPartnerships(6),
      ]);
      return { challenges, proposals, partnerships };
    }),
  }),

  challenges: router({
    list: publicProcedure.query(() => db.listChallenges()),
    getById: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(({ input }) => db.getChallengeDetail(input.id)),
    mine: citizenProcedure.query(({ ctx }) => db.listMineChallenges(ctx.user.id)),
    create: citizenProcedure
      .input(
        z.object({
          title: z.string().trim().min(8).max(200),
          description: z.string().trim().min(20).max(5000),
          location: z.string().trim().min(2).max(255),
          photos: z.array(photoInput).max(5).default([]),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const uploaded = input.photos.map(photo => ({
          url: photo.url,
          fileKey: photo.fileKey,
        }));
        const id = await db.createChallenge({
          title: input.title,
          description: input.description,
          location: input.location,
          reportedBy: ctx.user.id,
          photos: uploaded,
        });
        return { id };
      }),
  }),

  proposals: router({
    list: publicProcedure.query(() => db.listProposals()),
    mine: universityProcedure.query(({ ctx }) => db.listMineProposals(ctx.user.id)),
    create: universityProcedure
      .input(
        z.object({
          challengeId: z.number().int().positive(),
          proposalText: z.string().trim().min(30).max(6000),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const challenge = await db.getChallenge(input.challengeId);
        if (!challenge) throw new TRPCError({ code: "NOT_FOUND", message: "Challenge not found." });
        if (challenge.status !== "open") throw new TRPCError({ code: "BAD_REQUEST", message: "This challenge is no longer accepting proposals." });
        const id = await db.createProposal({ challengeId: input.challengeId, universityId: ctx.user.id, proposalText: input.proposalText });
        return { id };
      }),
  }),

  partnerships: router({
    list: publicProcedure.query(() => db.listPartnerships()),
    mine: industryProcedure.query(({ ctx }) => db.listMinePartnerships(ctx.user.id)),
    create: industryProcedure
      .input(
        z.object({
          proposalId: z.number().int().positive(),
          partnershipDetails: z.string().trim().min(30).max(6000),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const proposal = await db.getProposal(input.proposalId);
        if (!proposal) throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found." });
        const id = await db.createPartnership({ proposalId: input.proposalId, industryId: ctx.user.id, partnershipDetails: input.partnershipDetails });
        return { id };
      }),
  }),
});

export type AppRouter = typeof appRouter;
