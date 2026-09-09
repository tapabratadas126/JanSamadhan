import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { hashPassword, verifyPassword } from "./auth";
import type { TrpcContext } from "./_core/context";

type Role = "citizen" | "university" | "industry";

function contextFor(role: Role): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "test-user",
      name: "Test User",
      organization: "Test Organization",
      email: "test@example.com",
      passwordHash: null,
      loginMethod: "email",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("JanSamadhan security boundaries", () => {
  it("hashes passwords and verifies only the original password", async () => {
    const hash = await hashPassword("a-secure-password");
    expect(hash).not.toContain("a-secure-password");
    expect(await verifyPassword("a-secure-password", hash)).toBe(true);
    expect(await verifyPassword("another-password", hash)).toBe(false);
  });

  it("prevents non-citizens from creating challenges", async () => {
    const caller = appRouter.createCaller(contextFor("university"));
    await expect(caller.challenges.create({ title: "A meaningful local challenge", description: "A sufficiently detailed description of a community need.", location: "Ranchi" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("prevents non-universities from creating proposals", async () => {
    const caller = appRouter.createCaller(contextFor("citizen"));
    await expect(caller.proposals.create({ challengeId: 1, proposalText: "A sufficiently detailed proposal that explains a solution." })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("prevents non-industry partners from creating partnerships", async () => {
    const caller = appRouter.createCaller(contextFor("university"));
    await expect(caller.partnerships.create({ proposalId: 1, partnershipDetails: "A sufficiently detailed offer of partnership support." })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
