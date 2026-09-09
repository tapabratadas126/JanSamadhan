import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getAppSessionUser } from "../auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions,
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await getAppSessionUser(opts.req);
  } catch (error) {
    console.error("[Auth] Failed to read local session:", error);
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
