import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [problemCount, solutionCount, partnershipCount] = await Promise.all([
      prisma.problem.count({
        where: { approvalStatus: "APPROVED", isDeleted: false },
      }),
      prisma.solution.count({
        where: { problem: { approvalStatus: "APPROVED", isDeleted: false } },
      }),
      prisma.partnership.count({
        where: {
          status: "APPROVED",
          solution: { problem: { approvalStatus: "APPROVED", isDeleted: false } },
        },
      }),
    ]);

    return NextResponse.json({
      problemCount,
      solutionCount,
      partnershipCount,
    });
  } catch (err) {
    console.error("Public stats query failed:", err);
    return NextResponse.json(
      { error: "Failed to load public stats" },
      { status: 500 }
    );
  }
}
